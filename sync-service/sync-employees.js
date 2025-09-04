// sync-employees.js
// Script para sincronizar funcionários da planilha Google Sheets com o banco de dados
//
// =============================================================================
// EXECUÇÃO VIA DOCKER
// =============================================================================
//
// 1. Configurar arquivo .env no diretório sync-service/
// 2. Colocar credenciais do Google em sync-service/credentials/service-account-key.json
// 3. Executar via Docker Compose:
//
//    # Construir e executar o serviço de sync
//    docker-compose --profile sync build sync
//    
//    # Executar sincronização de funcionários
//    docker-compose --profile sync run --rm sync node sync-employees.js
//
//    # Ou executar todos os scripts de sync
//    docker-compose --profile sync up sync
//
// 4. Verificar logs para acompanhar o progresso
//
// =============================================================================

const { GoogleSheetsClient, DatabaseClient, CONFIG } = require('./utils/syncUtils');

// =============================================================================
// CONFIGURATION FOR EMPLOYEES SYNC
// =============================================================================

const EMPLOYEES_CONFIG = {
  spreadsheet: {
    id: CONFIG.spreadsheet.id,
    sheetName: 'Atlantes',
    range: 'A:Z' // Range amplo para capturar todas as colunas
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Remove duplicatas baseado no email
 */
function removeDuplicatesByEmail(employees) {
  const seen = new Set();
  return employees.filter(employee => {
    const email = employee.email?.toLowerCase();
    if (!email || seen.has(email)) {
      return false;
    }
    seen.add(email);
    return true;
  });
}

/**
 * Mapeia os dados da planilha para o formato do banco de dados
 */
function mapSheetDataToDatabase(sheetData) {
  if (!sheetData || sheetData.length === 0) {
    return [];
  }

  const headers = sheetData[0]; // Primeira linha contém os cabeçalhos
  const rows = sheetData.slice(1); // Demais linhas contêm os dados

  // Mapear índices das colunas
  const columnMap = {
    id: headers.findIndex(h => h?.toLowerCase().includes('matricula ia')),
    nome: headers.findIndex(h => h?.toLowerCase().includes('nome')),
    email: headers.findIndex(h => h?.toLowerCase().includes('email ia')),
    funcao: headers.findIndex(h => h?.toLowerCase().includes('perfil')),
    employeeIdHp: headers.findIndex(h => h?.toLowerCase().includes('employee id')),
    dataNascimento: headers.findIndex(h => h?.toLowerCase().includes('data de nascimento')),
    escolaridade: headers.findIndex(h => h?.toLowerCase().includes('escolaridade')),
    formacao: headers.findIndex(h => h?.toLowerCase().includes('graduação')),
    empresa: headers.findIndex(h => h?.toLowerCase().includes('empresa')),
    cpf: headers.findIndex(h => h?.toLowerCase().includes('cpf')),
    rg: headers.findIndex(h => h?.toLowerCase().includes('rg')),
    situacao: headers.findIndex(h => h?.toLowerCase().includes('situação') || h?.toLowerCase().includes('situacao'))
  };

  console.log('📋 Mapeamento de colunas encontrado:', columnMap);

  return rows.map((row, index) => {
    const employee = {
      id: row[columnMap.id] || '',
      nome: row[columnMap.nome] || '',
      email: row[columnMap.email] || '',
      funcao: row[columnMap.funcao] || '',
      employeeIdHp: row[columnMap.employeeIdHp] || '',
      dataNascimento: row[columnMap.dataNascimento] || '',
      escolaridade: row[columnMap.escolaridade] || '',
      formacao: row[columnMap.formacao] || '',
      empresa: row[columnMap.empresa] || '',
      cpf: row[columnMap.cpf] || '',
      rg: row[columnMap.rg] || '',
      situacao: row[columnMap.situacao] || ''
    };

    // Garantir que o id seja único e baseado na Matricula IA
    if (!employee.id && employee.email) {
      // Fallback: usar email se Matricula IA não estiver disponível
      employee.id = employee.email.split('@')[0].substring(0, 10).toLowerCase();
    } else if (!employee.id) {
      // Fallback final: usar índice
      employee.id = `emp_${index + 1}`;
    }

    return employee;
  }).filter(emp => emp.email && emp.id); // Filtrar apenas registros com email e id
}

/**
 * Formatar data de nascimento para o formato do banco (YYYY-MM-DD)
 */
function formatDateOfBirth(dateString) {
  if (!dateString) return null;
  
  try {
    // Tentar diferentes formatos de data
    let date;
    
    if (dateString.includes('/')) {
      // Formato DD/MM/YYYY
      const [day, month, year] = dateString.split('/');
      date = new Date(year, month - 1, day);
    } else if (dateString.includes('-')) {
      // Formato YYYY-MM-DD ou DD-MM-YYYY
      const parts = dateString.split('-');
      if (parts[0].length === 4) {
        date = new Date(dateString); // YYYY-MM-DD
      } else {
        // DD-MM-YYYY
        const [day, month, year] = parts;
        date = new Date(year, month - 1, day);
      }
    } else {
      return null;
    }

    if (isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString().split('T')[0]; // Retorna YYYY-MM-DD
  } catch (error) {
    console.warn(`⚠️  Erro ao formatar data: ${dateString}`, error.message);
    return null;
  }
}

// =============================================================================
// MAIN SYNC FUNCTION
// =============================================================================

async function syncEmployees() {
  const sheetsClient = new GoogleSheetsClient();
  const dbClient = new DatabaseClient();

  try {
    console.log('🚀 Iniciando sincronização de funcionários...');
    console.log('📊 Configuração:', EMPLOYEES_CONFIG);

    // 1. Conectar com Google Sheets
    console.log('\n📋 Conectando com Google Sheets...');
    await sheetsClient.initialize();

    // 2. Conectar com banco de dados
    console.log('🗄️  Conectando com banco de dados...');
    await dbClient.connect();

    // 3. Ler dados da aba 'Atlantes'
    console.log(`\n📖 Lendo dados da aba '${EMPLOYEES_CONFIG.spreadsheet.sheetName}'...`);
    const response = await sheetsClient.getData(
      EMPLOYEES_CONFIG.spreadsheet.id,
      `${EMPLOYEES_CONFIG.spreadsheet.sheetName}!${EMPLOYEES_CONFIG.spreadsheet.range}`
    );

    const sheetData = response.data.values;
    console.log(`📊 Total de linhas lidas: ${sheetData ? sheetData.length : 0}`);

    if (!sheetData || sheetData.length === 0) {
      console.log('⚠️  Nenhum dado encontrado na planilha');
      return;
    }

    // 4. Mapear dados da planilha
    console.log('\n🗺️  Mapeando dados da planilha...');
    const mappedEmployees = mapSheetDataToDatabase(sheetData);
    console.log(`📝 Funcionários mapeados: ${mappedEmployees.length}`);

    // 5. Filtrar funcionários com situação 'Atuando no Projeto'
    console.log('\n🔍 Filtrando funcionários com situação "Atuando no Projeto"...');
    const activeEmployees = mappedEmployees.filter(emp => 
      emp.situacao?.toLowerCase().includes('atuando no projeto') ||
      emp.situacao?.toLowerCase().includes('atuando')
    );
    console.log(`✅ Funcionários ativos encontrados: ${activeEmployees.length}`);

    // 6. Remover duplicatas por email
    console.log('\n🔄 Removendo duplicatas por email...');
    const uniqueEmployees = removeDuplicatesByEmail(activeEmployees);
    console.log(`🎯 Funcionários únicos após remoção de duplicatas: ${uniqueEmployees.length}`);

    // 7. Full sync: apagar dados existentes
    console.log('\n🗑️  Executando FULL SYNC - removendo dados existentes...');
    await dbClient.query('DELETE FROM hp_portfolio.movements');
    await dbClient.query('DELETE FROM core.employees');
    console.log('✅ Dados existentes removidos de ambas as tabelas (movements e employees)');

    // 8. Inserir novos dados
    console.log('\n💾 Inserindo novos funcionários...');
    let insertedCount = 0;
    let errorCount = 0;

    for (const employee of uniqueEmployees) {
      try {
        const insertQuery = `
          INSERT INTO core.employees (id, name, email, funcao_atlantico, company, cpf, rg, data_nascimento, nivel_escolaridade, formacao)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;

        const values = [
          employee.id,
          employee.nome,
          employee.email.toLowerCase(),
          employee.funcao,
          'Instituto Atlântico', // company hardcoded como 'Instituto Atlântico'
          null, // cpf hardcoded como null
          null, // rg hardcoded como null
          formatDateOfBirth(employee.dataNascimento),
          employee.escolaridade || null,
          employee.formacao || null
        ];

        await dbClient.query(insertQuery, values);
        insertedCount++;
        
        if (insertedCount % 10 === 0) {
          console.log(`📝 Inseridos: ${insertedCount}/${uniqueEmployees.length}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Erro ao inserir funcionário ${employee.nome} (${employee.email}):`, error.message);
      }
    }

    // 9. Resumo da sincronização
    console.log('\n📊 RESUMO DA SINCRONIZAÇÃO');
    console.log('='.repeat(50));
    console.log(`📖 Total de linhas lidas da planilha: ${sheetData.length - 1}`); // -1 para excluir cabeçalho
    console.log(`🗺️  Funcionários mapeados: ${mappedEmployees.length}`);
    console.log(`✅ Funcionários ativos filtrados: ${activeEmployees.length}`);
    console.log(`🎯 Funcionários únicos (sem duplicatas): ${uniqueEmployees.length}`);
    console.log(`💾 Funcionários inseridos com sucesso: ${insertedCount}`);
    console.log(`❌ Erros durante inserção: ${errorCount}`);
    console.log('='.repeat(50));
    
    if (insertedCount > 0) {
      console.log('🎉 Sincronização concluída com sucesso!');
    } else {
      console.log('⚠️  Sincronização concluída, mas nenhum funcionário foi inserido.');
    }

  } catch (error) {
    console.error('💥 Erro durante a sincronização:', error);
    throw error;
  } finally {
    // Fechar conexões
    try {
      await dbClient.end();
    } catch (error) {
      console.error('Erro ao fechar conexão com banco:', error.message);
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = { syncEmployees };

// =============================================================================
// EXECUTION
// =============================================================================

// Executar se chamado diretamente
if (require.main === module) {
  console.log('🐳 Executando sync-employees em ambiente Docker...');
  console.log('📋 Configurações do ambiente:');
  console.log(`   - DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   - DB_PORT: ${process.env.DB_PORT || '5432'}`);
  console.log(`   - DB_NAME: ${process.env.DB_NAME || 'employee_movements'}`);
  console.log(`   - GOOGLE_SPREADSHEET_ID: ${process.env.GOOGLE_SPREADSHEET_ID ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   - Service Account: ${process.env.GOOGLE_SERVICE_ACCOUNT_PATH || '/app/credentials/service-account-key.json'}`);
  
  syncEmployees()
    .then(() => {
      console.log('\n✨ Script finalizado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script falhou:', error);
      console.error('\n🔍 Verificações sugeridas:');
      console.error('   1. ✅ Arquivo .env está configurado?');
      console.error('   2. ✅ Credenciais do Google estão em /app/credentials/?');
      console.error('   3. ✅ Banco de dados está acessível?');
      console.error('   4. ✅ GOOGLE_SPREADSHEET_ID está correto?');
      process.exit(1);
    });
}
