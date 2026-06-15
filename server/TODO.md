# THADAM AI BACKEND ROADMAP

## Progress

### Completed

* [x] Spring Boot
* [x] PostgreSQL
* [x] JPA
* [x] Hibernate
* [x] Validation
* [x] Lombok
* [x] Entity
* [x] Repository
* [x] DTO
* [x] Service
* [x] Controller
* [x] ApiResponse<T>
* [x] GlobalExceptionHandler
* [x] Create User
* [x] Get User By Id

---

# Phase 1 — Spring Boot Fundamentals

## CRUD

* [x] Validation Error Handler
* [x] Get All Users
* [x] Update User
* [x] Delete User

## Entity Improvements

* [x] BaseEntity
* [x] createdAt
* [x] updatedAt
* [x] indexes
* [x] unique email

## Learn

* [x] @MappedSuperclass
* [x] @CreationTimestamp
* [x] @UpdateTimestamp

---

# Phase 2 — Authentication & Security

## User Model

Current

```text
id
name
email
```

Target

```text
id
name
email
password
role
provider
providerId
createdAt
updatedAt
```

### AuthProvider

```java
LOCAL
GOOGLE
```

### Role

```java
USER
ADMIN
MODERATOR
```

---

## Password Security

* [x] BCryptPasswordEncoder
* [x] Hash Password
* [x] Verify Password
* [x] Never Store Plain Text Password

---

## Register

* [x] RegisterRequest
* [x] RegisterResponse
* [x] Register Service
* [x] Register API
* [x] Duplicate Email Validation

Endpoint:

```http
POST /api/auth/register
```

---

## Login

* [x] LoginRequest
* [x] LoginResponse
* [x] Login Service
* [x] Login API

Endpoint:

```http
POST /api/auth/login
```

---

## Current User

* [x] Current User API

Endpoint:

```http
GET /api/auth/me
```

---

## JWT

### JWT Utility

* [x] Generate Access Token
* [x] Validate Token
* [x] Extract Claims
* [x] Extract Email
* [x] Token Expiration

### Security

* [x] SecurityFilterChain
* [x] JwtAuthenticationFilter
* [x] AuthenticationEntryPoint
* [x] UserDetails
* [x] UserDetailsService
* [x] PasswordEncoder Bean

---

## Refresh Tokens

### Refresh Token

* [x] RefreshToken Entity
* [x] RefreshToken Repository
* [x] RefreshToken Service

### APIs

* [x] Refresh Token API
* [x] Logout API
* [x] Refresh Rotation

Endpoints:

```http
POST /api/auth/refresh
POST /api/auth/logout
```

---

## Google OAuth

### Setup

* [ ] Google Cloud Project
* [ ] OAuth Client ID
* [ ] OAuth Client Secret
* [ ] Redirect URI

### Spring Security OAuth

* [x] spring-boot-starter-oauth2-client
* [x] OAuth2 Login Configuration
* [x] OAuth Success Handler

### User Handling

* [x] Create User If Missing
* [x] Link Existing User
* [x] Store Provider
* [x] Store ProviderId

### JWT Integration

* [x] Generate JWT After OAuth Login
* [x] Generate Refresh Token
* [x] Return Tokens To Frontend

Flow

```text
Frontend
    ↓
Google Login
    ↓
Google
    ↓
Spring OAuth
    ↓
User Lookup / Creation
    ↓
JWT Generation
    ↓
Frontend
```

---

## RBAC

### Roles

* [x] USER
* [x] ADMIN
* [x] MODERATOR

### Authorization

* [x] Endpoint Authorization
* [x] Method Security
* [x] @PreAuthorize
* [x] Role Hierarchy

Examples

```java
@PreAuthorize("hasRole('ADMIN')")
```

### Admin APIs

* [x] View Users
* [x] Delete Users
* [x] Change Roles

---

# Phase 3 — Intermediate Spring Boot

## MapStruct

* [ ] MapStruct Setup
* [ ] Entity → DTO Mapping
* [ ] DTO → Entity Mapping

## Configuration

* [ ] Profiles
* [ ] application-dev.yml
* [ ] application-prod.yml
* [ ] Environment Variables
* [ ] Secrets Management

## Logging

* [ ] Request Logging
* [ ] Structured Logging
* [ ] Correlation IDs

## Database

* [ ] Flyway
* [ ] Versioned Migrations
* [ ] Seed Data

## Transactions

* [ ] @Transactional
* [ ] Rollbacks
* [ ] Propagation
* [ ] Isolation Levels

---

# Phase 4 — Thadam Domain

## Roadmap System

### Entities

* [ ] Roadmap
* [ ] Milestone
* [ ] Task
* [ ] RoadmapFork

### APIs

* [ ] Create Roadmap
* [ ] Get Roadmap
* [ ] Update Roadmap
* [ ] Delete Roadmap

### Features

* [ ] Fork Roadmap
* [ ] Pagination
* [ ] Search
* [ ] Filtering
* [ ] Sorting

---

## Progress Tracking

* [ ] RoadmapTracker
* [ ] TaskProgress
* [ ] Completion Percentage

---

# Phase 5 — Coin Ledger

## Ledger

* [ ] CoinLedger
* [ ] CoinTransactionType

## Rules

* [ ] Immutable Ledger
* [ ] Transactional Updates
* [ ] No Manual Balance Updates

## APIs

* [ ] Earn Coins
* [ ] Spend Coins
* [ ] Balance API
* [ ] Ledger History

---

# Phase 6 — Events & Async

## Events

* [ ] TaskCompletedEvent
* [ ] CoinsEarnedEvent
* [ ] RoadmapCompletedEvent
* [ ] VerificationTriggeredEvent

## Async

* [ ] @Async
* [ ] Event Listeners
* [ ] Background Processing

---

# Phase 7 — Redis & Performance

## Redis

* [ ] Redis Setup
* [ ] Cache Manager
* [ ] Trending Cache
* [ ] Leaderboard Cache

## Performance

* [ ] N+1 Problem
* [ ] Fetch Join
* [ ] Entity Graph
* [ ] Query Optimization

## Rate Limiting

* [ ] Bucket4j
* [ ] Login Protection
* [ ] Register Protection
* [ ] API Protection

---

# Phase 8 — AI Integration

## WebClient

* [ ] WebClient
* [ ] Timeouts
* [ ] Retries
* [ ] Circuit Breaker

## Gemini

* [ ] Generate Roadmap
* [ ] Structured JSON Parsing
* [ ] Save Roadmap
* [ ] Token Usage Logging

---

# Phase 9 — Testing

## Unit Tests

* [ ] Service Tests
* [ ] Repository Tests
* [ ] Security Tests

## Integration Tests

* [ ] Register Flow
* [ ] Login Flow
* [ ] OAuth Flow
* [ ] JWT Flow
* [ ] Roadmap Flow

## Testcontainers

* [ ] PostgreSQL Container
* [ ] Redis Container

---

# Phase 10 — Deployment

## Docker

* [ ] Dockerfile
* [ ] Docker Compose
* [ ] PostgreSQL Container
* [ ] Redis Container

## Monitoring

* [ ] Spring Actuator
* [ ] Health Checks
* [ ] Metrics

## CI/CD

* [ ] GitHub Actions
* [ ] Build Pipeline
* [ ] Test Pipeline
* [ ] Docker Build Pipeline

---

# Interview Readiness

* [ ] JPA Lifecycle
* [ ] Hibernate
* [ ] Lazy vs Eager
* [ ] DTO Pattern
* [ ] Repository Pattern
* [ ] BCrypt
* [ ] JWT Lifecycle
* [ ] Refresh Token Lifecycle
* [ ] OAuth Flow
* [ ] Spring Security Flow
* [ ] RBAC
* [ ] Transactions
* [ ] N+1 Problem
* [ ] Redis Caching
* [ ] Event Driven Design
* [ ] Concurrency Handling
* [ ] Docker Deployment

---
