// syncUtils.js

const { google } = require('googleapis');
const { Client } = require('pg');
require('dotenv').config();

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  spreadsheet: {
    id: process.env.GOOGLE_SPREADSHEET_ID,
    sheetName: 'Atlantes',
    range: process.env.GOOGLE_SHEET_RANGE || 'A:U',
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
// GOOGLE SHEETS CLIENT CLASS
// =============================================================================

class GoogleSheetsClient {
  constructor() {
    this.client = null;
  }

  async initialize() {
    try {
      console.log('🔑 Inicializando Google Sheets com Service Account...');
      const auth = new google.auth.GoogleAuth({
        keyFile: CONFIG.serviceAccount.keyPath,
        scopes: CONFIG.serviceAccount.scopes
      });
      this.client = google.sheets({ version: 'v4', auth });
      console.log('✅ Cliente Google Sheets criado com sucesso');
      return this.client;
    } catch (error) {
      console.error('❌ Erro ao criar cliente Google Sheets:', error.message);
      throw error;
    }
  }

  async getData(spreadsheetId, range) {
    if (!this.client) {
      await this.initialize();
    }
    return await this.client.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
  }
}

// =============================================================================
// DATABASE CLIENT CLASS
// =============================================================================

class DatabaseClient {
  constructor() {
    this.client = null;
  }

  async connect() {
    this.client = new Client(CONFIG.database);
    try {
      await this.client.connect();
      console.log('✅ Conexão com banco de dados estabelecida');
      return this.client;
    } catch (error) {
      console.error('❌ Erro ao conectar com o banco de dados:', error.message);
      throw error;
    }
  }

  async query(text, params) {
    if (!this.client) {
      await this.connect();
    }
    return await this.client.query(text, params);
  }

  async end() {
    if (this.client) {
      await this.client.end();
      console.log('🔒 Conexão com banco fechada');
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  CONFIG,
  GoogleSheetsClient,
  DatabaseClient
};
