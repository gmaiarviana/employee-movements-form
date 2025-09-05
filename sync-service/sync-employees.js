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
 * Remove duplicatas baseado no email IA
 */
function removeDuplicatesByEmail(employees) {
  const seen = new Set();
  return employees.filter(employee => {
    const email = employee.emailIa?.toLowerCase();
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

  console.log('📋 Headers encontrados na planilha:', headers);

  // Mapear índices das colunas baseado nos headers reais
  const columnMap = {
    matriculaIa: headers.findIndex(h => h?.toLowerCase().includes('matricula ia')),
    nome: headers.findIndex(h => h?.toLowerCase().includes('nome')),
    emailIa: headers.findIndex(h => h?.toLowerCase().includes('email ia')),
    emailHp: headers.findIndex(h => h?.toLowerCase().includes('e-mail hp')),
    perfil: headers.findIndex(h => h?.toLowerCase().includes('perfil')),
    employeeId: headers.findIndex(h => h?.toLowerCase().includes('employee id')),
    projeto: headers.findIndex(h => h?.toLowerCase().includes('projeto')),
    gerente: headers.findIndex(h => h?.toLowerCase().includes('gerente')),
    dataNascimento: headers.findIndex(h => h?.toLowerCase().includes('data de nascimento')),
    escolaridade: headers.findIndex(h => h?.toLowerCase().includes('escolaridade')),
    graduacao: headers.findIndex(h => h?.toLowerCase().includes('graduação')),
    situacao: headers.findIndex(h => h?.toLowerCase().includes('situação') || h?.toLowerCase().includes('situacao'))
  };

  console.log('📋 Mapeamento de colunas encontrado:', columnMap);

  return rows.map((row, index) => {
    const employee = {
      matriculaIa: row[columnMap.matriculaIa] || '',
      nome: row[columnMap.nome] || '',
      emailIa: row[columnMap.emailIa] || '',
      emailHp: row[columnMap.emailHp] || '',
      perfil: row[columnMap.perfil] || '',
      employeeIdHp: row[columnMap.employeeId] || '',
      projeto: row[columnMap.projeto] || '',
      gerente: row[columnMap.gerente] || '',
      dataNascimento: row[columnMap.dataNascimento] || '',
      escolaridade: row[columnMap.escolaridade] || '',
      graduacao: row[columnMap.graduacao] || '',
      situacao: row[columnMap.situacao] || ''
    };

    // Determinar se é manager baseado no projeto ou perfil
    const isManager = employee.projeto?.toLowerCase().includes('gestão') || 
                     employee.perfil?.toLowerCase().includes('pm') ||
                     employee.perfil?.toLowerCase().includes('gp') ||
                     employee.perfil?.toLowerCase().includes('tpm') ||
                     employee.perfil?.toLowerCase().includes('pgm');

    employee.isManager = isManager;

    return employee;
  }).filter(emp => emp.emailIa && emp.matriculaIa); // Filtrar apenas registros com email IA e matrícula
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

    // 7. Full sync apenas para hp_portfolio - core.employees será atualizado via UPSERT
    console.log('\n🗑️  Executando FULL SYNC apenas para hp_portfolio (dados BDI)...');
    await dbClient.query('DELETE FROM hp_portfolio.movements WHERE employee_id IN (SELECT matricula_ia FROM hp_portfolio.employees)');
    await dbClient.query('DELETE FROM hp_portfolio.hp_employee_profiles WHERE employee_id IN (SELECT matricula_ia FROM hp_portfolio.employees)');
    await dbClient.query('DELETE FROM hp_portfolio.employees');
    console.log('✅ Dados hp_portfolio removidos (core.employees preservado para outras fontes)');

    // 8. Inserir novos dados - PRIMEIRO em hp_portfolio.employees
    console.log('\n💾 Inserindo funcionários em hp_portfolio.employees...');
    let insertedHpCount = 0;
    let errorHpCount = 0;

    for (const employee of uniqueEmployees) {
      try {
        const insertHpQuery = `
          INSERT INTO hp_portfolio.employees (
            matricula_ia, nome, email_ia, perfil, is_manager, projeto, gerente, 
            employee_id_hp, situacao, email_hp, data_nascimento, escolaridade, graduacao
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `;

        const valuesHp = [
          employee.matriculaIa,
          employee.nome,
          employee.emailIa.toLowerCase(),
          employee.perfil,
          employee.isManager,
          employee.projeto || null,
          employee.gerente || null,
          employee.employeeIdHp || null,
          employee.situacao || null,
          employee.emailHp || null,
          formatDateOfBirth(employee.dataNascimento),
          employee.escolaridade || null,
          employee.graduacao || null
        ];

        await dbClient.query(insertHpQuery, valuesHp);
        insertedHpCount++;
        
        if (insertedHpCount % 10 === 0) {
          console.log(`� HP Portfolio - Inseridos: ${insertedHpCount}/${uniqueEmployees.length}`);
        }
      } catch (error) {
        errorHpCount++;
        console.error(`❌ Erro ao inserir funcionário HP ${employee.nome} (${employee.emailIa}):`, error.message);
      }
    }

    // 9. UPSERT dados básicos para core.employees (preserva dados de outras fontes)
    console.log('\n💾 Atualizando core.employees via UPSERT (preserva outras fontes)...');
    let upsertedCoreCount = 0;
    let errorCoreCount = 0;

    for (const employee of uniqueEmployees) {
      try {
        const upsertCoreQuery = `
          INSERT INTO core.employees (
            id, name, email, funcao_atlantico, company, 
            cpf, rg, data_nascimento, nivel_escolaridade, formacao,
            created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
          ON CONFLICT (id) 
          DO UPDATE SET 
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            funcao_atlantico = EXCLUDED.funcao_atlantico,
            company = EXCLUDED.company,
            data_nascimento = EXCLUDED.data_nascimento,
            nivel_escolaridade = EXCLUDED.nivel_escolaridade,
            formacao = EXCLUDED.formacao,
            updated_at = NOW()
          -- CPF e RG são preservados (podem vir de TOTVS)
        `;

        const valuesCoreValues = [
          employee.matriculaIa,
          employee.nome,
          employee.emailIa.toLowerCase(),
          employee.perfil,
          'Instituto Atlântico',
          null, // CPF preservado se existir  
          null, // RG preservado se existir
          formatDateOfBirth(employee.dataNascimento),
          employee.escolaridade || null,
          employee.graduacao || null
        ];

        await dbClient.query(upsertCoreQuery, valuesCoreValues);
        upsertedCoreCount++;
        
        if (upsertedCoreCount % 10 === 0) {
          console.log(`📝 Core UPSERT - Processados: ${upsertedCoreCount}/${uniqueEmployees.length}`);
        }
      } catch (error) {
        errorCoreCount++;
        console.error(`❌ Erro ao fazer UPSERT funcionário Core ${employee.nome} (${employee.emailIa}):`, error.message);
      }
    }

    // 10. Resumo da sincronização
    console.log('\n📊 RESUMO DA SINCRONIZAÇÃO');
    console.log('='.repeat(50));
    console.log(`📖 Total de linhas lidas da planilha: ${sheetData.length - 1}`); // -1 para excluir cabeçalho
    console.log(`🗺️  Funcionários mapeados: ${mappedEmployees.length}`);
    console.log(`✅ Funcionários ativos filtrados: ${activeEmployees.length}`);
    console.log(`🎯 Funcionários únicos (sem duplicatas): ${uniqueEmployees.length}`);
    console.log(`💾 hp_portfolio.employees inseridos: ${insertedHpCount}`);
    console.log(`💾 core.employees sincronizados via UPSERT: ${upsertedCoreCount}`);
    console.log(`❌ Erros HP Portfolio: ${errorHpCount}`);
    console.log(`❌ Erros Core: ${errorCoreCount}`);
    console.log('='.repeat(50));
    
    if (insertedHpCount > 0 && upsertedCoreCount > 0) {
      console.log('🎉 Sincronização concluída com sucesso!');
      console.log('✅ Dados de outras fontes em core.employees foram preservados');
    } else {
      console.log('⚠️  Sincronização concluída, mas houve problemas na inserção.');
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
