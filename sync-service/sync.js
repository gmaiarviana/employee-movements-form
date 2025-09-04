// sync.js

const { google } = require('googleapis');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
require('dotenv').config();

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  spreadsheet: {
    id: process.env.GOOGLE_SPREADSHEET_ID,
    sheetName: 'Baseline Contratos',
    range: process.env.GOOGLE_SHEET_RANGE || 'A:G',
  },
  serviceAccount: {
    keyPath: process.env.GOOGLE_SERVICE_ACCOUNT_PATH || '/app/credentials/service-account-key.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  },
  database: {
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'employee_movements',
    user: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD || 'app_password'
  },
  options: {
    validateIntegrity: process.env.VALIDATE_INTEGRITY === 'true'
  }
};

// =============================================================================
// GOOGLE SHEETS & DATABASE CLIENTS
// =============================================================================

async function createSheetsClient() {
  try {
    console.log('🔑 Inicializando Google Sheets com Service Account...');
    const auth = new google.auth.GoogleAuth({
      keyFile: CONFIG.serviceAccount.keyPath,
      scopes: CONFIG.serviceAccount.scopes
    });
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Cliente Google Sheets criado com sucesso');
    return sheets;
  } catch (error) {
    console.error('❌ Erro ao criar cliente Google Sheets:', error.message);
    throw error;
  }
}

async function createDbClient() {
  const client = new Client(CONFIG.database);
  try {
    await client.connect();
    console.log('✅ Conexão com banco de dados estabelecida');
    return client;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error.message);
    throw error;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function cleanValue(value) {
  return value ? String(value).trim() : null;
}

// =============================================================================
// CORE SYNC LOGIC
// =============================================================================

async function syncProjectsFromSheets() {
  let sheetsClient;
  let dbClient;
  const startTime = Date.now();

  try {
    sheetsClient = await createSheetsClient();
    dbClient = await createDbClient();

    // Fetch data from Google Sheets
    console.log(`⏳ Buscando dados da planilha '${CONFIG.spreadsheet.sheetName}'...`);
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: CONFIG.spreadsheet.id,
      range: `${CONFIG.spreadsheet.sheetName}!${CONFIG.spreadsheet.range}`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      console.log('❗ Nenhuma linha de dados encontrada na planilha.');
      return;
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);
    
    console.log('Headers encontrados na planilha (todos em minúsculas):', headers);

    // Mapeamento das colunas
    const getColumnIndex = (headerName) => {
      const normalizedHeaderName = headerName.toLowerCase().trim();
      const index = headers.findIndex(h => h.toLowerCase().trim() === normalizedHeaderName);
      if (index === -1) {
        throw new Error(`Coluna '${headerName}' não encontrada na planilha.`);
      }
      return index;
    };
    
    const projectsMap = new Map();
    let projectsFilteredOut = 0;

    // Processa de baixo para cima para manter a última ocorrência de duplicatas
    for (let i = dataRows.length - 1; i >= 0; i--) {
      const row = dataRows[i];
      const anoBase = cleanValue(row[getColumnIndex('ano base')]);

      // Requisito 1: Filtrar apenas projetos com 'Ano Base' igual a '2025'
      if (anoBase !== '2025') {
        projectsFilteredOut++;
        continue;
      }
      
      const sowPt = cleanValue(row[getColumnIndex('sow/pt')]);
      
      if (!sowPt) {
        console.log('❗ Linha ignorada: `SOW/PT` está vazio.');
        continue;
      }

      // Requisito 2: Sobrescreve o projeto se a chave (sowPt) já existir.
      // Isso garante que apenas a última ocorrência (a mais abaixo na planilha) seja mantida.
      if (!projectsMap.has(sowPt)) {
        const name = cleanValue(row[getColumnIndex('projeto')]);
        const gerenteHp = cleanValue(row[getColumnIndex('gerente hp')]);
        const projectType = cleanValue(row[getColumnIndex('tipo de projeto')]);
        const description = '';
        const gerenteIa = null;

        projectsMap.set(sowPt, {
          id: uuidv4(),
          name,
          sowPt,
          gerenteHp,
          gerenteIa,
          projectType,
          description
        });
      }
    }

    const projectsToInsert = Array.from(projectsMap.values());
    const projectsDuplicatesRemoved = dataRows.length - projectsToInsert.length - projectsFilteredOut;

    // Apagar todos os projetos existentes para fazer um Full Sync
    console.log('🗑️ Apagando todos os projetos existentes no banco de dados...');
    const deleteQuery = 'DELETE FROM hp_portfolio.projects;';
    const deleteResult = await dbClient.query(deleteQuery);
    console.log(`✅ ${deleteResult.rowCount} projetos apagados.`);
    
    let projectsInserted = 0;

    for (const project of projectsToInsert) {
      const insertQuery = `
        INSERT INTO hp_portfolio.projects(id, name, sow_pt, gerente_hp, gerente_ia, project_type, description)
        VALUES($1, $2, $3, $4, $5, $6, $7);
      `;
      
      const values = [
        project.id,
        project.name,
        project.sowPt,
        project.gerenteHp,
        project.gerenteIa,
        project.projectType,
        project.description
      ];

      await dbClient.query(insertQuery, values);
      projectsInserted++;
    }

    const totalProjectsQuery = 'SELECT COUNT(*) FROM hp_portfolio.projects;';
    const totalProjectsResult = await dbClient.query(totalProjectsQuery);
    const totalProjectsInDb = totalProjectsResult.rows[0].count;

    const endTime = Date.now();
    const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n--- Resumo da Sincronização ---');
    console.log(`⏱️ Tempo total: ${durationInSeconds} segundos`);
    console.log(`📄 Linhas lidas da planilha: ${dataRows.length}`);
    console.log(`✅ Projetos inseridos: ${projectsInserted}`);
    console.log(`➡️ Projetos duplicados desconsiderados: ${projectsDuplicatesRemoved}`);
    console.log(`🚫 Projetos filtrados (não são de 2025): ${projectsFilteredOut}`);
    console.log(`📊 Total de projetos no banco de dados: ${totalProjectsInDb}`);
    console.log('------------------------------');

  } catch (error) {
    console.error('💥 Falha na sincronização:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('🔍 Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    if (dbClient) {
      await dbClient.end();
      console.log('🔒 Conexão com banco fechada');
    }
  }
}

// =============================================================================
// RUN
// =============================================================================

syncProjectsFromSheets();