# EvalMentor AI – AI Interview Agent & Evaluation Platform

EvalMentor AI is an AI-powered interview preparation and evaluation platform that helps users upload resumes, generate personalized interview questions, answer them, receive AI-based feedback, and track interview performance through analytics.

This project is built as a full-stack AI application with authentication, resume processing, AI question generation, AI answer evaluation, MongoDB-based interview history, and a production-ready dashboard.

---

## Project Overview

EvalMentor AI is designed to help students and job seekers practice technical interviews more effectively. The platform analyzes resume content, generates relevant interview questions, evaluates user answers using AI, assigns scores, and stores interview history for progress tracking.

The goal of this project is to demonstrate practical skills in:

* Full-stack application development
* REST API integration
* JWT-based authentication
* MongoDB database design
* AI API integration
* Resume parsing
* Dashboard analytics
* Production-ready frontend and backend structure

---

## Features

### Authentication

* User signup
* User login
* Password hashing
* JWT token generation
* Protected API routes

### Resume Processing

* Resume upload API
* Resume parsing functionality
* Extracted resume data used for interview preparation

### AI Interview System

* AI-generated interview questions
* AI-based answer evaluation
* Score extraction from AI feedback
* Improved answer suggestions
* Interview performance feedback

### Interview History

* MongoDB-based interview history storage
* Stores questions, answers, evaluations, scores, and timestamps
* Real interview history UI on frontend

### Dashboard Analytics

* Total interviews completed
* Average score tracking
* Latest interview score
* Recent activity summary
* Recruiter-friendly analytics cards

---

## Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* React
* API service layer

### Backend

* FastAPI
* Python
* MongoDB Atlas
* JWT Authentication
* bcrypt password hashing
* Groq AI API
* Resume parsing

### Database

* MongoDB Atlas

### Tools

* Git
* GitHub
* VS Code
* Swagger UI
* npm
* Python virtual environment

---

## Project Structure

```text
evalmentor-ai/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   ├── database.py
│   │   ├── config.py
│   │   └── main.py
│   └── requirements.txt
│
├── evalmentor-ai/
│   └── frontend/
│       ├── app/
│       │   ├── dashboard/
│       │   ├── login/
│       │   ├── signup/
│       │   └── resume-upload/
│       ├── src/
│       │   ├── components/
│       │   └── services/
│       ├── lib/
│       └── package.json
│
└── README.md
```

---

## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Create and activate virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend server:

```bash
uvicorn app.main:app --reload
```

Backend will run on:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

Go to the frontend folder:

```bash
cd evalmentor-ai/frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:3000
```

If port 3000 is busy, Next.js may run on another port such as 3001, 3002, or 3003.

---

## Environment Variables

Create a `.env` file in the backend and add the required values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
```

Create a `.env.local` file in the frontend:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Never push real API keys or database credentials to GitHub.

---

## API Modules

Main backend modules include:

* Authentication API
* Resume Upload API
* Resume Parsing API
* AI Question Generation API
* AI Answer Evaluation API
* Interview History API
* Dashboard Analytics API

---

## Current Status

The project currently includes:

* Completed backend APIs
* Connected frontend pages
* AI evaluation workflow
* MongoDB interview history
* Dashboard analytics
* Successful production build
* GitHub version control

---

## Recent Update

Latest completed phase:

```text
Dashboard Analytics & Production Polish
```

Added:

* Dashboard analytics service
* Total interviews card
* Average score card
* Latest score card
* Recent records card
* Recent activity section
* Production build verification

---

## Future Improvements

Planned improvements:

* Full deployment on Vercel and Render/Railway
* More detailed resume-based question generation
* Interview difficulty levels
* Topic-wise performance analytics
* User profile improvement suggestions
* PDF report generation
* Admin/recruiter dashboard

---

## Project Purpose

This project was built to demonstrate industry-relevant AI application development skills. It combines frontend development, backend API design, authentication, database integration, AI evaluation, and analytics into one complete full-stack project.

EvalMentor AI is suitable for showcasing in:

* GitHub portfolio
* Internship applications
* AI/ML project portfolio
* Final-year B.Tech project discussion
* Technical interviews

---

## Author

**Anzar Khan**
B.Tech Artificial Intelligence & Machine Learning
GitHub: AnzarKhan855
LinkedIn: AnzarKhan855
