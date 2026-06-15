# Thadam AI Backend - Architecture Specification

**Version**: 1.0  
**Date**: 2026-06-11  
**Status**: Design Phase (Pre-Code)

---

## Table of Contents

1. [Bounded Contexts](#bounded-contexts)
2. [Package Structure](#package-structure)
3. [Database Schema](#database-schema)
4. [Entity Relationships](#entity-relationships)
5. [Domain Events](#domain-events)
6. [Redis Strategy](#redis-strategy)
7. [API Surface](#api-surface)
8. [Security Architecture](#security-architecture)
9. [Monitoring Architecture](#monitoring-architecture)
10. [Cross-Cutting Concerns](#cross-cutting-concerns)

---

## 1. Bounded Contexts

### 1.1 Auth Context (Authentication & Tokens)

**Purpose**: Manage user authentication, JWT tokens, refresh tokens, and session lifecycle.

**Entities**:
- User (with UserDetails implementation)
- RefreshToken
- TokenBlacklist (for logout)
- EmailVerification

**Key Flows**:
- Register → Email Verification → Activate
- Login → Generate JWT + Refresh Token
- Refresh → Validate & Rotate
- Logout → Invalidate Tokens & Add to Blacklist
- OAuth2 Login → Create/Link User → Generate Tokens

**Boundaries**:
- Does NOT manage user profiles (that's User Context)
- Does NOT manage roles (that's Authorization Context, separate concern)
- Does NOT manage user data beyond authentication state

---

### 1.2 Authorization Context (RBAC & Permissions)

**Purpose**: Manage roles, permissions, and method-level security policies.

**Entities**:
- Role (USER, MODERATOR, ADMIN)
- Permission (implied through @PreAuthorize)
- RoleHierarchy (ADMIN > MODERATOR > USER)

**Key Features**:
- Role Hierarchy: Admin inherits moderator + user permissions
- Method-level security via @EnableMethodSecurity
- API endpoint authorization

**Boundaries**:
- Does NOT manage user data
- Does NOT manage tokens
- Pure authorization policy layer

---

### 1.3 User Context (User Profiles & Data)

**Purpose**: Manage user profiles, personal data, and account settings.

**Entities**:
- User (core entity, implements UserDetails)
- UserProfile (extended user info)
- UserSettings
- UserAuditLog (soft deletes, modifications)

**Key Features**:
- Soft deletes (users can be marked inactive, not deleted)
- Audit fields (createdAt, updatedAt, deletedAt, createdBy, updatedBy)
- UUID public identifiers for user references
- Profile picture, bio, preferences

**Boundaries**:
- Does NOT handle authentication tokens (Auth Context)
- Does NOT handle role definitions (Authorization Context)
- Focuses on user data and preferences

---

### 1.4 Roadmap Context (Learning Paths & Milestones)

**Purpose**: Manage roadmaps (learning paths), milestones, and tasks.

**Entities**:
- Roadmap (main entity, owner is a User)
- Milestone (grouped tasks, belongs to Roadmap)
- Task (individual learnable unit, belongs to Milestone)
- TaskDependency (Task → Task relationships)
- RoadmapTemplate (reusable roadmap blueprints)
- RoadmapFork (copy & customize roadmap)

**Key Features**:
- Roadmap ownership and collaboration (followers, contributors)
- Task dependencies (sequential, parallel)
- Task status (TODO, IN_PROGRESS, COMPLETED, BLOCKED)
- Full-text search, filtering, sorting, pagination
- Roadmap templates for common learning paths

**Boundaries**:
- Does NOT track user progress across roadmaps (Progress Context does that)
- Does NOT manage coins/rewards (Gamification Context does that)
- Defines structure; progress tracking is separate

---

### 1.5 Progress Context (User Progress & Tracking)

**Purpose**: Track user progress on roadmaps, milestones, and tasks.

**Entities**:
- RoadmapProgress (user progress on a roadmap)
- TaskProgress (user progress on a task)
- MilestoneProgress (user progress on a milestone)
- ProgressHistory (audit trail of progress changes)

**Key Features**:
- Auto-calculation of completion percentages
- Status transitions (TODO → IN_PROGRESS → COMPLETED)
- Timestamps for started/completed dates
- History tracking for analytics

**Boundaries**:
- Does NOT define roadmaps (Roadmap Context)
- Does NOT manage coins/rewards (Gamification Context)
- Pure progress tracking

---

### 1.6 Gamification Context (Coins, Streaks, Achievements)

**Purpose**: Manage user engagement through coins, streaks, and achievements.

**Entities**:
- Wallet (user's coin balance)
- CoinLedger (immutable transaction history)
- CoinTransaction (earn/spend events)
- Streak (daily/weekly completion streaks)
- Achievement (badges/milestones achieved)
- AchievementProgress (user progress toward achievements)

**Key Features**:
- Immutable ledger (no updates, only appends)
- Transactions: EARN (task completion, referral), SPEND (rewards, hints)
- Streak tracking: current, longest, reset on miss
- Achievement system: badges for milestones
- Reward catalog (redeemable items)

**Boundaries**:
- Does NOT track task completion (Progress Context does that)
- Does NOT manage learning content (Roadmap Context)
- Pure engagement mechanics

---

### 1.7 Notification Context (Alerts & Messages)

**Purpose**: Manage user notifications, emails, and alerts.

**Entities**:
- Notification (in-app alerts)
- EmailNotification (email templates)
- NotificationPreference (user opt-ins)
- NotificationAuditLog (sent notifications history)

**Key Features**:
- Push notifications
- Email notifications
- User preference management
- Async event-driven sending

**Boundaries**:
- Does NOT send directly; consumes domain events
- Does NOT manage users (User Context)

---

## 2. Package Structure

### 2.1 Target Structure

```
com.thadam.ai
├── common/                           # Shared utilities, configs, exceptions
│   ├── config/                      # Spring configs
│   │   ├── SecurityConfig
│   │   ├── CacheConfig
│   │   ├── AuditConfig
│   │   └── OpenApiConfig
│   ├── exception/                   # Global exceptions
│   │   ├── GlobalExceptionHandler
│   │   ├── ThadamException
│   │   ├── EntityNotFoundException
│   │   ├── ValidationException
│   │   └── UnauthorizedException
│   ├── response/                    # Response wrappers
│   │   ├── ApiResponse<T>
│   │   ├── PageResponse<T>
│   │   └── ErrorResponse
│   ├── util/                        # Utilities
│   │   ├── JwtUtil
│   │   ├── EncryptionUtil
│   │   ├── DateUtil
│   │   └── UuidUtil
│   ├── audit/                       # Audit fields and listeners
│   │   ├── Auditable
│   │   ├── AuditableListener
│   │   └── AuditFields
│   └── constants/                   # App constants
│       ├── SecurityConstants
│       ├── CacheConstants
│       └── ApiConstants
│
├── auth/                             # Authentication & Tokens
│   ├── controller/
│   │   └── AuthController
│   ├── service/
│   │   ├── AuthService
│   │   ├── JwtService
│   │   ├── RefreshTokenService
│   │   ├── EmailVerificationService
│   │   └── CustomUserDetailsService
│   ├── security/
│   │   ├── JwtAuthenticationFilter
│   │   ├── JwtAuthenticationEntryPoint
│   │   └── OAuth2SuccessHandler
│   ├── dto/
│   │   ├── RegisterRequest
│   │   ├── LoginRequest
│   │   ├── RefreshTokenRequest
│   │   ├── TokenResponse
│   │   ├── CurrentUserResponse
│   │   └── EmailVerificationRequest
│   ├── entity/
│   │   ├── User (implements UserDetails)
│   │   ├── RefreshToken
│   │   ├── TokenBlacklist
│   │   └── EmailVerification
│   └── repository/
│       ├── UserRepository
│       ├── RefreshTokenRepository
│       ├── TokenBlacklistRepository
│       └── EmailVerificationRepository
│
├── authorization/                    # RBAC & Method Security
│   ├── enums/
│   │   ├── Role
│   │   └── Permission
│   ├── config/
│   │   └── RoleHierarchyConfig
│   └── annotation/
│       └── RequireRole (custom annotations)
│
├── user/                             # User Profiles & Settings
│   ├── controller/
│   │   ├── UserController
│   │   └── AdminUserController
│   ├── service/
│   │   ├── UserService
│   │   ├── UserProfileService
│   │   ├── UserSettingsService
│   │   └── AdminUserService
│   ├── dto/
│   │   ├── UserProfileResponse
│   │   ├── UserSettingsRequest
│   │   ├── UserUpdateRequest
│   │   └── AdminUserListResponse
│   ├── entity/
│   │   ├── UserProfile
│   │   ├── UserSettings
│   │   └── UserAuditLog
│   ├── repository/
│   │   ├── UserProfileRepository
│   │   ├── UserSettingsRepository
│   │   └── UserAuditLogRepository
│   └── mapper/
│       ├── UserProfileMapper
│       └── UserSettingsMapper
│
├── roadmap/                          # Roadmaps, Milestones, Tasks
│   ├── controller/
│   │   ├── RoadmapController
│   │   ├── MilestoneController
│   │   └── TaskController
│   ├── service/
│   │   ├── RoadmapService
│   │   ├── MilestoneService
│   │   ├── TaskService
│   │   ├── RoadmapTemplateService
│   │   ├── RoadmapSearchService
│   │   └── TaskDependencyService
│   ├── dto/
│   │   ├── RoadmapCreateRequest
│   │   ├── RoadmapResponse
│   │   ├── MilestoneResponse
│   │   ├── TaskResponse
│   │   ├── TaskDependencyResponse
│   │   └── SearchRoadmapRequest
│   ├── entity/
│   │   ├── Roadmap
│   │   ├── Milestone
│   │   ├── Task
│   │   ├── TaskDependency
│   │   ├── RoadmapTemplate
│   │   └── RoadmapFork
│   ├── repository/
│   │   ├── RoadmapRepository (with custom queries)
│   │   ├── MilestoneRepository
│   │   ├── TaskRepository
│   │   ├── TaskDependencyRepository
│   │   ├── RoadmapTemplateRepository
│   │   └── RoadmapForkRepository
│   ├── mapper/
│   │   ├── RoadmapMapper
│   │   ├── MilestoneMapper
│   │   ├── TaskMapper
│   │   └── TaskDependencyMapper
│   └── specification/
│       └── RoadmapSpecification (for dynamic queries)
│
├── progress/                         # User Progress Tracking
│   ├── controller/
│   │   └── ProgressController
│   ├── service/
│   │   ├── RoadmapProgressService
│   │   ├── TaskProgressService
│   │   ├── MilestoneProgressService
│   │   └── ProgressCalculationService
│   ├── dto/
│   │   ├── RoadmapProgressResponse
│   │   ├── TaskProgressUpdateRequest
│   │   └── ProgressHistoryResponse
│   ├── entity/
│   │   ├── RoadmapProgress
│   │   ├── TaskProgress
│   │   ├── MilestoneProgress
│   │   └── ProgressHistory
│   ├── repository/
│   │   ├── RoadmapProgressRepository
│   │   ├── TaskProgressRepository
│   │   ├── MilestoneProgressRepository
│   │   └── ProgressHistoryRepository
│   └── mapper/
│       └── ProgressMapper
│
├── gamification/                     # Coins, Streaks, Achievements
│   ├── controller/
│   │   ├── WalletController
│   │   ├── StreakController
│   │   └── AchievementController
│   ├── service/
│   │   ├── WalletService
│   │   ├── CoinLedgerService
│   │   ├── StreakService
│   │   ├── AchievementService
│   │   └── RewardService
│   ├── dto/
│   │   ├── WalletResponse
│   │   ├── CoinTransactionResponse
│   │   ├── StreakResponse
│   │   ├── AchievementResponse
│   │   └── RedeemRewardRequest
│   ├── entity/
│   │   ├── Wallet
│   │   ├── CoinLedger
│   │   ├── CoinTransaction
│   │   ├── Streak
│   │   ├── Achievement
│   │   ├── AchievementProgress
│   │   └── Reward
│   ├── repository/
│   │   ├── WalletRepository
│   │   ├── CoinLedgerRepository
│   │   ├── CoinTransactionRepository
│   │   ├── StreakRepository
│   │   ├── AchievementRepository
│   │   ├── AchievementProgressRepository
│   │   └── RewardRepository
│   ├── mapper/
│   │   ├── WalletMapper
│   │   ├── StreakMapper
│   │   └── AchievementMapper
│   └── enums/
│       ├── TransactionType (EARN, SPEND)
│       ├── TransactionSource (TASK_COMPLETION, REFERRAL, etc.)
│       └── AchievementType
│
├── notification/                     # Notifications & Events
│   ├── controller/
│   │   └── NotificationController
│   ├── service/
│   │   ├── NotificationService
│   │   ├── EmailNotificationService
│   │   ├── PushNotificationService
│   │   └── NotificationPreferenceService
│   ├── dto/
│   │   ├── NotificationResponse
│   │   ├── NotificationPreferenceRequest
│   │   └── SendNotificationRequest
│   ├── entity/
│   │   ├── Notification
│   │   ├── EmailNotification
│   │   ├── NotificationPreference
│   │   └── NotificationAuditLog
│   ├── repository/
│   │   ├── NotificationRepository
│   │   ├── EmailNotificationRepository
│   │   ├── NotificationPreferenceRepository
│   │   └── NotificationAuditLogRepository
│   ├── listener/
│   │   ├── TaskCompletedEventListener
│   │   ├── AchievementUnlockedEventListener
│   │   └── StreakMilestoneEventListener
│   └── mapper/
│       └── NotificationMapper
│
├── event/                            # Domain Events & Outbox
│   ├── domain/
│   │   ├── DomainEvent
│   │   ├── TaskCompletedEvent
│   │   ├── RoadmapCompletedEvent
│   │   ├── CoinsEarnedEvent
│   │   ├── AchievementUnlockedEvent
│   │   ├── StreakMilestoneEvent
│   │   ├── UserRegisteredEvent
│   │   └── UserDeletedEvent
│   ├── publisher/
│   │   ├── DomainEventPublisher
│   │   └── OutboxPublisher
│   ├── entity/
│   │   ├── OutboxEvent (for transactional outbox pattern)
│   │   └── OutboxEventAudit
│   ├── repository/
│   │   └── OutboxEventRepository
│   ├── handler/
│   │   └── OutboxEventPoller (async processor)
│   └── config/
│       └── EventConfig
│
├── monitoring/                       # Observability
│   ├── config/
│   │   ├── PrometheusConfig
│   │   └── MicrometerConfig
│   ├── metrics/
│   │   ├── AuthMetrics
│   │   ├── RoadmapMetrics
│   │   └── GamificationMetrics
│   └── health/
│       └── CustomHealthIndicators
│
└── ThadamAiApplication (main class)
```

---

## 3. Database Schema

### 3.1 Core Tables

#### users (Auth Context)
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    public_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
    provider_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_public_id ON users(public_id);
CREATE INDEX idx_users_provider_id ON users(provider, provider_id);
```

#### user_profiles (User Context)
```sql
CREATE TABLE user_profiles (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL UNIQUE,
    bio TEXT,
    avatar_url VARCHAR(512),
    cover_image_url VARCHAR(512),
    location VARCHAR(255),
    website_url VARCHAR(512),
    social_links JSONB,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

#### refresh_tokens (Auth Context)
```sql
CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(512) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    rotation_version INT DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expiry ON refresh_tokens(expiry_date);
```

#### token_blacklist (Auth Context)
```sql
CREATE TABLE token_blacklist (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    token_hash VARCHAR(512) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_token_blacklist_token_hash ON token_blacklist(token_hash);
CREATE INDEX idx_token_blacklist_expiry ON token_blacklist(expiry_date);
```

#### email_verifications (Auth Context)
```sql
CREATE TABLE email_verifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(512) NOT NULL UNIQUE,
    verified BOOLEAN DEFAULT FALSE,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_token_hash ON email_verifications(token_hash);
```

---

### 3.2 Roadmap Domain Tables

#### roadmaps (Roadmap Context)
```sql
CREATE TABLE roadmaps (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    public_id UUID NOT NULL UNIQUE,
    owner_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(50),
    estimated_hours INT,
    thumbnail_url VARCHAR(512),
    is_public BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX idx_roadmaps_owner_id ON roadmaps(owner_id);
CREATE INDEX idx_roadmaps_public_id ON roadmaps(public_id);
CREATE INDEX idx_roadmaps_is_template ON roadmaps(is_template);
CREATE INDEX idx_roadmaps_created_at ON roadmaps(created_at DESC);
```

#### milestones (Roadmap Context)
```sql
CREATE TABLE milestones (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    roadmap_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    position INT NOT NULL,
    estimated_hours INT,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
    UNIQUE(roadmap_id, position)
);

CREATE INDEX idx_milestones_roadmap_id ON milestones(roadmap_id);
```

#### tasks (Roadmap Context)
```sql
CREATE TABLE tasks (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    public_id UUID NOT NULL UNIQUE,
    milestone_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    position INT NOT NULL,
    difficulty VARCHAR(50),
    estimated_hours INT,
    resources JSONB,
    hints JSONB,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
    UNIQUE(milestone_id, position)
);

CREATE INDEX idx_tasks_milestone_id ON tasks(milestone_id);
CREATE INDEX idx_tasks_public_id ON tasks(public_id);
```

#### task_dependencies (Roadmap Context)
```sql
CREATE TABLE task_dependencies (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    parent_task_id BIGINT NOT NULL,
    dependent_task_id BIGINT NOT NULL,
    dependency_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (dependent_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(parent_task_id, dependent_task_id)
);

CREATE INDEX idx_task_dependencies_parent ON task_dependencies(parent_task_id);
CREATE INDEX idx_task_dependencies_dependent ON task_dependencies(dependent_task_id);
```

#### roadmap_forks (Roadmap Context)
```sql
CREATE TABLE roadmap_forks (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    original_roadmap_id BIGINT NOT NULL,
    forked_roadmap_id BIGINT NOT NULL,
    forked_by_user_id BIGINT NOT NULL,
    forked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (original_roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
    FOREIGN KEY (forked_roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
    FOREIGN KEY (forked_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_roadmap_forks_original ON roadmap_forks(original_roadmap_id);
CREATE INDEX idx_roadmap_forks_forked ON roadmap_forks(forked_roadmap_id);
```

---

### 3.3 Progress Tracking Tables

#### roadmap_progress (Progress Context)
```sql
CREATE TABLE roadmap_progress (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    roadmap_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'NOT_STARTED',
    completion_percentage INT DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
    UNIQUE(user_id, roadmap_id)
);

CREATE INDEX idx_roadmap_progress_user_id ON roadmap_progress(user_id);
CREATE INDEX idx_roadmap_progress_roadmap_id ON roadmap_progress(roadmap_id);
CREATE INDEX idx_roadmap_progress_status ON roadmap_progress(status);
```

#### task_progress (Progress Context)
```sql
CREATE TABLE task_progress (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'TODO',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(user_id, task_id)
);

CREATE INDEX idx_task_progress_user_id ON task_progress(user_id);
CREATE INDEX idx_task_progress_task_id ON task_progress(task_id);
CREATE INDEX idx_task_progress_status ON task_progress(status);
```

#### milestone_progress (Progress Context)
```sql
CREATE TABLE milestone_progress (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    milestone_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'NOT_STARTED',
    completion_percentage INT DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
    UNIQUE(user_id, milestone_id)
);

CREATE INDEX idx_milestone_progress_user_id ON milestone_progress(user_id);
CREATE INDEX idx_milestone_progress_milestone_id ON milestone_progress(milestone_id);
```

#### progress_history (Progress Context)
```sql
CREATE TABLE progress_history (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    task_id BIGINT,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX idx_progress_history_user_id ON progress_history(user_id);
CREATE INDEX idx_progress_history_task_id ON progress_history(task_id);
CREATE INDEX idx_progress_history_changed_at ON progress_history(changed_at DESC);
```

---

### 3.4 Gamification Tables

#### wallets (Gamification Context)
```sql
CREATE TABLE wallets (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL UNIQUE,
    balance BIGINT DEFAULT 0,
    total_earned BIGINT DEFAULT 0,
    total_spent BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
```

#### coin_ledger (Gamification Context - Immutable)
```sql
CREATE TABLE coin_ledger (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    wallet_id BIGINT NOT NULL,
    transaction_id BIGINT UNIQUE,
    amount BIGINT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    source VARCHAR(100),
    description VARCHAR(512),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
);

CREATE INDEX idx_coin_ledger_wallet_id ON coin_ledger(wallet_id);
CREATE INDEX idx_coin_ledger_created_at ON coin_ledger(created_at DESC);
```

#### coin_transactions (Gamification Context)
```sql
CREATE TABLE coin_transactions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    wallet_id BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    source VARCHAR(100) NOT NULL,
    description VARCHAR(512),
    reference_id VARCHAR(255),
    reference_type VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
);

CREATE INDEX idx_coin_transactions_wallet_id ON coin_transactions(wallet_id);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at DESC);
```

#### streaks (Gamification Context)
```sql
CREATE TABLE streaks (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL UNIQUE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_streaks_user_id ON streaks(user_id);
```

#### achievements (Gamification Context)
```sql
CREATE TABLE achievements (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    public_id UUID NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url VARCHAR(512),
    badge_type VARCHAR(100),
    criteria JSONB,
    reward_coins INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
);

CREATE INDEX idx_achievements_public_id ON achievements(public_id);
```

#### achievement_progress (Gamification Context)
```sql
CREATE TABLE achievement_progress (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    progress INT DEFAULT 0,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_achievement_progress_user_id ON achievement_progress(user_id);
CREATE INDEX idx_achievement_progress_achievement_id ON achievement_progress(achievement_id);
CREATE INDEX idx_achievement_progress_unlocked ON achievement_progress(unlocked);
```

---

### 3.5 Notification Tables

#### notifications (Notification Context)
```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(read);
```

#### email_notifications (Notification Context)
```sql
CREATE TABLE email_notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    template_name VARCHAR(100),
    template_data JSONB,
    status VARCHAR(50) DEFAULT 'PENDING',
    sent_at TIMESTAMP,
    failed_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX idx_email_notifications_status ON email_notifications(status);
```

#### notification_preferences (Notification Context)
```sql
CREATE TABLE notification_preferences (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    task_completion_notifications BOOLEAN DEFAULT TRUE,
    achievement_notifications BOOLEAN DEFAULT TRUE,
    streak_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
```

---

### 3.6 Event & Audit Tables

#### outbox_events (Event Context - for transactional outbox pattern)
```sql
CREATE TABLE outbox_events (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    aggregate_id VARCHAR(255) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    failed BOOLEAN DEFAULT FALSE,
    failure_reason TEXT,
    retry_count INT DEFAULT 0
);

CREATE INDEX idx_outbox_events_published ON outbox_events(published_at);
CREATE INDEX idx_outbox_events_failed ON outbox_events(failed);
CREATE INDEX idx_outbox_events_created_at ON outbox_events(created_at);
```

#### audit_logs (Common - general audit trail)
```sql
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

---

## 4. Entity Relationships

### 4.1 Relationship Diagram (ASCII)

```
Users (Auth Context)
  ├─── 1:N ──→ RefreshTokens
  ├─── 1:1 ──→ UserProfiles (User Context)
  ├─── 1:1 ──→ TokenBlacklist
  ├─── 1:1 ──→ EmailVerifications
  ├─── 1:1 ──→ Wallets (Gamification Context)
  ├─── 1:1 ──→ Streaks (Gamification Context)
  ├─── 1:N ──→ Notifications (Notification Context)
  ├─── 1:N ──→ Roadmaps (owner_id) (Roadmap Context)
  ├─── 1:N ──→ RoadmapProgress (Progress Context)
  ├─── 1:N ──→ TaskProgress (Progress Context)
  ├─── 1:N ──→ AchievementProgress (Gamification Context)
  └─── 1:N ──→ CoinTransactions (via Wallet)

Roadmaps (Roadmap Context)
  ├─── 1:N ──→ Milestones
  ├─── 1:N ──→ RoadmapProgress
  ├─── 1:N ──→ RoadmapForks (original)
  └─── 1:N ──→ RoadmapForks (forked)

Milestones (Roadmap Context)
  ├─── 1:N ──→ Tasks
  └─── 1:N ──→ MilestoneProgress

Tasks (Roadmap Context)
  ├─── N:N ──→ Tasks (TaskDependencies)
  ├─── 1:N ──→ TaskProgress
  └─── 1:N ──→ ProgressHistory

Wallets (Gamification Context)
  ├─── 1:N ──→ CoinLedger (immutable)
  └─── 1:N ──→ CoinTransactions

Achievements (Gamification Context)
  └─── 1:N ──→ AchievementProgress

Streaks (Gamification Context)
  └─── User (1:1)
```

### 4.2 Cardinality Notes

- **User : RefreshToken** → 1:N (user can have multiple refresh tokens for different devices)
- **User : Wallet** → 1:1 (each user has exactly one wallet)
- **User : Streak** → 1:1 (each user has exactly one streak tracker)
- **Roadmap : Milestone** → 1:N (roadmap contains multiple milestones)
- **Milestone : Task** → 1:N (milestone contains multiple tasks)
- **Task : Task** → N:N (tasks can have dependencies on other tasks)
- **Task : TaskProgress** → 1:N (a task can have progress tracked by multiple users)
- **CoinLedger : CoinTransaction** → 1:1 (each transaction creates exactly one ledger entry)
- **Achievement : AchievementProgress** → 1:N (achievement tracked by multiple users)

---

## 5. Domain Events

### 5.1 Event Types & Publishers

#### Auth Context Events
```
UserRegisteredEvent
  - aggregate_id: user.public_id
  - email: user.email
  - name: user.name
  - timestamp: now
  → Published by: AuthService.register()
  → Consumed by: NotificationService (send welcome email), WalletService (create wallet)

UserLoggedInEvent
  - aggregate_id: user.public_id
  - ip_address: request.ip
  - user_agent: request.ua
  - timestamp: now
  → Published by: AuthService.login()
  → Consumed by: AuditService, AnalyticsService

RefreshTokenRevokedEvent
  - aggregate_id: user.public_id
  - timestamp: now
  → Published by: AuthService.logout()
  → Consumed by: TokenBlacklistService

UserEmailVerifiedEvent
  - aggregate_id: user.public_id
  - email: user.email
  - timestamp: now
  → Published by: EmailVerificationService.verify()
  → Consumed by: NotificationService (send activation email)
```

#### Roadmap Context Events
```
RoadmapCreatedEvent
  - aggregate_id: roadmap.public_id
  - owner_id: roadmap.owner_id
  - title: roadmap.title
  - timestamp: now
  → Published by: RoadmapService.create()
  → Consumed by: AnalyticsService

RoadmapForkEvent
  - aggregate_id: original_roadmap.public_id
  - forked_roadmap_id: new_roadmap.public_id
  - forked_by: user.public_id
  - timestamp: now
  → Published by: RoadmapService.fork()
  → Consumed by: NotificationService (notify original owner)
```

#### Progress Context Events
```
TaskCompletedEvent
  - aggregate_id: task.public_id
  - user_id: user.public_id
  - roadmap_id: roadmap.public_id
  - timestamp: now
  → Published by: ProgressService.completeTask()
  → Consumed by: 
    - CoinsEarnedPublisher (award coins)
    - StreakService (update streak)
    - MilestoneProgressService (update milestone)
    - AchievementService (check unlocks)
    - NotificationService

RoadmapCompletedEvent
  - aggregate_id: roadmap.public_id
  - user_id: user.public_id
  - timestamp: now
  → Published by: ProgressService.completeRoadmap()
  → Consumed by:
    - AchievementService (unlock milestone badges)
    - LeaderboardService (update rankings)
    - NotificationService

TaskBlockedEvent
  - aggregate_id: task.public_id
  - user_id: user.public_id
  - blocked_by_task_id: blocking_task.public_id
  - timestamp: now
  → Published by: ProgressService.blockTask()
  → Consumed by: NotificationService
```

#### Gamification Context Events
```
CoinsEarnedEvent
  - aggregate_id: user.public_id
  - amount: coins_earned
  - source: TASK_COMPLETION | REFERRAL | BONUS
  - reference_id: task.public_id or referral.id
  - timestamp: now
  → Published by: CoinLedgerService.recordEarning()
  → Consumed by: NotificationService, WalletService, AchievementService

StreakMilestoneEvent
  - aggregate_id: user.public_id
  - current_streak: streak_count
  - is_longest: boolean
  - milestone_day: streak day number
  - timestamp: now
  → Published by: StreakService.recordActivity()
  → Consumed by: AchievementService, NotificationService

AchievementUnlockedEvent
  - aggregate_id: user.public_id
  - achievement_id: achievement.public_id
  - achievement_name: achievement.name
  - reward_coins: achievement.reward_coins
  - timestamp: now
  → Published by: AchievementService.unlock()
  → Consumed by:
    - NotificationService (send badge notification)
    - CoinsEarnedPublisher (award bonus coins)
    - LeaderboardService (update achievements)
```

### 5.2 Event Publishing Strategy (Transactional Outbox Pattern)

```
1. Service method executes business logic
2. Domain event created and added to aggregate
3. Aggregate persisted to database
4. OutboxEvent record created in same transaction
5. Transaction commits (both aggregate and outbox event)
6. Separate async processor polls outbox
7. Processor publishes event to listeners
8. Listeners update with @Async methods
9. OutboxEvent marked as published
10. If publishing fails, retry with exponential backoff
```

---

## 6. Redis Strategy

### 6.1 Redis Key Naming Convention

```
Pattern: {context}:{entity}:{identifier}:{attribute}
TTL: Specified per key type
Expiry: Specified per key type
```

### 6.2 Cache Keys by Context

#### Auth Context
```
auth:token:blacklist:{token_hash}
  - Type: STRING
  - Value: timestamp_of_blacklist
  - TTL: expires with JWT token
  - Usage: Check if token is blacklisted on every request

auth:user:email:{email}
  - Type: STRING
  - Value: User JSON (serialized)
  - TTL: 1 hour
  - Usage: Fast user lookup by email for login

auth:refresh_token:rotation:{user_id}
  - Type: STRING
  - Value: latest_rotation_version
  - TTL: 7 days
  - Usage: Detect refresh token reuse attacks

auth:email_verification:{token_hash}
  - Type: STRING
  - Value: user_id
  - TTL: 24 hours
  - Usage: Store email verification tokens
```

#### User Context
```
user:profile:{user_id}
  - Type: HASH
  - Value: serialized UserProfile
  - TTL: 6 hours
  - Usage: Cache user profile for quick access

user:settings:{user_id}
  - Type: HASH
  - Value: serialized UserSettings
  - TTL: 24 hours
  - Usage: Cache user preferences
```

#### Roadmap Context
```
roadmap:entity:{roadmap_id}
  - Type: HASH
  - Value: serialized Roadmap
  - TTL: 2 hours
  - Usage: Cache roadmap metadata

roadmap:tasks:{roadmap_id}
  - Type: LIST
  - Value: list of task IDs (for pagination)
  - TTL: 1 hour
  - Usage: Cache task list within roadmap

roadmap:search:{query_hash}
  - Type: ZSET (sorted by relevance score)
  - Value: roadmap IDs with scores
  - TTL: 30 minutes
  - Usage: Cache full-text search results

roadmap:trending
  - Type: ZSET
  - Value: roadmap IDs with popularity scores
  - TTL: 6 hours
  - Usage: Cache trending roadmaps leaderboard
```

#### Progress Context
```
progress:roadmap:{user_id}:{roadmap_id}
  - Type: HASH
  - Value: serialized RoadmapProgress
  - TTL: 30 minutes
  - Usage: Cache user's roadmap progress

progress:task:{user_id}:{task_id}
  - Type: HASH
  - Value: serialized TaskProgress
  - TTL: 30 minutes
  - Usage: Cache user's task progress
```

#### Gamification Context
```
wallet:{user_id}
  - Type: HASH
  - Value: balance, total_earned, total_spent
  - TTL: 15 minutes
  - Usage: Fast balance lookups

streak:{user_id}
  - Type: HASH
  - Value: current_streak, longest_streak, last_activity_date
  - TTL: 24 hours
  - Usage: Track streak metrics

leaderboard:coins
  - Type: ZSET
  - Value: user IDs with coin balances as scores
  - TTL: 1 hour
  - Usage: Display top coin earners

leaderboard:streaks
  - Type: ZSET
  - Value: user IDs with streak counts as scores
  - TTL: 1 hour
  - Usage: Display top streak holders

achievement:unlocked:{user_id}
  - Type: SET
  - Value: achievement IDs user has unlocked
  - TTL: 6 hours
  - Usage: Quick achievement unlock check
```

#### Rate Limiting
```
ratelimit:login:{ip_address}
  - Type: STRING
  - Value: attempt_count
  - TTL: 15 minutes
  - Usage: Prevent brute force login attempts (max 5 per 15min)

ratelimit:register:{email}
  - Type: STRING
  - Value: attempt_count
  - TTL: 1 hour
  - Usage: Prevent registration spam (max 3 per hour)

ratelimit:api:{user_id}:{endpoint}
  - Type: STRING
  - Value: request_count
  - TTL: 1 minute
  - Usage: API rate limiting (max 100 per minute)
```

### 6.3 Cache Invalidation Strategy

```
On User Update:
  - Delete: user:profile:{user_id}
  - Delete: user:settings:{user_id}
  - Action: Publish event for cache subscribers

On Task Complete:
  - Delete: progress:task:{user_id}:{task_id}
  - Delete: progress:roadmap:{user_id}:{roadmap_id}
  - Update: wallet:{user_id} (invalidate balance)
  - Update: streak:{user_id} (update streak)
  - Delete: leaderboard:coins (regenerate rankings)

On Achievement Unlock:
  - Add to: achievement:unlocked:{user_id}
  - Update: leaderboard:achievements (regenerate)
  - Publish: event notification

On Roadmap Create/Update:
  - Delete: roadmap:search:* (invalidate search cache)
  - Delete: roadmap:trending (regenerate trending)
  - Delete: roadmap:entity:{roadmap_id}
```

---

## 7. API Surface

### 7.1 Auth Endpoints

```
POST /api/auth/register
  - Request: RegisterRequest (email, password, name)
  - Response: TokenResponse (accessToken, refreshToken, expiresIn)
  - Status: 201 CREATED
  - Exception: ConflictException (email already exists)
  - Security: ANONYMOUS

POST /api/auth/login
  - Request: LoginRequest (email, password)
  - Response: TokenResponse
  - Status: 200 OK
  - Exception: UnauthorizedException
  - Security: ANONYMOUS

POST /api/auth/verify-email
  - Request: EmailVerificationRequest (token)
  - Response: ApiResponse
  - Status: 200 OK
  - Security: ANONYMOUS

POST /api/auth/refresh
  - Request: RefreshTokenRequest (refreshToken)
  - Response: TokenResponse
  - Status: 200 OK
  - Exception: UnauthorizedException (token invalid/expired)
  - Security: ANONYMOUS

POST /api/auth/logout
  - Request: (empty body)
  - Response: ApiResponse
  - Status: 200 OK
  - Security: AUTHENTICATED

GET /api/auth/me
  - Request: (none)
  - Response: CurrentUserResponse
  - Status: 200 OK
  - Security: AUTHENTICATED

POST /api/auth/google/callback
  - Request: GoogleAuthRequest (code)
  - Response: TokenResponse
  - Status: 200 OK
  - Security: ANONYMOUS
```

### 7.2 User Endpoints

```
GET /api/users/profile
  - Response: UserProfileResponse
  - Status: 200 OK
  - Security: AUTHENTICATED

PUT /api/users/profile
  - Request: UserProfileUpdateRequest
  - Response: UserProfileResponse
  - Status: 200 OK
  - Security: AUTHENTICATED

PUT /api/users/settings
  - Request: UserSettingsRequest
  - Response: ApiResponse
  - Status: 200 OK
  - Security: AUTHENTICATED

DELETE /api/users/account
  - Request: (empty)
  - Response: ApiResponse
  - Status: 200 OK (soft delete)
  - Security: AUTHENTICATED

GET /api/admin/users?page=0&size=20&role=ADMIN
  - Response: PageResponse<AdminUserListResponse>
  - Status: 200 OK
  - Security: AUTHENTICATED + @PreAuthorize("hasRole('ADMIN')")

DELETE /api/admin/users/{userId}
  - Response: ApiResponse
  - Status: 200 OK
  - Security: AUTHENTICATED + @PreAuthorize("hasRole('ADMIN')")

PATCH /api/admin/users/{userId}/role
  - Request: UpdateUserRoleRequest (role)
  - Response: ApiResponse
  - Status: 200 OK
  - Security: AUTHENTICATED + @PreAuthorize("hasRole('ADMIN')")
```

### 7.3 Roadmap Endpoints

```
POST /api/roadmaps
  - Request: CreateRoadmapRequest
  - Response: RoadmapResponse
  - Status: 201 CREATED
  - Security: AUTHENTICATED + @PreAuthorize("hasRole('USER')")

GET /api/roadmaps/{roadmapId}
  - Response: RoadmapDetailResponse
  - Status: 200 OK
  - Security: AUTHENTICATED

PUT /api/roadmaps/{roadmapId}
  - Request: UpdateRoadmapRequest
  - Response: RoadmapResponse
  - Status: 200 OK
  - Security: AUTHENTICATED + @PreAuthorize("owner or admin")

DELETE /api/roadmaps/{roadmapId}
  - Response: ApiResponse
  - Status: 200 OK (soft delete)
  - Security: AUTHENTICATED + @PreAuthorize("owner or admin")

GET /api/roadmaps?page=0&size=20&category=programming&difficulty=INTERMEDIATE
  - Response: PageResponse<RoadmapResponse>
  - Status: 200 OK
  - Security: ANONYMOUS/AUTHENTICATED

POST /api/roadmaps/{roadmapId}/fork
  - Request: (empty)
  - Response: RoadmapResponse
  - Status: 201 CREATED
  - Security: AUTHENTICATED

GET /api/roadmaps/search?q=python&page=0&size=20
  - Response: PageResponse<RoadmapResponse>
  - Status: 200 OK
  - Security: ANONYMOUS/AUTHENTICATED
```

### 7.4 Task & Progress Endpoints

```
POST /api/tasks
  - Request: CreateTaskRequest
  - Response: TaskResponse
  - Status: 201 CREATED
  - Security: AUTHENTICATED + @PreAuthorize("roadmap owner")

GET /api/tasks/{taskId}
  - Response: TaskDetailResponse
  - Status: 200 OK
  - Security: AUTHENTICATED

PUT /api/tasks/{taskId}
  - Request: UpdateTaskRequest
  - Response: TaskResponse
  - Status: 200 OK
  - Security: AUTHENTICATED + @PreAuthorize("owner")

POST /api/progress/tasks/{taskId}/complete
  - Request: CompleteTaskRequest (proof_link)
  - Response: TaskProgressResponse
  - Status: 200 OK
  - Security: AUTHENTICATED
  - Side Effects: 
    - Create TaskCompletedEvent
    - Award coins
    - Update streaks
    - Check achievements

GET /api/progress/roadmaps/{roadmapId}
  - Response: RoadmapProgressResponse
  - Status: 200 OK
  - Security: AUTHENTICATED

GET /api/progress/tasks/{taskId}
  - Response: TaskProgressResponse
  - Status: 200 OK
  - Security: AUTHENTICATED

PUT /api/progress/tasks/{taskId}/status
  - Request: UpdateTaskStatusRequest (status)
  - Response: TaskProgressResponse
  - Status: 200 OK
  - Security: AUTHENTICATED
```

### 7.5 Gamification Endpoints

```
GET /api/wallet
  - Response: WalletResponse
  - Status: 200 OK
  - Security: AUTHENTICATED

GET /api/wallet/transactions?page=0&size=50
  - Response: PageResponse<CoinTransactionResponse>
  - Status: 200 OK
  - Security: AUTHENTICATED

GET /api/streaks
  - Response: StreakResponse
  - Status: 200 OK
  - Security: AUTHENTICATED

GET /api/achievements
  - Response: PageResponse<AchievementResponse>
  - Status: 200 OK
  - Security: AUTHENTICATED

GET /api/achievements/unlocked
  - Response: List<AchievementResponse>
  - Status: 200 OK
  - Security: AUTHENTICATED

GET /api/leaderboards/coins?page=0&size=100
  - Response: PageResponse<UserLeaderboardEntry>
  - Status: 200 OK
  - Security: ANONYMOUS/AUTHENTICATED

GET /api/leaderboards/streaks?page=0&size=100
  - Response: PageResponse<UserLeaderboardEntry>
  - Status: 200 OK
  - Security: ANONYMOUS/AUTHENTICATED
```

### 7.6 Notification Endpoints

```
GET /api/notifications?unread=true&page=0&size=50
  - Response: PageResponse<NotificationResponse>
  - Status: 200 OK
  - Security: AUTHENTICATED

PUT /api/notifications/{notificationId}/read
  - Response: ApiResponse
  - Status: 200 OK
  - Security: AUTHENTICATED

DELETE /api/notifications/{notificationId}
  - Response: ApiResponse
  - Status: 200 OK
  - Security: AUTHENTICATED

PUT /api/notifications/preferences
  - Request: NotificationPreferenceRequest
  - Response: ApiResponse
  - Status: 200 OK
  - Security: AUTHENTICATED
```

---

## 8. Security Architecture

### 8.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ REQUEST ARRIVES                                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ JwtAuthenticationFilter                                     │
│ 1. Extract Authorization header                            │
│ 2. Check for "Bearer " prefix                              │
│ 3. Parse JWT token                                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ JwtService.validateToken()                                 │
│ 1. Verify signature using secret key                       │
│ 2. Check expiration time                                   │
│ 3. Extract email claim                                     │
│ 4. Check if token in blacklist (Redis)                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ CustomUserDetailsService.loadUserByUsername()              │
│ 1. Query user by email (cached in Redis)                   │
│ 2. Load user authorities from Role                         │
│ 3. Check user active status                                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ SecurityContextHolder.setAuthentication()                  │
│ Create UsernamePasswordAuthenticationToken with:           │
│ - Principal: User object (UserDetails)                     │
│ - Credentials: null (already validated)                    │
│ - Authorities: from role hierarchy                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ SecurityFilterChain                                        │
│ 1. Check @PreAuthorize annotations                         │
│ 2. Verify method-level security                            │
│ 3. Check resource ownership if needed                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ Controller Method Executes                                  │
│ - Authenticated user available via @AuthenticationPrincipal│
│ - User context available in SecurityContext                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ RESPONSE RETURNED                                           │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 JWT Token Structure

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user@example.com",      // email (username)
  "iat": 1234567890,              // issued at
  "exp": 1234571490,              // expires in (15 min default)
  "aud": "thadam-ai-app",         // audience
  "roles": ["ROLE_USER"]          // authorities
}

Signature: HMAC-SHA256(header.payload, secret_key)
```

### 8.3 Refresh Token Strategy

```
1. Issue on Login/Register:
   - Access Token: 15 minutes
   - Refresh Token: 7 days
   - Both stored in secure HTTP-only cookies (frontend preference)

2. On Token Expiry:
   - Client calls POST /api/auth/refresh with refresh token
   - Validate refresh token
   - Check rotation version (detect reuse)
   - Generate new access token + new refresh token
   - Invalidate old refresh token

3. Reuse Detection:
   - Store rotation_version in database
   - If old token used, invalidate all tokens (suspicious activity)
   - Force re-login

4. On Logout:
   - Add access token to blacklist (Redis, TTL = exp time)
   - Add refresh token to blacklist (Redis, TTL = 7 days)
   - Delete all refresh token records for user
```

### 8.4 OAuth2 Google Flow

```
1. Frontend receives Google authorization code

2. POST /api/auth/google/callback with code

3. Backend:
   - Exchange code for Google ID Token
   - Validate ID Token signature
   - Extract email, name, picture, google_sub
   - Query database for existing user

4. If user exists:
   - Link Google provider if not already linked
   - Generate access + refresh tokens
   - Return tokens

5. If user not exists:
   - Create new user with provider=GOOGLE
   - Create wallet, streak records
   - Publish UserRegisteredEvent
   - Generate access + refresh tokens
   - Return tokens
```

### 8.5 Method Security Rules

```
@EnableMethodSecurity enables checking authorization at method level.

Common patterns:

@PreAuthorize("isAuthenticated()")
  - Requires user to be authenticated
  - Usage: private user APIs

@PreAuthorize("hasRole('ADMIN')")
  - Requires ADMIN role (includes inherited permissions)
  - Usage: admin endpoints

@PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
  - Requires either role
  - Usage: moderation endpoints

@PreAuthorize("@roadmapService.isOwner(#roadmapId, authentication.principal.id)")
  - Custom authorization using service methods
  - Usage: resource-specific ownership checks

@PreAuthorize("hasPermission(#roadmapId, 'ROADMAP', 'EDIT')")
  - Checks specific permissions
  - Usage: fine-grained access control
```

### 8.6 Security Headers

```
All responses include:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: default-src 'self'
- Cache-Control: no-cache, no-store, must-revalidate
```

---

## 9. Monitoring Architecture

### 9.1 Metrics (Prometheus)

#### Application Metrics
```
auth_login_total{result="success|failure"}
  - Counter: total login attempts by result

auth_token_refresh_total{result="success|failure"}
  - Counter: total token refresh attempts

auth_registration_total
  - Counter: total user registrations

roadmap_created_total
  - Counter: total roadmaps created

task_completed_total{user_id, roadmap_id}
  - Counter: total tasks completed

coins_earned_total{source}
  - Counter: total coins earned by source (TASK_COMPLETION, REFERRAL)

coins_spent_total{reason}
  - Counter: total coins spent by reason

achievement_unlocked_total{achievement_id}
  - Counter: achievements unlocked by type

http_requests_total{method, endpoint, status}
  - Counter: HTTP request count by method/endpoint/status

http_request_duration_seconds{method, endpoint}
  - Histogram: request duration buckets

cache_hits_total{cache_name}
  - Counter: cache hits by cache type

cache_misses_total{cache_name}
  - Counter: cache misses by cache type

database_query_duration_seconds{query_type}
  - Histogram: query duration by type

active_users_total
  - Gauge: current active users

leaderboard_top_coins{rank}
  - Gauge: top coins by rank

api_rate_limit_exceeded_total{user_id}
  - Counter: rate limit violations
```

#### Infrastructure Metrics
```
jvm_memory_used_bytes{area}
  - Gauge: JVM memory usage

jvm_threads_live_threads
  - Gauge: live thread count

database_connections_active
  - Gauge: active database connections

redis_commands_processed_total
  - Counter: redis commands executed
```

### 9.2 Distributed Tracing

```
Use Spring Cloud Sleuth + Zipkin

Trace ID: Unique per request
Span ID: Unique per service call

Headers propagated:
- X-Trace-ID: {traceId}
- X-Span-ID: {spanId}
- X-Parent-ID: {parentSpanId}

Traced operations:
- HTTP requests
- Database queries
- Redis operations
- Event publishing
- Email sending
```

### 9.3 Structured Logging

```
All logs include:
- timestamp: ISO 8601
- level: DEBUG, INFO, WARN, ERROR
- trace_id: from Sleuth
- user_id: if authenticated
- action: operation being performed
- duration_ms: operation duration
- status: success/failure
- error_message: if failed

Example:
{
  "timestamp": "2026-06-11T10:30:45.123Z",
  "level": "INFO",
  "trace_id": "abc123def456",
  "user_id": "user_uuid",
  "action": "task_completed",
  "task_id": "task_uuid",
  "duration_ms": 245,
  "coins_earned": 50,
  "status": "success"
}
```

### 9.4 Health Checks

```
GET /actuator/health

Returns:
{
  "status": "UP|DOWN",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "hello": 1
      }
    },
    "redis": {
      "status": "UP",
      "details": {
        "version": "7.0"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 107374182400,
        "free": 53687091200
      }
    }
  }
}
```

### 9.5 Alerting Rules

```
Alert: HighErrorRate
  - Threshold: error rate > 5% over 5 minutes
  - Action: Page on-call engineer

Alert: DatabaseConnectionPoolExhausted
  - Threshold: active connections > 90% of pool
  - Action: Notify DevOps

Alert: RedisHighMemory
  - Threshold: memory > 85% of allocated
  - Action: Notify DevOps

Alert: RateLimitingActive
  - Threshold: rate limit violations > 100 per minute
  - Action: Log and investigate potential attack

Alert: TaskCompletionLatency
  - Threshold: p99 > 5 seconds
  - Action: Check database performance
```

---

## 10. Cross-Cutting Concerns

### 10.1 Configuration Management

```
application.yml (common)
  - server.port
  - logging levels
  - actuator settings

application-dev.yml (development)
  - spring.jpa.hibernate.ddl-auto: update
  - debug: true
  - database: dev postgres
  - redis: dev redis

application-prod.yml (production)
  - spring.jpa.hibernate.ddl-auto: validate
  - debug: false
  - security: hardened
  - cors: restricted
  - database: prod postgres
  - redis: prod redis cluster

Properties from environment:
- JWT_SECRET: 256-bit key
- JWT_EXPIRATION: 15m
- REFRESH_TOKEN_EXPIRATION: 7d
- DATABASE_URL: jdbc:postgresql://...
- REDIS_URL: redis://...
- GOOGLE_CLIENT_ID: oauth2 client id
- GOOGLE_CLIENT_SECRET: oauth2 secret
- SMTP_HOST: email server
- SMTP_PORT: 587
- SMTP_USERNAME: email account
- SMTP_PASSWORD: email password
```

### 10.2 Aspect-Oriented Programming (AOP)

```
@LogExecutionTime
  - Logs method execution time
  - Usage: service methods

@CacheEvict
  - Evicts cache when entity changes
  - Usage: update/delete methods

@Transactional
  - Manages database transactions
  - Rollback on exception
  - Usage: service methods with DB changes

@Validate
  - Validates method parameters
  - Usage: controller methods

@Audit
  - Records action in audit log
  - Usage: sensitive operations (delete, role change)
```

### 10.3 Exception Handling

```
Hierarchy:
ThadamException (base)
  ├── EntityNotFoundException (404)
  ├── ValidationException (400)
  ├── UnauthorizedException (401)
  ├── ForbiddenException (403)
  ├── ConflictException (409)
  ├── InternalServerException (500)
  └── ServiceException (500)

GlobalExceptionHandler catches all and returns:
{
  "success": false,
  "message": "Human readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-06-11T10:30:45.123Z",
  "trace_id": "abc123",
  "details": {
    "field": "email",
    "error": "Already exists"
  }
}
```

### 10.4 Validation

```
- Use Jakarta Validation annotations (@NotNull, @Email, etc.)
- Custom validators for business rules
- Field-level validation in DTOs
- Service-level validation for workflows
- Database constraints as final safety net

Example:
record CreateTaskRequest(
  @NotBlank @Size(min=5, max=255) String title,
  @NotBlank String description,
  @Min(1) @Max(40) Integer estimatedHours,
  @NotNull Long milestoneId
) {}
```

### 10.5 Pagination & Sorting

```
Query parameters:
- page: 0-based page number (default: 0)
- size: page size (default: 20, max: 100)
- sort: comma-separated field names with direction
  Example: sort=createdAt,desc&sort=title,asc

Response:
{
  "content": [...],
  "page": {
    "number": 0,
    "size": 20,
    "total_elements": 543,
    "total_pages": 28
  },
  "sort": {
    "field": "createdAt",
    "direction": "DESC"
  }
}
```

### 10.6 Error Recovery

```
Retry Strategy:
- Network errors: exponential backoff, max 3 retries
- Database locks: linear backoff, max 5 retries
- External APIs: exponential backoff, max 3 retries

Circuit Breaker:
- External API calls wrapped in circuit breaker
- Threshold: 5 consecutive failures
- Recovery timeout: 30 seconds
- Fallback: cached response or graceful degradation
```

---

## Summary of Architectural Decisions

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Architecture | Feature-Based | Clear domain boundaries, independent scalability |
| Auth | JWT + Refresh Tokens | Stateless, scalable, standard |
| Caching | Redis | High performance, distributed, event-friendly |
| Events | Transactional Outbox | Guaranteed delivery, no lost events |
| Validation | Jakarta Validation | Standards-based, reusable |
| DTOs | Records | Immutable, concise, type-safe |
| Mapping | MapStruct | Compile-time generation, performance |
| DB Migrations | Flyway | Version control, reproducible deployments |
| Testing | Testcontainers | Real databases, integration testing |
| Monitoring | Prometheus + Grafana | Industry standard, multi-dimensional |
| Logging | Structured (JSON) | Machine-parseable, searchable |
| Rate Limiting | Redis-based | Distributed, shared across instances |

---

**End of Architecture Specification**

Version: 1.0 | Last Updated: 2026-06-11
