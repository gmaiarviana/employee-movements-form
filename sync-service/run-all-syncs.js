// run-all-syncs.js
// Script para executar todas as sincronizações em sequência
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
//    # Executar todas as sincronizações
//    docker-compose --profile sync run --rm sync node run-all-syncs.js
//
// 4. Verificar logs para acompanhar o progresso
//
// =============================================================================

const { syncProjectsFromSheets } = require('./sync-projects');
const { syncEmployees } = require('./sync-employees');

// =============================================================================
// MAIN SYNC FUNCTION
// =============================================================================

async function runAllSyncs() {
  const startTime = Date.now();
  
  console.log('🚀 Iniciando sincronização completa...');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('=====================================\n');

  try {
    // Etapa 1: Sincronizar Projetos
    console.log('📋 ETAPA 1: Sincronizando projetos da planilha...');
    console.log('⏳ Aguarde enquanto os projetos são sincronizados...\n');
    
    const projectsStartTime = Date.now();
    await syncProjectsFromSheets();
    const projectsEndTime = Date.now();
    const projectsDuration = ((projectsEndTime - projectsStartTime) / 1000).toFixed(2);
    
    console.log(`\n✅ Sincronização de projetos concluída em ${projectsDuration}s`);
    console.log('=====================================\n');

    // Etapa 2: Sincronizar Funcionários
    console.log('👥 ETAPA 2: Sincronizando funcionários da planilha...');
    console.log('⏳ Aguarde enquanto os funcionários são sincronizados...\n');
    
    const employeesStartTime = Date.now();
    await syncEmployees();
    const employeesEndTime = Date.now();
    const employeesDuration = ((employeesEndTime - employeesStartTime) / 1000).toFixed(2);
    
    console.log(`\n✅ Sincronização de funcionários concluída em ${employeesDuration}s`);
    console.log('=====================================\n');

    // Resumo Final
    const totalEndTime = Date.now();
    const totalDuration = ((totalEndTime - startTime) / 1000).toFixed(2);
    
    console.log('🎉 RESUMO FINAL DA SINCRONIZAÇÃO');
    console.log('=====================================');
    console.log(`📋 Projetos: ✅ Concluído (${projectsDuration}s)`);
    console.log(`👥 Funcionários: ✅ Concluído (${employeesDuration}s)`);
    console.log(`⏱️  Tempo total: ${totalDuration}s`);
    console.log(`📅 Finalizado em: ${new Date().toISOString()}`);
    console.log('=====================================');
    console.log('\n✨ Todas as sincronizações foram concluídas com sucesso!');

  } catch (error) {
    console.error('\n💥 Erro durante a sincronização:', error.message);
    console.error('\n🔍 Verificações sugeridas:');
    console.error('   1. ✅ Arquivo .env está configurado?');
    console.error('   2. ✅ Credenciais do Google estão em /app/credentials/?');
    console.error('   3. ✅ Banco de dados está acessível?');
    console.error('   4. ✅ GOOGLE_SPREADSHEET_ID está correto?');
    console.error('   5. ✅ Planilhas do Google Sheets estão acessíveis?');
    
    if (process.env.NODE_ENV === 'development') {
      console.error('\n🔍 Stack trace:', error.stack);
    }
    
    process.exit(1);
  }
}

// =============================================================================
// EXECUTION
// =============================================================================

// Executar se chamado diretamente
if (require.main === module) {
  console.log('🐳 Executando run-all-syncs em ambiente Docker...');
  console.log('📋 Configurações do ambiente:');
  console.log(`   - DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   - DB_PORT: ${process.env.DB_PORT || '5432'}`);
  console.log(`   - DB_NAME: ${process.env.DB_NAME || 'employee_movements'}`);
  console.log(`   - GOOGLE_SPREADSHEET_ID: ${process.env.GOOGLE_SPREADSHEET_ID ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   - Service Account: ${process.env.GOOGLE_SERVICE_ACCOUNT_PATH || '/app/credentials/service-account-key.json'}`);
  console.log('');

  runAllSyncs()
    .then(() => {
      console.log('\n🏁 Script de sincronização completa finalizado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script de sincronização completa falhou:', error);
      process.exit(1);
    });
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = { runAllSyncs };
