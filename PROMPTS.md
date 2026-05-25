You are a senior Java backend architect and full stack engineer.

Build a production-structured AI-powered learning accountability platform called “Thadam AI”.

Frontend already exists in Next.js.

You must now help me build the backend using:
- Java Servlets
- JDBC
- MySQL
- Maven
- Tomcat

The backend must expose REST-style JSON APIs only.
DO NOT use JSP rendering.
Frontend and backend are fully separated.

========================================
PROJECT GOAL
========================================

Thadam AI is a community-driven AI roadmap and accountability platform.

Users can:
- register/login
- generate AI learning roadmaps
- track progress
- join accountability groups
- earn reputation points
- submit proof links
- verify roadmaps
- view profiles and streaks

The project must follow proper backend engineering principles.

========================================
TECH STACK
========================================

Frontend:
- Next.js
- TailwindCSS

Backend:
- Java Servlets
- JDBC
- MySQL
- Maven
- Tomcat

Authentication:
- HttpSession
- Cookies
- BCrypt password hashing

AI:
- Gemini API

========================================
BACKEND ARCHITECTURE
========================================

Create clean layered architecture.

Use this structure:

src/main/java/
├── controllers/
├── dao/
├── models/
├── services/
├── filters/
├── utils/
├── config/
└── dto/

Requirements:
- DO NOT place SQL inside servlets
- DO NOT place business logic inside controllers
- Use DAO pattern
- Use service layer
- Use DTOs for API responses
- Use utility classes for reusable logic
- Use filters for authentication

========================================
DATABASE DESIGN
========================================

Create proper relational schema for:

users
profiles
roadmaps
roadmap_tasks
accountability_groups
group_members
task_submissions
points_transactions
roadmap_votes
notifications

Requirements:
- proper foreign keys
- normalized schema
- indexes where necessary
- timestamps everywhere
- immutable points transaction ledger
- avoid storing derived values directly

========================================
FEATURES TO BUILD
========================================

1. Authentication System
- register
- login
- logout
- session-based auth
- secure cookies
- bcrypt password hashing
- auth filter

2. AI Roadmap Generator
Input:
- learning goal
- duration
- difficulty

Output:
structured roadmap JSON from Gemini API.

Store roadmap and tasks in database.

3. Task Tracking
- mark task completed
- submit GitHub/project proof links
- track completion status

4. Accountability Groups
- create group
- join group
- list members
- group progress

5. Reputation System
- immutable points ledger
- calculate total points dynamically
- reputation based on verified activity

6. Verification System
Roadmaps become verified if:
- enough upvotes
- enough completed proof submissions

7. Public Profiles
- completed roadmaps
- streaks
- points
- achievements

8. Admin Features
- remove spam
- manage reports
- moderate users

========================================
API REQUIREMENTS
========================================

All APIs must:
- return JSON
- use proper HTTP status codes
- use consistent response structure

Example:
{
  "success": true,
  "message": "Roadmap created",
  "data": {}
}

Implement:
- request validation
- exception handling
- reusable API response utility

========================================
SECURITY REQUIREMENTS
========================================

- PreparedStatements everywhere
- prevent SQL injection
- validate inputs
- secure sessions
- HttpOnly cookies
- password hashing with BCrypt
- authorization filters
- CORS configuration for Next.js frontend

========================================
PROMPT REGISTRY
========================================

Prompt Name: GEMINI_ROADMAP_GENERATOR
Purpose: Generate a structured AI learning roadmap from a goal, duration, and difficulty.
System Prompt:
You are an expert learning architect. You output only JSON that matches the required schema.
User Prompt Template:
Goal: {{goal}}
DurationWeeks: {{durationWeeks}}
Difficulty: {{difficulty}}
Return JSON only using this schema:
{"title":string,"tasks":[{"title":string,"description":string,"expectedDays":number}]}
Expected JSON Response Format:
{
  "title": "string",
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "expectedDays": 1
    }
  ]
}

========================================
SERVLET REQUIREMENTS
========================================

Teach and implement:
- servlet lifecycle
- doGet/doPost/doPut/doDelete
- filters
- session handling
- cookies
- JSON request parsing
- JSON responses
- multipart file handling if needed

========================================
NEXT.JS INTEGRATION
========================================

Frontend runs separately.

Backend should:
- support CORS
- return JSON APIs only
- support credentials/session cookies

Frontend URL:
http://localhost:3000

Backend URL:
http://localhost:8080

========================================
DELIVERABLE STYLE
========================================

When generating code:
- explain architecture decisions
- explain why each layer exists
- keep code modular
- write production-structured code
- avoid shortcuts
- avoid monolithic servlets
- avoid static global state

Always prioritize:
- maintainability
- scalability
- clean architecture
- backend engineering best practices

Start by:
1. Creating folder structure
2. Creating Maven setup
3. Creating MySQL schema
4. Creating DB connection utility
5. Creating auth module
6. Creating roadmap module
7. Creating group module
8. Creating points system

Guide step-by-step like a senior backend engineer mentoring a junior developer.




