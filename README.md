# Resume System - Full Stack Application

> A next-generation Resume Building & Career Ecosystem designed for students and professionals. Build dynamic, verified resumes automatically based on real achievements.

##  Features

- ✅ **User Authentication** - Secure registration and login
- ✅ **Achievement Management** - Track internships, projects, courses, and hackathons
- ✅ **Skills Portfolio** - Manage skills with proficiency levels
- ✅ **AI-Powered Resume Generation** - Auto-generate professional summaries
- ✅ **Real-time Resume Preview** - See your resume as you build it
- ✅ **Multiple Templates** - Modern, Classic, and Minimal designs
- ✅ **PDF Export** - Download your resume as PDF

##  Tech Stack

### Backend
- **Node.js** & **Express** - REST API
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React** (Vite) - UI Framework
- **React Router** - Navigation
- **Axios** - API calls
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

##  Project Structure

```
resume-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── achievementRoutes.js
│   │   ├── skillRoutes.js
│   │   └── resumeRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Achievements.jsx
│   │   │   ├── Skills.jsx
│   │   │   ├── ResumeGenerator.jsx
│   │   │   └── ResumePreview.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
└── database/
    └── schema.sql
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Step 1: Clone and Setup Database

```bash
# Install PostgreSQL (if not installed)
# Mac: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Start PostgreSQL service
# Mac: brew services start postgresql
# Ubuntu: sudo service postgresql start

# Create database
psql postgres
CREATE DATABASE resume_system;
\q

# Run schema
psql -U postgres -d resume_system -f database/schema.sql
```

### Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file

PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=resume_system
DB_PASSWORD=your_password_here
DB_PORT=5432
JWT_SECRET=your_super_secret_jwt_key


# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### Step 3: Frontend Setup

```bash
# Navigate to frontend folder (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

Frontend will run on `http://localhost:5173`

##  Usage Guide

### 1. Register & Login
- Create an account with your details
- Login to access the dashboard

### 2. Add Achievements
- Click "Achievements" in the navbar
- Add internships, projects, courses, or hackathons
- Include descriptions and skills used

### 3. Add Skills
- Click "Skills" in the navbar
- Add skills with proficiency levels (Beginner to Expert)

### 4. Generate Resume
- Click "Generate Resume"
- Select achievements and skills to include
- Choose a template (Modern, Classic, or Minimal)
- Generate your AI-powered resume!

### 5. Download Resume
- View your generated resume
- Click "Download PDF" or use Ctrl+P / Cmd+P to save

##  Database Schema

### Users Table
- Stores user authentication and profile information

### Achievements Table
- Tracks internships, projects, courses, hackathons
- Includes verification status and skills used

### Skills Table
- Manages user skills with proficiency levels

### Resumes Table
- Stores generated resumes with AI summaries

### Resume_Achievements & Resume_Skills
- Many-to-many relationships for flexible resume building

##  API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Achievements
- `GET /api/achievements` - Get all achievements
- `POST /api/achievements` - Create achievement
- `PUT /api/achievements/:id` - Update achievement
- `DELETE /api/achievements/:id` - Delete achievement

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill
- `POST /api/skills/bulk` - Bulk add skills
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Resumes
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/:id/complete` - Get complete resume data
- `POST /api/resumes/generate` - Generate new resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

##  AI Auto-Generation Logic

The system automatically generates professional resume summaries by:
1. Analyzing user's bio and achievements
2. Counting different types of experiences
3. Extracting top skills based on proficiency
4. Creating a compelling narrative
5. Formatting for professional presentation

##  Templates

- **Modern** - Clean, contemporary design with blue accents
- **Classic** - Traditional professional format
- **Minimal** - Simple, elegant design

##  ScreenShots

<img width="638" height="442" alt="image" src="https://github.com/user-attachments/assets/f402cdb8-a213-41a2-b781-2a00cfa3428b" />

<img width="757" height="440" alt="image" src="https://github.com/user-attachments/assets/1f05e532-1df5-4dc8-a869-c4e112e11700" />

<img width="553" height="397" alt="image" src="https://github.com/user-attachments/assets/60bf0e57-860f-458a-b69d-bff27bb77db4" />

<img width="400" height="390" alt="image" src="https://github.com/user-attachments/assets/2fd1b473-bbe3-4fd9-a420-a9f1e63308f5" />


