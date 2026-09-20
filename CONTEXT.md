# Skilltrack — Domain Model

## Overview
Skilltrack is a full-stack Next.js application for tracking skills and learning progress. It provides authentication, a tRPC API layer, and a PostgreSQL database via Prisma.

## Core Concepts

### User
- **Identity**: Unique ID (cuid), email (unique), name, optional image
- **Auth**: Email/password + GitHub OAuth via Better Auth
- **Sessions**: Managed by Better Auth (session tokens, expiry, IP/user-agent)
- **Accounts**: Linked OAuth accounts (GitHub)
- **Ownership**: Creates Posts

### Post
- **Identity**: Unique ID (cuid), name (indexed)
- **Ownership**: Created by one User (`createdById` → User.id)
- **Timestamps**: `createdAt`, `updatedAt`
- **Access**: Users only see their own posts (via tRPC protected procedures)

### Session
- **Identity**: Unique ID, token (unique)
- **Binding**: Belongs to User, cascades on user delete
- **Metadata**: IP address, user agent, expiry

### Account
- **Identity**: Unique ID, providerId + accountId (per-provider unique)
- **Binding**: Belongs to User, cascades on user delete
- **Tokens**: Access/refresh/id tokens with expiry, scope
- **Password**: Optional (for email/password auth)

### Verification
- **Purpose**: Email verification, password reset, etc.
- **Fields**: Identifier (email), value (token), expiry

## Invariants
- Email is unique across Users
- Session token is unique
- Account (providerId, accountId) is unique per provider
- Posts are scoped to their creator (enforced in tRPC procedures)
- Deleting a User cascades to Sessions, Accounts, Posts

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **API**: tRPC v11
- **Auth**: Better Auth (email/password + GitHub OAuth)
- **Database**: PostgreSQL via Prisma ORM
- **Validation**: Zod
- **Styling**: Tailwind CSS (via PostCSS)

## API Surface (tRPC)
| Router | Procedure | Access | Description |
|--------|-----------|--------|-------------|
| `post.hello` | query | public | Echo input text |
| `post.create` | mutation | protected | Create a post for current user |
| `post.getLatest` | query | protected | Get latest post by current user |
| `post.getSecretMessage` | query | protected | Returns static secret |

## Environment Variables
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `BETTER_AUTH_GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `BETTER_AUTH_SECRET` | Better Auth encryption key |