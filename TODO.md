# Part 0 — PROJECT SETUP & RULES

## Repository Setup

- [x]  Create GitHub repository
- [x]  Setup README
- [x]  Add project description
- [x]  Add architecture diagram section
- [x]  Setup `.gitignore`
- [x]  Setup branch strategy (`main`, `dev`)

---


## Spring Boot Initialization

- [x]  Initialize Spring Boot 3 project
- [x]  Java 21 configured
- [x]  Add Maven wrapper
- [x]  Verify application runs

---

## Dependencies

- [x]  Spring Web
- [x]  Spring Security
- [x]  Spring Data JPA
- [x]  PostgreSQL Driver
- [x]  Validation
- [x]  Lombok
- [ ]  JWT library
- [ ]  Spring Boot DevTools
- [ ]  MapStruct
- [ ]  Flyway
- [ ]  Redis
- [ ]  WebFlux (WebClient)
- [ ]  Actuator
- [ ]  Testcontainers
- [ ]  Mockito
- [ ]  Bucket4j

---

## Base Rules

- [x]  No business logic in controller
- [x]  DTOs for all APIs
- [x]  Constructor injection only
- [x]  Global exception handling mandatory
- [x]  Never expose entities
- [x]  Use `ResponseEntity`
- [x]  Use validation annotations
- [x]  Every endpoint documented

---

# Part 1 — FOUNDATION ARCHITECTURE

# Package Structure

- [x]  `config`
- [x]  `controller`
- [x]  `service`
- [x]  `repository`
- [x]  `entity`
- [x]  `dto`
- [x]  `mapper`
- [x]  `security`
- [x]  `exception`
- [x]  `util`
- [x]  `events`

---

# Configuration

- [x]  Configure PostgreSQL
- [ ]  Configure Redis
- [ ]  Configure profiles (`dev`, `prod`)
- [ ]  Environment variable setup
- [ ]  Setup `.env`
- [ ]  Configure Flyway

---

# Base Infrastructure

- [ ]  `ApiResponse<T>`
- [ ]  `GlobalExceptionHandler`
- [ ]  Custom exceptions
    - [ ]  `NotFoundException`
    - [ ]  `BadRequestException`
    - [ ]  `UnauthorizedException`
    - [ ]  `InsufficientCoinsException`

---

# Validation

- [ ]  Setup request validation
- [ ]  Setup validation error response

---

# Logging

- [ ]  Structured logging
- [ ]  Request logging filter

---

# Part 2 — AUTHENTICATION & SECURITY

# User System

- [ ]  Create `User` entity
- [ ]  Create `Role` entity
- [ ]  Add role relationship
- [ ]  Add indexes
- [ ]  Add timestamps
- [ ]  Add audit fields

---

# JWT System

- [ ]  JWT utility
- [ ]  Generate token
- [ ]  Validate token
- [ ]  Extract claims
- [ ]  Refresh token support

---

# Security

- [ ]  Configure `SecurityFilterChain`
- [ ]  Create `JwtAuthenticationFilter`
- [ ]  Create `CustomUserDetailsService`
- [ ]  Configure BCrypt
- [ ]  Setup endpoint authorization
- [ ]  Enable method security

---

# Auth APIs

- [ ]  Register API
- [ ]  Login API
- [ ]  Refresh token API
- [ ]  Logout API
- [ ]  Get current user API

---

# Security Hardening

- [ ]  Rate limit login
- [ ]  Rate limit register
- [ ]  Prevent duplicate emails
- [ ]  Add CORS config

---

# Part 3 — ROADMAP ENGINE

# Entities

- [ ]  `Roadmap`
- [ ]  `Milestone`
- [ ]  `Task`
- [ ]  `RoadmapFork`

---

# Relationships

- [ ]  User → Roadmap
- [ ]  Roadmap → Milestone
- [ ]  Milestone → Task
- [ ]  Roadmap → Fork lineage

---

# Database Rules

- [ ]  Add indexes
- [ ]  Add soft delete
- [ ]  Add enums
- [ ]  Add timestamps

---

# APIs

- [ ]  Create roadmap
- [ ]  Update roadmap
- [ ]  Delete roadmap
- [ ]  Get roadmap details
- [ ]  Get public roadmaps
- [ ]  Fork roadmap

---

# Features

- [ ]  Pagination
- [ ]  Search
- [ ]  Filtering
- [ ]  Sorting

---

# Optimization

- [ ]  Use LAZY loading
- [ ]  Avoid N+1
- [ ]  Add projection DTOs

---

# Part 4 — TRACKING SYSTEM

# Entities

- [ ]  `RoadmapTracker`
- [ ]  `TaskProgress`

---

# Features

- [ ]  Start roadmap
- [ ]  Pause roadmap
- [ ]  Resume roadmap
- [ ]  Complete roadmap
- [ ]  Update task progress
- [ ]  Auto calculate progress %

---

# APIs

- [ ]  Track roadmap
- [ ]  Update task status
- [ ]  Get tracking progress
- [ ]  Get user active roadmaps

---

# Analytics

- [ ]  Completion %
- [ ]  Completion timestamps
- [ ]  Progress summaries

---

# Part 5 — COIN LEDGER SYSTEM

# Entities

- [ ]  `CoinLedger`
- [ ]  `CoinTransactionType`

---

# Rules

- [ ]  Immutable ledger rows
- [ ]  Never update balance manually
- [ ]  Use transactions everywhere
- [ ]  Handle rollback correctly

---

# Coin Service

- [ ]  Earn coins
- [ ]  Spend coins
- [ ]  Get balance
- [ ]  Get ledger history

---

# Coin Triggers

- [ ]  Task completion reward
- [ ]  Roadmap completion reward
- [ ]  Upvote reward
- [ ]  AI generation spend

---

# APIs

- [ ]  Balance API
- [ ]  Ledger history API

---

# Concurrency Protection

- [ ]  Prevent double spend
- [ ]  Add transactional boundaries

---

# Part 6 — SOCIAL & VERIFICATION

# Entities

- [ ]  `RoadmapUpvote`
- [ ]  `Comment`
- [ ]  `Bookmark`
- [ ]  `Proof`
- [ ]  `VerificationLog`

---

# Social Features

- [ ]  Upvote roadmap
- [ ]  Remove upvote
- [ ]  Add comment
- [ ]  Reply comment
- [ ]  Bookmark roadmap

---

# Verification Engine

- [ ]  Verification thresholds
- [ ]  Verification service
- [ ]  Automatic verification checks
- [ ]  Proof submission
- [ ]  Proof review

---

# APIs

- [ ]  Upvote API
- [ ]  Comment API
- [ ]  Bookmark API
- [ ]  Submit proof API

---

# Optimization

- [ ]  Cached upvote count
- [ ]  Idempotent upvotes

---

# Part 7 — GROUP ACCOUNTABILITY SYSTEM

# Entities

- [ ]  `Group`
- [ ]  `GroupMember`
- [ ]  `GroupMilestone`

---

# Features

- [ ]  Create group
- [ ]  Join group
- [ ]  Leave group
- [ ]  Group roles
- [ ]  Group progress tracking
- [ ]  Group leaderboard

---

# APIs

- [ ]  Create group API
- [ ]  Join group API
- [ ]  Leave group API
- [ ]  Group leaderboard API

---

# Concurrency

- [ ]  Prevent duplicate joins
- [ ]  Prevent milestone race conditions

---

# Part 8 — AI SYSTEM & EVENTS

# Gemini Integration

- [ ]  Configure WebClient
- [ ]  Configure API key
- [ ]  Timeout handling
- [ ]  Retry handling

---

# AI Features

- [ ]  Generate roadmap
- [ ]  Parse structured JSON
- [ ]  Save generated roadmap
- [ ]  Deduct coins before generation

---

# AI Logs

- [ ]  `AiGenerationLog`
- [ ]  Store token usage
- [ ]  Store request metadata

---

# Events

- [ ]  `TaskCompletedEvent`
- [ ]  `RoadmapUpvotedEvent`
- [ ]  `CoinsEarnedEvent`
- [ ]  `VerificationTriggeredEvent`

---

# Async Processing

- [ ]  Async AI generation
- [ ]  Background event handling

---

# Part 9 — PERFORMANCE & TESTING

# Redis

- [ ]  Configure Redis cache
- [ ]  Cache leaderboard
- [ ]  Cache trending roadmaps
- [ ]  Cache hot roadmaps

---

# Query Optimization

- [ ]  Eliminate N+1
- [ ]  Add entity graphs
- [ ]  Optimize joins
- [ ]  Optimize pagination queries

---

# Unit Testing

- [ ]  Auth tests
- [ ]  Coin tests
- [ ]  Verification tests
- [ ]  Tracking tests

---

# Integration Testing

- [ ]  Register → Login flow
- [ ]  Create roadmap flow
- [ ]  Coin transaction flow
- [ ]  AI generation flow

---

# Security Testing

- [ ]  Unauthorized access
- [ ]  Forbidden roles
- [ ]  Token tampering
- [ ]  Rate limiting

---

# Part 10 — DEPLOYMENT & HARDENING

# Docker

- [ ]  Multi-stage Dockerfile
- [ ]  Docker Compose
- [ ]  PostgreSQL container
- [ ]  Redis container

---

# Production Config

- [ ]  Disable SQL logs
- [ ]  Secure secrets
- [ ]  Production profile
- [ ]  Environment variables

---

# Spring Actuator

- [ ]  Enable health endpoint
- [ ]  Configure metrics
- [ ]  Hide sensitive endpoints

---

# CI/CD

- [ ]  GitHub Actions build
- [ ]  Run tests in pipeline
- [ ]  Docker build pipeline

---

# Final Security

- [ ]  No hardcoded secrets
- [ ]  No exposed stack traces
- [ ]  Secure JWT expiry
- [ ]  Proper CORS
- [ ]  Validate all inputs

---

# Final Performance

- [ ]  Verify indexes
- [ ]  Verify cache hit rates
- [ ]  Verify pagination
- [ ]  Verify query count

---

# Final Documentation

- [ ]  README completed
- [ ]  API documentation
- [ ]  ER diagram
- [ ]  Architecture diagram
- [ ]  Postman collection
- [ ]  Deployment guide

---

# FINAL SUCCESS CHECKLIST

# Core Engineering

- [ ]  JWT authentication works
- [ ]  Refresh token works
- [ ]  Role-based access works
- [ ]  Roadmap CRUD works
- [ ]  Fork lineage works
- [ ]  Tracking works
- [ ]  Coin ledger works
- [ ]  Verification works
- [ ]  AI generation works
- [ ]  Group system works

---

# Scalability

- [ ]  Redis caching works
- [ ]  No N+1 problems
- [ ]  Proper indexing
- [ ]  Pagination everywhere
- [ ]  Async event handling works

---

# Security

- [ ]  All APIs secured
- [ ]  Validation everywhere
- [ ]  Rate limiting works
- [ ]  No exposed secrets
- [ ]  Proper authorization

---

# DevOps

- [ ]  Docker works
- [ ]  CI/CD works
- [ ]  Production config works
- [ ]  Health checks work

---

# Interview Readiness

- [ ]  Can explain architecture
- [ ]  Can explain ledger design
- [ ]  Can explain N+1 solution
- [ ]  Can explain caching
- [ ]  Can explain event-driven design
- [ ]  Can explain transactional boundaries
- [ ]  Can explain JWT lifecycle
- [ ]  Can explain concurrency handling