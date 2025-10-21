// routes/achievementRoutes.js - Achievement Management Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all achievements for logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { type } = req.query; // Optional filter by type
    
    let query = 'SELECT * FROM achievements WHERE user_id = $1';
    let params = [req.userId];
    
    if (type) {
      query += ' AND type = $2';
      params.push(type);
    }
    
    query += ' ORDER BY start_date DESC';
    
    const achievements = await pool.query(query, params);
    
    res.json({ achievements: achievements.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching achievements' });
  }
});

// Get single achievement by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const achievement = await pool.query(
      'SELECT * FROM achievements WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (achievement.rows.length === 0) {
      return res.status(404).json({ error: 'Achievement not found' });
    }
    
    res.json({ achievement: achievement.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching achievement' });
  }
});

// Create new achievement
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      type,
      title,
      organization,
      description,
      start_date,
      end_date,
      status,
      certificate_url,
      verified,
      skills_used
    } = req.body;

    const newAchievement = await pool.query(
      `INSERT INTO achievements 
       (user_id, type, title, organization, description, start_date, end_date, status, certificate_url, verified, skills_used) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        req.userId,
        type,
        title,
        organization,
        description,
        start_date,
        end_date,
        status,
        certificate_url,
        verified || false,
        skills_used || []
      ]
    );

    res.status(201).json({
      message: 'Achievement created successfully',
      achievement: newAchievement.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating achievement' });
  }
});

// Update achievement
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      title,
      organization,
      description,
      start_date,
      end_date,
      status,
      certificate_url,
      verified,
      skills_used
    } = req.body;

    const updatedAchievement = await pool.query(
      `UPDATE achievements 
       SET type = $1, title = $2, organization = $3, description = $4, 
           start_date = $5, end_date = $6, status = $7, certificate_url = $8, 
           verified = $9, skills_used = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [
        type,
        title,
        organization,
        description,
        start_date,
        end_date,
        status,
        certificate_url,
        verified,
        skills_used,
        id,
        req.userId
      ]
    );

    if (updatedAchievement.rows.length === 0) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    res.json({
      message: 'Achievement updated successfully',
      achievement: updatedAchievement.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating achievement' });
  }
});

// Delete achievement
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM achievements WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting achievement' });
  }
});

// Get achievements count by type
router.get('/stats/count', verifyToken, async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT type, COUNT(*) as count 
       FROM achievements 
       WHERE user_id = $1 
       GROUP BY type`,
      [req.userId]
    );

    res.json({ stats: stats.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

module.exports = router;