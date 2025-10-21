// routes/resumeRoutes.js - Resume Management & Auto-Generation Routes
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

// AI-Powered Resume Summary Generator
const generateResumeSummary = (user, achievements, skills) => {
  // Count different types of achievements
  const internships = achievements.filter(a => a.type === 'internship').length;
  const projects = achievements.filter(a => a.type === 'project').length;
  const courses = achievements.filter(a => a.type === 'course').length;
  const hackathons = achievements.filter(a => a.type === 'hackathon').length;
  
  // Extract top skills (Advanced and Expert level)
  const topSkills = skills
    .filter(s => s.proficiency_level === 'Advanced' || s.proficiency_level === 'Expert')
    .map(s => s.skill_name)
    .slice(0, 5);
  
  // Extract all unique skills from achievements
  const achievementSkills = new Set();
  achievements.forEach(a => {
    if (a.skills_used && Array.isArray(a.skills_used)) {
      a.skills_used.forEach(skill => achievementSkills.add(skill));
    }
  });
  
  // Build dynamic summary
  let summary = '';
  
  if (user.bio && user.bio.trim() !== '') {
    summary = user.bio + ' ';
  } else {
    summary = `Motivated professional with a passion for technology and innovation. `;
  }
  
  // Add experience mentions
  if (internships > 0) {
    summary += `Completed ${internships} professional internship${internships > 1 ? 's' : ''} `;
  }
  
  if (projects > 0) {
    summary += `with ${projects} hands-on project${projects > 1 ? 's' : ''} `;
  }
  
  if (hackathons > 0) {
    summary += `and participated in ${hackathons} hackathon${hackathons > 1 ? 's' : ''}. `;
  }
  
  // Add skills
  if (topSkills.length > 0) {
    summary += `Proficient in ${topSkills.join(', ')}. `;
  } else if (achievementSkills.size > 0) {
    const skillsArray = Array.from(achievementSkills).slice(0, 5);
    summary += `Skilled in ${skillsArray.join(', ')}. `;
  }
  
  // Add courses if any
  if (courses > 0) {
    summary += `Continuously learning through ${courses} completed course${courses > 1 ? 's' : ''}. `;
  }
  
  summary += `Ready to contribute to innovative projects and drive meaningful results.`;
  
  return summary;
};

// Get all resumes for logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const resumes = await pool.query(
      'SELECT * FROM resumes WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    
    res.json({ resumes: resumes.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching resumes' });
  }
});

// Get complete resume with all data (achievements, skills, user info)
router.get('/:id/complete', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get resume
    const resume = await pool.query(
      'SELECT * FROM resumes WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (resume.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Get user info
    const user = await pool.query(
      'SELECT id, email, full_name, phone, location, bio, profile_picture_url FROM users WHERE id = $1',
      [req.userId]
    );
    
    // Get achievements for this resume
    const achievements = await pool.query(
      `SELECT a.* FROM achievements a
       INNER JOIN resume_achievements ra ON a.id = ra.achievement_id
       WHERE ra.resume_id = $1
       ORDER BY ra.display_order, a.start_date DESC`,
      [id]
    );
    
    // Get skills for this resume
    const skills = await pool.query(
      `SELECT s.* FROM skills s
       INNER JOIN resume_skills rs ON s.id = rs.skill_id
       WHERE rs.resume_id = $1
       ORDER BY rs.display_order`,
      [id]
    );
    
    res.json({
      resume: resume.rows[0],
      user: user.rows[0],
      achievements: achievements.rows,
      skills: skills.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching complete resume' });
  }
});

// Auto-generate resume from all user data
router.post('/generate', verifyToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { title, template_type, achievement_ids, skill_ids } = req.body;
    
    // Get user info
    const user = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [req.userId]
    );
    
    // Get achievements
    let achievements;
    if (achievement_ids && achievement_ids.length > 0) {
      achievements = await client.query(
        'SELECT * FROM achievements WHERE id = ANY($1) AND user_id = $2',
        [achievement_ids, req.userId]
      );
    } else {
      // If no specific achievements selected, get all
      achievements = await client.query(
        'SELECT * FROM achievements WHERE user_id = $1',
        [req.userId]
      );
    }
    
    // Get skills
    let skills;
    if (skill_ids && skill_ids.length > 0) {
      skills = await client.query(
        'SELECT * FROM skills WHERE id = ANY($1) AND user_id = $2',
        [skill_ids, req.userId]
      );
    } else {
      // If no specific skills selected, get all
      skills = await client.query(
        'SELECT * FROM skills WHERE user_id = $1',
        [req.userId]
      );
    }
    
    // Generate AI summary
    const summary = generateResumeSummary(
      user.rows[0],
      achievements.rows,
      skills.rows
    );
    
    // Create resume
    const newResume = await client.query(
      `INSERT INTO resumes (user_id, title, template_type, summary, is_default) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        req.userId,
        title || 'My Resume',
        template_type || 'modern',
        summary,
        false
      ]
    );
    
    const resumeId = newResume.rows[0].id;
    
    // Link achievements to resume
    for (let i = 0; i < achievements.rows.length; i++) {
      await client.query(
        'INSERT INTO resume_achievements (resume_id, achievement_id, display_order) VALUES ($1, $2, $3)',
        [resumeId, achievements.rows[i].id, i]
      );
    }
    
    // Link skills to resume
    for (let i = 0; i < skills.rows.length; i++) {
      await client.query(
        'INSERT INTO resume_skills (resume_id, skill_id, display_order) VALUES ($1, $2, $3)',
        [resumeId, skills.rows[i].id, i]
      );
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Resume generated successfully',
      resume: newResume.rows[0],
      summary: summary
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error generating resume' });
  } finally {
    client.release();
  }
});

// Update resume
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, template_type, summary, is_default } = req.body;
    
    const updatedResume = await pool.query(
      `UPDATE resumes 
       SET title = $1, template_type = $2, summary = $3, is_default = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, template_type, summary, is_default, id, req.userId]
    );
    
    if (updatedResume.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json({
      message: 'Resume updated successfully',
      resume: updatedResume.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating resume' });
  }
});

// Delete resume
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM resumes WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting resume' });
  }
});

// Add achievement to resume
router.post('/:id/achievements', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { achievement_id } = req.body;
    
    // Verify resume belongs to user
    const resume = await pool.query(
      'SELECT * FROM resumes WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (resume.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Add achievement
    await pool.query(
      'INSERT INTO resume_achievements (resume_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [id, achievement_id]
    );
    
    res.json({ message: 'Achievement added to resume' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding achievement' });
  }
});

// Remove achievement from resume
router.delete('/:id/achievements/:achievement_id', verifyToken, async (req, res) => {
  try {
    const { id, achievement_id } = req.params;
    
    await pool.query(
      'DELETE FROM resume_achievements WHERE resume_id = $1 AND achievement_id = $2',
      [id, achievement_id]
    );
    
    res.json({ message: 'Achievement removed from resume' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error removing achievement' });
  }
});

module.exports = router;