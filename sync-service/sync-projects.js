// sync-projects.js

const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const { CONFIG, GoogleSheetsClient, DatabaseClient } = require('./utils/syncUtils');

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
    sheetsClient = new GoogleSheetsClient();
    dbClient = new DatabaseClient();
    await dbClient.connect();

    // Fetch data from Google Sheets
    console.log(`⏳ Buscando dados da planilha '${CONFIG.spreadsheet.sheetName}'...`);
    const response = await sheetsClient.getData(
      CONFIG.spreadsheet.id,
      `${CONFIG.spreadsheet.sheetName}!${CONFIG.spreadsheet.range}`
    );

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
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = { syncProjectsFromSheets };

// =============================================================================
// RUN
// =============================================================================

// Only run if this file is executed directly
if (require.main === module) {
  syncProjectsFromSheets();
}