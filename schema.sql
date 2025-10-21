-- Resume System Database Schema
-- PostgreSQL Database Setup

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS resume_skills CASCADE;
DROP TABLE IF EXISTS resume_achievements CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    profile_picture_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills Table
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50), -- Beginner, Intermediate, Advanced, Expert
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements Table (Internships, Courses, Projects, Hackathons)
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'internship', 'course', 'project', 'hackathon'
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50), -- 'completed', 'in-progress', 'ongoing'
    certificate_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    skills_used TEXT[], -- Array of skills
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resumes Table
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) DEFAULT 'modern', -- 'modern', 'classic', 'minimal'
    summary TEXT, -- Auto-generated professional summary
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resume Achievements (Many-to-Many relationship)
CREATE TABLE resume_achievements (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER REFERENCES resumes(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resume_id, achievement_id)
);

-- Resume Skills (Many-to-Many relationship)
CREATE TABLE resume_skills (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER REFERENCES resumes(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resume_id, skill_id)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(type);
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);

-- Sample Data for Testing
INSERT INTO users (email, password_hash, full_name, phone, location, bio) VALUES
('john.doe@example.com', '$2b$10$example_hash', 'John Doe', '+1234567890', 'San Francisco, CA', 'Full-stack developer passionate about building scalable applications');

INSERT INTO skills (user_id, skill_name, proficiency_level) VALUES
(1, 'React', 'Advanced'),
(1, 'Node.js', 'Advanced'),
(1, 'PostgreSQL', 'Intermediate'),
(1, 'Python', 'Intermediate'),
(1, 'Docker', 'Beginner');

INSERT INTO achievements (user_id, type, title, organization, description, start_date, end_date, status, verified, skills_used) VALUES
(1, 'internship', 'Software Engineering Intern', 'Tech Corp', 'Developed RESTful APIs and worked on microservices architecture', '2024-06-01', '2024-08-31', 'completed', true, ARRAY['React', 'Node.js', 'PostgreSQL']),
(1, 'project', 'E-Commerce Platform', 'Personal Project', 'Built a full-stack e-commerce platform with payment integration', '2024-01-15', '2024-03-30', 'completed', true, ARRAY['React', 'Node.js', 'PostgreSQL', 'Stripe']),
(1, 'course', 'Advanced React Patterns', 'Udemy', 'Completed comprehensive course on advanced React patterns and performance optimization', '2024-04-01', '2024-05-15', 'completed', true, ARRAY['React', 'JavaScript']),
(1, 'hackathon', 'Global Hackathon 2024', 'HackerEarth', 'Won 2nd place by building an AI-powered task management app', '2024-09-15', '2024-09-17', 'completed', true, ARRAY['React', 'Python', 'Machine Learning']);

INSERT INTO resumes (user_id, title, template_type, summary, is_default) VALUES
(1, 'Software Engineer Resume', 'modern', 'Passionate full-stack developer with expertise in React, Node.js, and PostgreSQL. Experienced in building scalable web applications and RESTful APIs.', true);-- Resume System Database Schema
-- PostgreSQL Database Setup

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS resume_skills CASCADE;
DROP TABLE IF EXISTS resume_achievements CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    profile_picture_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills Table
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50), -- Beginner, Intermediate, Advanced, Expert
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements Table (Internships, Courses, Projects, Hackathons)
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'internship', 'course', 'project', 'hackathon'
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50), -- 'completed', 'in-progress', 'ongoing'
    certificate_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    skills_used TEXT[], -- Array of skills
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resumes Table
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) DEFAULT 'modern', -- 'modern', 'classic', 'minimal'
    summary TEXT, -- Auto-generated professional summary
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resume Achievements (Many-to-Many relationship)
CREATE TABLE resume_achievements (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER REFERENCES resumes(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resume_id, achievement_id)
);

-- Resume Skills (Many-to-Many relationship)
CREATE TABLE resume_skills (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER REFERENCES resumes(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resume_id, skill_id)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(type);
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);

-- Sample Data for Testing
INSERT INTO users (email, password_hash, full_name, phone, location, bio) VALUES
('john.doe@example.com', '$2b$10$example_hash', 'John Doe', '+1234567890', 'San Francisco, CA', 'Full-stack developer passionate about building scalable applications');

INSERT INTO skills (user_id, skill_name, proficiency_level) VALUES
(1, 'React', 'Advanced'),
(1, 'Node.js', 'Advanced'),
(1, 'PostgreSQL', 'Intermediate'),
(1, 'Python', 'Intermediate'),
(1, 'Docker', 'Beginner');

INSERT INTO achievements (user_id, type, title, organization, description, start_date, end_date, status, verified, skills_used) VALUES
(1, 'internship', 'Software Engineering Intern', 'Tech Corp', 'Developed RESTful APIs and worked on microservices architecture', '2024-06-01', '2024-08-31', 'completed', true, ARRAY['React', 'Node.js', 'PostgreSQL']),
(1, 'project', 'E-Commerce Platform', 'Personal Project', 'Built a full-stack e-commerce platform with payment integration', '2024-01-15', '2024-03-30', 'completed', true, ARRAY['React', 'Node.js', 'PostgreSQL', 'Stripe']),
(1, 'course', 'Advanced React Patterns', 'Udemy', 'Completed comprehensive course on advanced React patterns and performance optimization', '2024-04-01', '2024-05-15', 'completed', true, ARRAY['React', 'JavaScript']),
(1, 'hackathon', 'Global Hackathon 2024', 'HackerEarth', 'Won 2nd place by building an AI-powered task management app', '2024-09-15', '2024-09-17', 'completed', true, ARRAY['React', 'Python', 'Machine Learning']);

INSERT INTO resumes (user_id, title, template_type, summary, is_default) VALUES
(1, 'Software Engineer Resume', 'modern', 'Passionate full-stack developer with expertise in React, Node.js, and PostgreSQL. Experienced in building scalable web applications and RESTful APIs.', true);