// sync.js

const { google } = require('googleapis');
const fs = require('fs').promises;
require('dotenv').config();

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  spreadsheet: {
    id: process.env.GOOGLE_SPREADSHEET_ID,
    sheetName: 'Atlantes',
    range: process.env.GOOGLE_SHEET_RANGE || 'A:F',
  },
  serviceAccount: {
    keyPath: process.env.GOOGLE_SERVICE_ACCOUNT_PATH || '/app/credentials/service-account-key.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  }
};

// =============================================================================
// GOOGLE SHEETS CLIENT (SERVICE ACCOUNT)
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

// =============================================================================
// READ AND PROCESS DATA
// =============================================================================

async function countEmployees() {
  let sheets;
  try {
    // Validar arquivo de credenciais
    await fs.access(CONFIG.serviceAccount.keyPath);
    console.log('✅ Arquivo de credenciais encontrado');

    // Criar cliente Sheets
    sheets = await createSheetsClient();
    
    // Ler dados da planilha
    const fullRange = `${CONFIG.spreadsheet.sheetName}!${CONFIG.spreadsheet.range}`;
    console.log(`📊 Lendo dados da planilha ${CONFIG.spreadsheet.id} na aba '${CONFIG.spreadsheet.sheetName}'...`);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.spreadsheet.id,
      range: fullRange
    });
    
    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      console.log('⚠️ Planilha vazia');
      return 0;
    }
    
    // Headers are in the first row
    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);
    
    // Find the index of the 'matricula ia' and 'situação' columns
    const matriculaIaIndex = headers.indexOf('matricula ia');
    const situacaoIndex = headers.indexOf('situação');
    
    if (matriculaIaIndex === -1) {
      throw new Error("Coluna 'Matricula IA' não encontrada na planilha.");
    }
    if (situacaoIndex === -1) {
      throw new Error("Coluna 'Situação' não encontrada na planilha.");
    }
    
    // Collect all unique employee IDs where 'Situação' is 'Atuando no Projeto'
    const activeEmployeeIds = dataRows
      .filter(row => (row[situacaoIndex] || '').trim() === 'Atuando no Projeto')
      .map(row => (row[matriculaIaIndex] || '').trim())
      .filter(id => id); // Remove empty values

    // Get unique IDs
    const uniqueActiveEmployees = new Set(activeEmployeeIds);
    
    console.log(`✅ ${uniqueActiveEmployees.size} funcionários únicos identificados como 'Atuando no Projeto'.`);
    
    return uniqueActiveEmployees.size;

  } catch (error) {
    console.error('💥 Falha ao ler dados da planilha:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('🔍 Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// =============================================================================
// RUN
// =============================================================================

countEmployees();