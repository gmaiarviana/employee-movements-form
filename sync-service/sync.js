const { google } = require('googleapis');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  spreadsheet: {
    id: process.env.GOOGLE_SPREADSHEET_ID,
    range: process.env.GOOGLE_SHEET_RANGE || 'A:E', // A até E (5 colunas)
  },
  oauth: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'urn:ietf:wg:oauth:2.0:oob', // Para aplicações desktop
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    tokenPath: '/app/credentials/token.json'
  },
  database: {
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'employee_movements',
    user: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD || 'app_password'
  }
};

// =============================================================================
// OAUTH HELPER FUNCTIONS
// =============================================================================

async function saveToken(token) {
  try {
    await fs.mkdir(path.dirname(CONFIG.oauth.tokenPath), { recursive: true });
    await fs.writeFile(CONFIG.oauth.tokenPath, JSON.stringify(token));
    console.log('🔐 Token salvo em:', CONFIG.oauth.tokenPath);
  } catch (error) {
    console.error('❌ Erro ao salvar token:', error.message);
  }
}

async function loadToken() {
  try {
    const tokenData = await fs.readFile(CONFIG.oauth.tokenPath, 'utf8');
    return JSON.parse(tokenData);
  } catch (error) {
    return null; // Token não existe ainda
  }
}

async function getAuthorizedClient() {
  const oAuth2Client = new google.auth.OAuth2(
    CONFIG.oauth.clientId,
    CONFIG.oauth.clientSecret,
    CONFIG.oauth.redirectUri
  );

  // Tentar carregar token existente
  let token = await loadToken();

  if (!token) {
    // Primeira vez - precisa autorizar
    console.log('🔑 Primeira execução - autorização necessária');
    
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: CONFIG.oauth.scopes,
    });

    console.log('\n📋 INSTRUÇÕES DE AUTORIZAÇÃO:');
    console.log('1. Abra esta URL no seu browser:');
    console.log('   ', authUrl);
    console.log('\n2. Faça login com sua conta Google');
    console.log('3. Autorize o acesso à planilha');
    console.log('4. Copie o código de autorização e execute:');
    console.log(`   docker-compose run --rm sync node -e "require('./sync.js').setAuthCode('COLE_CODIGO_AQUI')"`);
    console.log('\n⏳ Aguardando autorização...');
    
    process.exit(0);
  }

  // Token existe - configurar cliente
  oAuth2Client.setCredentials(token);

  // Verificar se token precisa renovação
  try {
    await oAuth2Client.getRequestHeaders();
  } catch (error) {
    if (error.message.includes('invalid_grant')) {
      console.log('🔄 Token expirado, removendo...');
      await fs.unlink(CONFIG.oauth.tokenPath).catch(() => {});
      throw new Error('Token expirado. Execute novamente para re-autorizar.');
    }
  }

  return oAuth2Client;
}

// Função para definir código de autorização (chamada manualmente)
async function setAuthCode(code) {
  const oAuth2Client = new google.auth.OAuth2(
    CONFIG.oauth.clientId,
    CONFIG.oauth.clientSecret,
    CONFIG.oauth.redirectUri
  );

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    await saveToken(tokens);
    console.log('✅ Autorização concluída! Execute novamente para sincronizar.');
  } catch (error) {
    console.error('❌ Erro na autorização:', error.message);
  }
}

// =============================================================================
// GOOGLE SHEETS CLIENT
// =============================================================================

async function createSheetsClient() {
  try {
    console.log('🔑 Inicializando cliente Google Sheets OAuth...');
    
    // Obter cliente autorizado
    const auth = await getAuthorizedClient();
    
    // Criar cliente Sheets
    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('✅ Cliente Google Sheets criado com sucesso');
    return sheets;
  } catch (error) {
    console.error('❌ Erro ao criar cliente Google Sheets:', error.message);
    throw error;
  }
}

// =============================================================================
// DATABASE CLIENT  
// =============================================================================

async function createDatabaseClient() {
  try {
    console.log('🐘 Conectando ao PostgreSQL...');
    
    const client = new Client(CONFIG.database);
    await client.connect();
    
    console.log('✅ Conectado ao PostgreSQL com sucesso');
    return client;
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error.message);
    throw error;
  }
}

// =============================================================================
// DATA SYNC FUNCTIONS
// =============================================================================

async function readSheetsData(sheets) {
  try {
    console.log(`📊 Lendo dados da planilha ${CONFIG.spreadsheet.id}...`);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.spreadsheet.id,
      range: CONFIG.spreadsheet.range
    });
    
    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      console.log('⚠️ Planilha vazia');
      return [];
    }
    
    // Primeira linha são os headers
    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    console.log(`📋 Headers encontrados: ${headers.join(', ')}`);
    console.log(`📊 ${dataRows.length} linhas de dados encontradas`);
    
    // Converter para objetos
    const projects = dataRows.map((row, index) => {
      const project = {};
      headers.forEach((header, i) => {
        project[header.toLowerCase().trim()] = row[i] || null;
      });
      
      // Adicionar campos automáticos
      project.id = uuidv4();
      project.created_at = new Date().toISOString();
      project.updated_at = new Date().toISOString();
      
      console.log(`📝 Projeto ${index + 1}:`, {
        name: project.name,
        sow_pt: project.sow_pt,
        project_type: project.project_type
      });
      
      return project;
    });
    
    return projects;
  } catch (error) {
    console.error('❌ Erro ao ler planilha:', error.message);
    throw error;
  }
}

async function syncToDatabase(dbClient, projects) {
  try {
    console.log(`🔄 Sincronizando ${projects.length} projetos...`);
    
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const project of projects) {
      try {
        // UPSERT: INSERT ou UPDATE baseado no sow_pt (que é único)
        const upsertQuery = `
          INSERT INTO hp_portfolio.projects (
            id, name, description, sow_pt, gerente_hp, project_type, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (sow_pt) 
          DO UPDATE SET 
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            gerente_hp = EXCLUDED.gerente_hp,
            project_type = EXCLUDED.project_type,
            updated_at = EXCLUDED.updated_at
          WHERE 
            hp_portfolio.projects.name != EXCLUDED.name OR
            hp_portfolio.projects.description != EXCLUDED.description OR
            hp_portfolio.projects.gerente_hp != EXCLUDED.gerente_hp OR
            hp_portfolio.projects.project_type != EXCLUDED.project_type
          RETURNING 
            CASE 
              WHEN xmax = 0 THEN 'INSERT'
              ELSE 'UPDATE'
            END as action
        `;
        
        const result = await dbClient.query(upsertQuery, [
          project.id,
          project.name,
          project.description,
          project.sow_pt,
          project.gerente_hp,
          project.project_type,
          project.created_at,
          project.updated_at
        ]);
        
        if (result.rows.length > 0) {
          const action = result.rows[0].action;
          if (action === 'INSERT') {
            insertedCount++;
            console.log(`✅ Projeto inserido: ${project.name} (${project.sow_pt})`);
          } else {
            updatedCount++;
            console.log(`🔄 Projeto atualizado: ${project.name} (${project.sow_pt})`);
          }
        } else {
          skippedCount++;
          console.log(`⏭️ Projeto inalterado: ${project.name} (${project.sow_pt})`);
        }
        
      } catch (insertError) {
        console.error(`❌ Erro ao processar projeto ${project.name}:`, insertError.message);
      }
    }
    
    console.log(`🎉 Sincronização concluída:`);
    console.log(`   📝 ${insertedCount} projetos inseridos`);
    console.log(`   🔄 ${updatedCount} projetos atualizados`);
    console.log(`   ⏭️ ${skippedCount} projetos inalterados`);
    console.log(`   📊 Total processado: ${insertedCount + updatedCount + skippedCount}/${projects.length}`);
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error.message);
    throw error;
  }
}

// =============================================================================
// MAIN SYNC FUNCTION
// =============================================================================

async function syncProjectsFromSheets() {
  let dbClient;
  
  try {
    console.log('🚀 Iniciando sincronização Google Sheets → PostgreSQL');
    console.log('⏰', new Date().toISOString());
    
    // Validar configuração OAuth
    if (!CONFIG.spreadsheet.id) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }
    
    if (!CONFIG.oauth.clientId || !CONFIG.oauth.clientSecret) {
      throw new Error('GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET são obrigatórios');
    }
    
    // Criar clientes
    const sheets = await createSheetsClient();
    dbClient = await createDatabaseClient();
    
    // Ler dados da planilha
    const projects = await readSheetsData(sheets);
    
    if (projects.length === 0) {
      console.log('⚠️ Nenhum projeto para sincronizar');
      return;
    }
    
    // Sincronizar para o banco
    await syncToDatabase(dbClient, projects);
    
    console.log('✅ Sincronização finalizada com sucesso!');
    
  } catch (error) {
    console.error('💥 Erro na sincronização:', error.message);
    process.exit(1);
  } finally {
    if (dbClient) {
      await dbClient.end();
      console.log('🔒 Conexão com banco fechada');
    }
  }
}

// =============================================================================
// EXPORTS & RUN
// =============================================================================

// Exportar função para autorização manual
module.exports = { setAuthCode, syncProjectsFromSheets };

if (require.main === module) {
  syncProjectsFromSheets();
}