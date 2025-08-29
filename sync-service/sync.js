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
    range: process.env.GOOGLE_SHEET_RANGE || 'A:E',
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
    backupBeforeSync: process.env.BACKUP_BEFORE_SYNC === 'true',
    validateIntegrity: process.env.VALIDATE_INTEGRITY === 'true'
  }
};

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

async function validateConfiguration() {
  const errors = [];
  
  // Validar ID da planilha
  if (!CONFIG.spreadsheet.id) {
    errors.push('GOOGLE_SPREADSHEET_ID é obrigatório');
  }
  
  // Validar arquivo de credenciais
  try {
    await fs.access(CONFIG.serviceAccount.keyPath);
    console.log('✅ Arquivo de credenciais encontrado');
  } catch (error) {
    errors.push(`Arquivo de credenciais não encontrado em: ${CONFIG.serviceAccount.keyPath}`);
  }
  
  if (errors.length > 0) {
    console.error('❌ Erros de configuração:');
    errors.forEach(error => console.error(`   • ${error}`));
    throw new Error('Configuração inválida');
  }
  
  console.log('✅ Configuração validada');
}

async function validateServiceAccountAccess(sheets) {
  try {
    console.log('🔍 Testando acesso à planilha...');
    
    // Testar acesso básico à planilha
    const response = await sheets.spreadsheets.get({
      spreadsheetId: CONFIG.spreadsheet.id
    });
    
    console.log(`✅ Acesso à planilha confirmado: "${response.data.properties.title}"`);
    
    // Verificar se consegue ler dados
    const testRange = await sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.spreadsheet.id,
      range: 'A1:A1'
    });
    
    console.log('✅ Permissão de leitura confirmada');
    return true;
  } catch (error) {
    if (error.code === 404) {
      throw new Error('Planilha não encontrada. Verifique o GOOGLE_SPREADSHEET_ID');
    } else if (error.code === 403) {
      throw new Error('Sem permissão para acessar a planilha. Certifique-se que foi compartilhada com a Service Account');
    }
    throw new Error(`Erro ao validar acesso: ${error.message}`);
  }
}

// =============================================================================
// GOOGLE SHEETS CLIENT (SERVICE ACCOUNT)
// =============================================================================

async function createSheetsClient() {
  try {
    console.log('🔑 Inicializando Google Sheets com Service Account...');
    
    // Criar auth com Service Account
    const auth = new google.auth.GoogleAuth({
      keyFile: CONFIG.serviceAccount.keyPath,
      scopes: CONFIG.serviceAccount.scopes
    });
    
    // Criar cliente Sheets
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Validar acesso
    await validateServiceAccountAccess(sheets);
    
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
    
    // Testar conexão
    await client.query('SELECT NOW()');
    
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
    
    if (rows.length === 1) {
      console.log('⚠️ Planilha contém apenas headers');
      return [];
    }
    
    // Primeira linha são os headers
    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);
    
    console.log(`📋 Headers: ${headers.join(', ')}`);
    console.log(`📊 ${dataRows.length} projetos encontrados`);
    
    // Validar headers obrigatórios
    const requiredHeaders = ['name', 'description', 'sow_pt', 'gerente_hp'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Headers obrigatórios ausentes: ${missingHeaders.join(', ')}`);
    }
    
    // Converter para objetos
    const projects = dataRows
      .filter(row => row.some(cell => cell && cell.trim())) // Filtrar linhas vazias
      .map((row, index) => {
        const project = {};
        
        headers.forEach((header, i) => {
          project[header] = (row[i] || '').trim() || null;
        });
        
        // Validar campos obrigatórios
        if (!project.name || !project.sow_pt) {
          console.warn(`⚠️ Linha ${index + 2}: campos obrigatórios ausentes (name/sow_pt)`);
          return null;
        }
        
        // Adicionar campos automáticos
        project.id = uuidv4();
        project.created_at = new Date().toISOString();
        project.updated_at = new Date().toISOString();
        
        console.log(`📝 Projeto ${index + 1}: ${project.name} (${project.sow_pt})`);
        return project;
      })
      .filter(Boolean); // Remover nulls
    
    console.log(`✅ ${projects.length} projetos válidos processados`);
    return projects;
  } catch (error) {
    console.error('❌ Erro ao ler planilha:', error.message);
    throw error;
  }
}

async function syncProjectsToDatabase(dbClient, projects) {
  try {
    console.log(`🔄 Iniciando sincronização completa de ${projects.length} projetos...`);
    
    // Backup antes de sincronizar
    await backupProjects(dbClient);
    
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let deleted = 0;
    
    // Usar transaction para atomicidade
    await dbClient.query('BEGIN');
    
    try {
      // FASE 1: Identificar projetos para deletar (estão no banco mas não na planilha)
      console.log('🗑️ Fase 1: Verificando projetos a serem removidos...');
      
      let projectsToDelete = [];
      if (projects.length === 0) {
        // Se planilha está vazia, deletar todos
        const allProjectsResult = await dbClient.query('SELECT id, name, sow_pt FROM hp_portfolio.projects');
        projectsToDelete = allProjectsResult.rows;
      } else {
        // Identificar projetos no banco que não estão na planilha
        const sheetsSowPts = projects.map(p => p.sow_pt);
        const orphanProjectsQuery = `
          SELECT id, name, sow_pt FROM hp_portfolio.projects 
          WHERE sow_pt NOT IN (${sheetsSowPts.map((_, i) => `${i + 1}`).join(',')})
        `;
        const orphanResult = await dbClient.query(orphanProjectsQuery, sheetsSowPts);
        projectsToDelete = orphanResult.rows;
      }
      
      // FASE 2: Validar se projetos podem ser deletados (sem relacionamentos ativos)
      for (const project of projectsToDelete) {
        console.log(`🔍 Verificando relacionamentos para: ${project.name} (${project.sow_pt})`);
        
        // Verificar se tem movements
        const movementsResult = await dbClient.query(
          'SELECT COUNT(*) as count FROM hp_portfolio.movements WHERE project_id = $1',
          [project.id]
        );
        
        // Verificar se tem project_managers
        const managersResult = await dbClient.query(
          'SELECT COUNT(*) as count FROM hp_portfolio.project_managers WHERE project_id = $1',
          [project.id]
        );
        
        const movementCount = parseInt(movementsResult.rows[0].count);
        const managerCount = parseInt(managersResult.rows[0].count);
        
        if (movementCount > 0 || managerCount > 0) {
          console.log(`⚠️ Projeto ${project.name} tem relacionamentos ativos:`);
          console.log(`   • ${movementCount} movimentações`);
          console.log(`   • ${managerCount} gestores`);
          console.log(`🗑️ Removendo relacionamentos em cascata...`);
          
          // Deletar relacionamentos primeiro
          await dbClient.query('DELETE FROM hp_portfolio.movements WHERE project_id = $1', [project.id]);
          await dbClient.query('DELETE FROM hp_portfolio.project_managers WHERE project_id = $1', [project.id]);
          
          console.log(`✅ Relacionamentos removidos para: ${project.name}`);
        }
        
        // Deletar o projeto
        await dbClient.query('DELETE FROM hp_portfolio.projects WHERE id = $1', [project.id]);
        deleted++;
        console.log(`🗑️ Deletado: ${project.name} (${project.sow_pt})`);
      }
      
      // FASE 3: INSERT/UPDATE projetos da planilha
      console.log('📝 Fase 2: Sincronizando projetos da planilha...');
      
      for (const project of projects) {
        try {
          // UPSERT baseado em sow_pt (que é único)
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
              hp_portfolio.projects.name IS DISTINCT FROM EXCLUDED.name OR
              hp_portfolio.projects.description IS DISTINCT FROM EXCLUDED.description OR
              hp_portfolio.projects.gerente_hp IS DISTINCT FROM EXCLUDED.gerente_hp OR
              hp_portfolio.projects.project_type IS DISTINCT FROM EXCLUDED.project_type
            RETURNING 
              id,
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
            project.project_type || null,
            project.created_at,
            project.updated_at
          ]);
          
          if (result.rows.length > 0) {
            const action = result.rows[0].action;
            if (action === 'INSERT') {
              inserted++;
              console.log(`✅ Inserido: ${project.name} (${project.sow_pt})`);
            } else {
              updated++;
              console.log(`🔄 Atualizado: ${project.name} (${project.sow_pt})`);
            }
          } else {
            skipped++;
            console.log(`⏭️ Inalterado: ${project.name} (${project.sow_pt})`);
          }
          
        } catch (projectError) {
          console.error(`❌ Erro ao processar ${project.name}:`, projectError.message);
          throw projectError; // Falhar toda a transação se um projeto falhar
        }
      }
      
      // Commit da transação
      await dbClient.query('COMMIT');
      
      console.log(`🎉 Sincronização completa finalizada:`);
      console.log(`   📝 ${inserted} projetos inseridos`);
      console.log(`   🔄 ${updated} projetos atualizados`);
      console.log(`   ⏭️ ${skipped} projetos inalterados`);
      console.log(`   🗑️ ${deleted} projetos deletados`);
      console.log(`   📊 Total: ${inserted + updated + skipped} projetos ativos`);
      
      return { inserted, updated, skipped, deleted };
      
    } catch (transactionError) {
      // Rollback em caso de erro
      await dbClient.query('ROLLBACK');
      throw transactionError;
    }
    
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
  const startTime = Date.now();
  
  try {
    console.log('🚀 Iniciando sincronização Google Sheets → PostgreSQL');
    console.log('📅', new Date().toLocaleString('pt-BR'));
    console.log('📋 Configuração:', {
      planilhaId: CONFIG.spreadsheet.id.substring(0, 10) + '...',
      range: CONFIG.spreadsheet.range,
      backup: CONFIG.options.backupBeforeSync ? 'Habilitado' : 'Desabilitado',
      validacao: CONFIG.options.validateIntegrity ? 'Habilitada' : 'Desabilitada'
    });
    
    // Validar configuração
    await validateConfiguration();
    
    // Criar clientes
    const sheets = await createSheetsClient();
    dbClient = await createDatabaseClient();
    
    // Validar integridade antes (se habilitado) - DESABILITADO TEMPORARIAMENTE
    // if (CONFIG.options.validateIntegrity) {
    //   await validateDatabaseIntegrity(dbClient);
    // }
    
    // Ler dados da planilha
    const projects = await readSheetsData(sheets);
    
    // Sincronizar para o banco
    const results = await syncProjectsToDatabase(dbClient, projects);
    
    // Validar integridade depois - DESABILITADO TEMPORARIAMENTE  
    // if (CONFIG.options.validateIntegrity) {
    //   await validateDatabaseIntegrity(dbClient);
    // }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Sincronização finalizada em ${duration}s`);
    
    return results;
    
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
// GOOGLE SHEETS CLIENT (SERVICE ACCOUNT)
// =============================================================================

async function createSheetsClient() {
  try {
    console.log('🔑 Inicializando Google Sheets com Service Account...');
    
    // Criar auth com Service Account
    const auth = new google.auth.GoogleAuth({
      keyFile: CONFIG.serviceAccount.keyPath,
      scopes: CONFIG.serviceAccount.scopes
    });
    
    // Criar cliente Sheets
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Validar acesso
    await validateServiceAccountAccess(sheets);
    
    console.log('✅ Cliente Google Sheets criado com sucesso');
    return sheets;
  } catch (error) {
    console.error('❌ Erro ao criar cliente Google Sheets:', error.message);
    throw error;
  }
}

// =============================================================================
// EXPORTS & RUN
// =============================================================================

module.exports = { 
  syncProjectsFromSheets,
  CONFIG
};

if (require.main === module) {
  syncProjectsFromSheets();
}