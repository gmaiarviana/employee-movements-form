const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { dbClient } = require('../config/database');

// GET /api/projects - Retorna lista de projetos (acesso público)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, name, description, sow_pt, gerente_hp, gerente_ia
      FROM hp_portfolio.projects 
      ORDER BY name ASC
    `;
    
    const result = await dbClient.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar projetos'
    });
  }
});

module.exports = router;
