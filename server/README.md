# Thadam AI - Backend

This is the Spring Boot backend server for Thadam AI. It provides a RESTful API to manage users, authentication, roadmaps, and Gamification ledgers.

## Tech Stack
- **Framework:** Java 21 + Spring Boot 3.5.14
- **Database:** Neon Serverless PostgreSQL
- **Security:** Spring Security + JWT + Google OAuth2
- **ORM:** Spring Data JPA + Hibernate
- **Migrations:** Flyway
- **Mapping:** MapStruct 1.6.3

## Architecture
The backend follows a Modular Monolith (Clean Architecture) package layout with strict separation of concerns.
`src/main/java/com/thadam/ai/modules/` contains individual modules like `auth`, `roadmap`, `user`, and `gamification`.
Each module contains:
- `presentation/`: REST Controllers.
- `core/application/`: Services and DTOs (Business Logic).
- `core/domain/`: Entities and Domain Events.
- `infrastructure/`: Repositories and Security integrations.

## Getting Started

1. Ensure you have Java 21 installed.
2. Provide a `.env` file in the `server/` directory with the following variables:
   - `DB_URL` (Your Neon Postgres JDBC URL)
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

The API will be available at [http://localhost:5000](http://localhost:5000).
