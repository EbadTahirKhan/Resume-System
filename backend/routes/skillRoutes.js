// routes/skillRoutes.js - Skills Management Routes
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

// Get all skills for logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const skills = await pool.query(
      'SELECT * FROM skills WHERE user_id = $1 ORDER BY skill_name',
      [req.userId]
    );
    
    res.json({ skills: skills.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching skills' });
  }
});

// Get single skill by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const skill = await pool.query(
      'SELECT * FROM skills WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (skill.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    res.json({ skill: skill.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching skill' });
  }
});

// Create new skill
router.post('/', verifyToken, async (req, res) => {
  try {
    const { skill_name, proficiency_level } = req.body;

    // Check if skill already exists for this user
    const existingSkill = await pool.query(
      'SELECT * FROM skills WHERE user_id = $1 AND LOWER(skill_name) = LOWER($2)',
      [req.userId, skill_name]
    );

    if (existingSkill.rows.length > 0) {
      return res.status(400).json({ error: 'Skill already exists' });
    }

    const newSkill = await pool.query(
      `INSERT INTO skills (user_id, skill_name, proficiency_level) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [req.userId, skill_name, proficiency_level]
    );

    res.status(201).json({
      message: 'Skill added successfully',
      skill: newSkill.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating skill' });
  }
});

// Update skill
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { skill_name, proficiency_level } = req.body;

    const updatedSkill = await pool.query(
      `UPDATE skills 
       SET skill_name = $1, proficiency_level = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [skill_name, proficiency_level, id, req.userId]
    );

    if (updatedSkill.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json({
      message: 'Skill updated successfully',
      skill: updatedSkill.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating skill' });
  }
});

// Delete skill
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM skills WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting skill' });
  }
});

// Bulk add skills
router.post('/bulk', verifyToken, async (req, res) => {
  try {
    const { skills } = req.body; // Array of { skill_name, proficiency_level }

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: 'Invalid skills array' });
    }

    const addedSkills = [];
    
    for (const skill of skills) {
      // Check if skill already exists
      const existingSkill = await pool.query(
        'SELECT * FROM skills WHERE user_id = $1 AND LOWER(skill_name) = LOWER($2)',
        [req.userId, skill.skill_name]
      );

      if (existingSkill.rows.length === 0) {
        const newSkill = await pool.query(
          `INSERT INTO skills (user_id, skill_name, proficiency_level) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
          [req.userId, skill.skill_name, skill.proficiency_level || 'Intermediate']
        );
        addedSkills.push(newSkill.rows[0]);
      }
    }

    res.status(201).json({
      message: `${addedSkills.length} skills added successfully`,
      skills: addedSkills
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding skills' });
  }
});

module.exports = router;