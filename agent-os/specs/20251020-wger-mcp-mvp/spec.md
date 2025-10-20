# Specification: wger MCP Server MVP

## Goal

Build a production-ready Model Context Protocol (MCP) server that exposes the wger fitness API through 8 core tools, enabling AI assistants to search exercises, access detailed exercise information, and manage workout routines. The server will provide type-safe TypeScript interfaces, comprehensive error handling, and seamless integration with Claude Desktop.

## User Stories

- As an AI application developer, I want to integrate exercise data into my AI assistant within 30 minutes
- As an AI application developer, I want type-safe TypeScript interfaces for all wger API entities
- As an AI assistant (Claude), I want to search for exercises by muscle group, equipment, and keywords
- As an AI assistant (Claude), I want to retrieve detailed exercise information including form instructions
- As an AI assistant (Claude), I want to create workout routines for authenticated users
- As an AI assistant (Claude), I want to add exercises to routines with set/rep parameters
- As a fitness tech startup, I want zero-cost access to a comprehensive exercise database (400+ exercises)
- As a developer, I want clear error messages and proper error handling for all tool operations

## Core Requirements

### Functional Requirements

**Exercise Discovery (5 tools)**
- Search exercises with filters for muscle group, equipment, category, and keywords with pagination support
- Retrieve comprehensive exercise details including description, muscles worked, equipment, and form instructions
- List all available exercise categories (strength, cardio, stretching) with IDs and names
- List all muscle groups with IDs and names for filtering purposes
- List all equipment types with IDs and names for filtering purposes

**Workout Routine Management (3 tools)**
- Create new workout routines for authenticated users with name, description, and metadata
- Add exercises to existing workout routines with sets, reps, order, and optional notes
- Fetch all workout routines for authenticated users with complete exercise lists and set/rep schemes

**Authentication & Security**
- JWT-based authentication supporting both API key and username/password methods
- Automatic token refresh with in-memory caching to avoid re-authentication
- Graceful handling of authentication errors and token expiration

**Data Caching**
- In-memory caching for static data (categories, muscles, equipment) to minimize API calls
- Cache invalidation strategy for stale data

### Non-Functional Requirements

**Performance**
- Response time under 500ms for all tool operations
- Efficient HTTP client with connection pooling via axios
- Minimized API calls through intelligent caching

**Code Quality**
- TypeScript strict mode enabled with zero compilation errors
- 80% minimum test coverage across all tools and utilities
- ESLint and Prettier compliance for consistent code style
- JSDoc comments for all public functions and tool definitions

**Error Handling**
- User-friendly error messages without exposing technical details
- Proper HTTP status code handling (401, 404, 429, 500)
- Network timeout handling with configurable timeout values
- Fail-fast validation for all tool inputs

**Type Safety**
- TypeScript interfaces for all wger API entities (Exercise, Routine, Category, Muscle, Equipment)
- Zod schemas for runtime validation of tool inputs and API responses
- Type-safe API client methods with proper return types

**Testing**
- Unit tests for all tool functions using Jest
- Integration tests with mocked wger API responses using MSW (Mock Service Worker)
- Authentication flow tests covering token refresh scenarios
- Error handling tests for common failure cases
- CI/CD pipeline with automated testing on every commit

**Documentation**
- README.md with quick start guide and installation instructions
- SETUP.md with detailed Claude Desktop integration steps
- API.md with comprehensive tool reference documentation
- EXAMPLES.md with usage examples and common scenarios
- Inline JSDoc documentation for IDE support

## Visual Design

No visual mockups provided. This is a headless MCP server with no UI components.

## Reusable Components

### Existing Code to Leverage

This is a greenfield project with no existing codebase. However, we will leverage:
- @modelcontextprotocol/sdk for MCP server implementation
- axios for HTTP client functionality
- zod for schema validation
- Jest for testing infrastructure

### New Components Required

All components are new for this project:
- MCP server foundation with tool registration
- wger API client with authentication
- 8 MCP tools (search_exercises, get_exercise_details, list_categories, list_muscles, list_equipment, create_workout, add_exercise_to_routine, get_user_routines)
- Type definitions for wger API entities
- Caching layer for static data
- Error handling utilities
- Logging system

## Technical Approach

### Project Structure

```
wger-mcp/
├── src/
│   ├── index.ts                 # MCP server entry point
│   ├── server.ts                # MCP server initialization
│   ├── types/
│   │   ├── wger.ts             # TypeScript interfaces for wger entities
│   │   └── mcp.ts              # MCP-specific type definitions
│   ├── schemas/
│   │   ├── tools.ts            # Zod schemas for tool inputs
│   │   └── api.ts              # Zod schemas for API responses
│   ├── client/
│   │   ├── wger-client.ts      # HTTP client for wger API
│   │   ├── auth.ts             # Authentication logic
│   │   └── cache.ts            # In-memory caching layer
│   ├── tools/
│   │   ├── search-exercises.ts
│   │   ├── get-exercise-details.ts
│   │   ├── list-categories.ts
│   │   ├── list-muscles.ts
│   │   ├── list-equipment.ts
│   │   ├── create-workout.ts
│   │   ├── add-exercise-to-routine.ts
│   │   └── get-user-routines.ts
│   ├── utils/
│   │   ├── logger.ts           # Structured logging
│   │   ├── errors.ts           # Custom error classes
│   │   └── validation.ts       # Input validation helpers
│   └── config.ts               # Configuration management
├── tests/
│   ├── unit/
│   │   ├── tools/              # Unit tests for each tool
│   │   ├── client/             # Tests for API client
│   │   └── utils/              # Tests for utilities
│   ├── integration/
│   │   └── tools/              # Integration tests with mocked API
│   └── fixtures/
│       └── api-responses.ts    # Mock API response data
├── docs/
│   ├── README.md
│   ├── SETUP.md
│   ├── API.md
│   └── EXAMPLES.md
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
├── .prettierrc
└── .env.example
```

### Authentication Flow

1. **Initial Authentication**
   - User provides either API key OR username/password in environment variables
   - On first authenticated tool call, server requests JWT token from wger API
   - Token is cached in-memory with expiration timestamp

2. **Token Refresh**
   - Before each authenticated API call, check if token is expired (or within 5 minutes of expiration)
   - If expired, automatically request new token using refresh token or re-authenticate
   - Update cached token with new value

3. **Error Handling**
   - If API returns 401 Unauthorized, clear cached token and attempt re-authentication once
   - If re-authentication fails, return clear error to user asking them to verify credentials
   - If user is not authenticated but calls authenticated tool, return error indicating authentication is required

### HTTP Client Setup

**Configuration**
- Base URL: https://wger.de/api/v2
- Timeout: 10 seconds (configurable via environment variable)
- Retry logic: Retry once on network errors or 5xx responses with exponential backoff
- Headers: Accept: application/json, Content-Type: application/json

**Interceptors**
- Request interceptor: Add authentication token to Authorization header if available
- Response interceptor: Handle common errors (401, 429, 500) and transform error responses

**Connection Pooling**
- Use axios defaults with keep-alive enabled
- Maximum concurrent requests: 10 (to respect potential rate limits)

### Caching Strategy

**Static Data (Long-lived cache)**
- Categories: Cache for 24 hours (data rarely changes)
- Muscles: Cache for 24 hours (data rarely changes)
- Equipment: Cache for 24 hours (data rarely changes)
- Cache key format: `{resource_type}:all`

**Exercise Data (Short-lived cache)**
- Exercise details: Cache for 1 hour (may be updated by wger admins)
- Cache key format: `exercise:{exercise_id}`

**User-Specific Data (No caching)**
- Workout routines: No caching (user data may change frequently)
- Always fetch fresh data from API

**Cache Implementation**
- Simple in-memory Map with expiration timestamps
- No external dependencies (Redis not required for MVP)
- Cache cleanup: Remove expired entries every 10 minutes

### Error Handling Approach

**Error Types**
- `AuthenticationError`: Authentication failures (401, invalid credentials)
- `ValidationError`: Input validation failures (invalid parameters)
- `NotFoundError`: Resource not found (404)
- `RateLimitError`: Rate limit exceeded (429)
- `ApiError`: General API errors (500, network issues)

**Error Messages**
- User-friendly messages that explain what went wrong
- Avoid exposing internal implementation details
- Include actionable guidance (e.g., "Please check your credentials in the environment variables")

**Error Propagation**
- Catch errors at tool boundary
- Transform API errors into user-friendly MCP error responses
- Log detailed error information for debugging
- Return structured error objects with error type and message

## Detailed Tool Specifications

### 1. search_exercises

**Purpose**: Search for exercises with filters for muscle group, equipment, category, and keywords.

**Input Parameters** (Zod Schema):
```typescript
{
  query?: string,          // Optional keyword search
  muscle?: number,         // Optional muscle group ID
  equipment?: number,      // Optional equipment ID
  category?: number,       // Optional category ID
  limit?: number,          // Optional, default 20, max 100
  offset?: number          // Optional, default 0, for pagination
}
```

**Output Format**:
```typescript
{
  count: number,
  next: string | null,
  previous: string | null,
  results: Array<{
    id: number,
    name: string,
    category: number,
    muscles: number[],
    muscles_secondary: number[],
    equipment: number[],
    language: number
  }>
}
```

**Error Cases**:
- ValidationError: Invalid parameter types or values (e.g., negative limit)
- ApiError: wger API unavailable or returns 5xx
- RateLimitError: Too many requests to wger API

**Example Usage**:
```
User: "Find me chest exercises with dumbbells"
AI calls: search_exercises({ query: "chest", equipment: 3 })
```

**Implementation Notes**:
- Use GET /api/v2/exercise/?query={query}&muscle={muscle}&equipment={equipment}
- Apply default limit of 20 if not specified
- Validate limit is between 1 and 100
- Return empty results array if no matches found

### 2. get_exercise_details

**Purpose**: Fetch comprehensive information for a specific exercise including description, muscles worked, and form instructions.

**Input Parameters** (Zod Schema):
```typescript
{
  exerciseId: number       // Required exercise ID
}
```

**Output Format**:
```typescript
{
  id: number,
  name: string,
  uuid: string,
  description: string,
  category: number,
  muscles: number[],
  muscles_secondary: number[],
  equipment: number[],
  language: number,
  license: number,
  license_author: string,
  variations: number[]
}
```

**Error Cases**:
- ValidationError: Missing or invalid exerciseId
- NotFoundError: Exercise with given ID does not exist (404)
- ApiError: wger API unavailable or returns 5xx

**Example Usage**:
```
User: "Tell me more about exercise 123"
AI calls: get_exercise_details({ exerciseId: 123 })
```

**Implementation Notes**:
- Use GET /api/v2/exercise/{id}/
- Check cache first (1 hour TTL)
- Parse HTML description field if necessary
- Handle 404 with clear "Exercise not found" message

### 3. list_categories

**Purpose**: Return all available exercise categories (strength, cardio, stretching, etc.) with IDs and names.

**Input Parameters**: None

**Output Format**:
```typescript
{
  results: Array<{
    id: number,
    name: string
  }>
}
```

**Error Cases**:
- ApiError: wger API unavailable or returns 5xx
- RateLimitError: Too many requests to wger API

**Example Usage**:
```
User: "What types of exercises can I search for?"
AI calls: list_categories()
```

**Implementation Notes**:
- Use GET /api/v2/exercisecategory/
- Cache results for 24 hours
- Return all categories without pagination

### 4. list_muscles

**Purpose**: Return all muscle groups with IDs and names for filtering exercises.

**Input Parameters**: None

**Output Format**:
```typescript
{
  results: Array<{
    id: number,
    name: string,
    name_en: string,
    is_front: boolean
  }>
}
```

**Error Cases**:
- ApiError: wger API unavailable or returns 5xx
- RateLimitError: Too many requests to wger API

**Example Usage**:
```
User: "What muscles can I target?"
AI calls: list_muscles()
```

**Implementation Notes**:
- Use GET /api/v2/muscle/
- Cache results for 24 hours
- Return all muscles without pagination

### 5. list_equipment

**Purpose**: Return all equipment types with IDs and names for filtering exercises.

**Input Parameters**: None

**Output Format**:
```typescript
{
  results: Array<{
    id: number,
    name: string
  }>
}
```

**Error Cases**:
- ApiError: wger API unavailable or returns 5xx
- RateLimitError: Too many requests to wger API

**Example Usage**:
```
User: "What equipment is available?"
AI calls: list_equipment()
```

**Implementation Notes**:
- Use GET /api/v2/equipment/
- Cache results for 24 hours
- Return all equipment without pagination

### 6. create_workout

**Purpose**: Create a new workout routine for authenticated users.

**Input Parameters** (Zod Schema):
```typescript
{
  name: string,            // Required, 1-100 characters
  description?: string     // Optional, max 500 characters
}
```

**Output Format**:
```typescript
{
  id: number,
  name: string,
  description: string,
  creation_date: string,
  days: number[]
}
```

**Error Cases**:
- AuthenticationError: User not authenticated (no valid token)
- ValidationError: Invalid or missing name, description too long
- ApiError: wger API unavailable or returns 5xx

**Example Usage**:
```
User: "Create a new workout called 'Upper Body Day'"
AI calls: create_workout({ name: "Upper Body Day", description: "Focus on chest, back, and shoulders" })
```

**Implementation Notes**:
- Use POST /api/v2/workout/
- Require valid authentication token
- Validate name length and description length
- Return routine ID for use in add_exercise_to_routine

### 7. add_exercise_to_routine

**Purpose**: Add exercises to an existing workout routine with set/rep parameters.

**Input Parameters** (Zod Schema):
```typescript
{
  workoutId: number,       // Required routine ID
  dayId: number,           // Required day ID within workout
  exerciseId: number,      // Required exercise ID
  sets: number,            // Required, 1-10
  reps?: number,           // Optional, 1-100
  weight?: number,         // Optional, in kg
  order?: number,          // Optional, exercise order in day
  comment?: string         // Optional notes, max 200 characters
}
```

**Output Format**:
```typescript
{
  id: number,
  exercise: number,
  sets: number,
  reps: number,
  weight: number,
  order: number,
  comment: string
}
```

**Error Cases**:
- AuthenticationError: User not authenticated
- ValidationError: Invalid parameters (sets out of range, etc.)
- NotFoundError: Workout or exercise not found
- ApiError: wger API unavailable or returns 5xx

**Example Usage**:
```
User: "Add bench press to my upper body workout with 4 sets of 8 reps"
AI calls: add_exercise_to_routine({ workoutId: 42, dayId: 1, exerciseId: 88, sets: 4, reps: 8 })
```

**Implementation Notes**:
- Use POST /api/v2/set/
- Require valid authentication token
- Validate workout ownership before adding exercise
- Validate sets, reps, and weight are positive numbers
- Default order to highest order + 1 if not specified

### 8. get_user_routines

**Purpose**: Fetch all workout routines for authenticated user with complete exercise lists.

**Input Parameters** (Zod Schema):
```typescript
{
  limit?: number,          // Optional, default 20, max 50
  offset?: number          // Optional, default 0, for pagination
}
```

**Output Format**:
```typescript
{
  count: number,
  next: string | null,
  previous: string | null,
  results: Array<{
    id: number,
    name: string,
    description: string,
    creation_date: string,
    days: Array<{
      id: number,
      description: string,
      day: number[],
      sets: Array<{
        id: number,
        exercise: number,
        sets: number,
        reps: number,
        weight: number,
        order: number,
        comment: string
      }>
    }>
  }>
}
```

**Error Cases**:
- AuthenticationError: User not authenticated
- ValidationError: Invalid limit or offset values
- ApiError: wger API unavailable or returns 5xx

**Example Usage**:
```
User: "Show me all my workout routines"
AI calls: get_user_routines()
```

**Implementation Notes**:
- Use GET /api/v2/workout/
- Require valid authentication token
- Include nested days and sets in response
- Apply default limit of 20 if not specified
- No caching (user data may change frequently)

## Data Models

### TypeScript Interfaces

```typescript
// Exercise entity
interface Exercise {
  id: number;
  name: string;
  uuid: string;
  description: string;
  category: number;
  muscles: number[];
  muscles_secondary: number[];
  equipment: number[];
  language: number;
  license: number;
  license_author: string;
  variations: number[];
}

// Exercise category
interface ExerciseCategory {
  id: number;
  name: string;
}

// Muscle group
interface Muscle {
  id: number;
  name: string;
  name_en: string;
  is_front: boolean;
}

// Equipment type
interface Equipment {
  id: number;
  name: string;
}

// Workout routine
interface Workout {
  id: number;
  name: string;
  description: string;
  creation_date: string;
  days: Day[];
}

// Workout day
interface Day {
  id: number;
  description: string;
  day: number[];
  sets: Set[];
}

// Exercise set
interface Set {
  id: number;
  exercise: number;
  sets: number;
  reps: number;
  weight: number;
  order: number;
  comment: string;
}

// Paginated response wrapper
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
```

### Zod Schemas

```typescript
// Tool input schemas
const SearchExercisesSchema = z.object({
  query: z.string().optional(),
  muscle: z.number().int().positive().optional(),
  equipment: z.number().int().positive().optional(),
  category: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

const GetExerciseDetailsSchema = z.object({
  exerciseId: z.number().int().positive()
});

const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional()
});

const AddExerciseToRoutineSchema = z.object({
  workoutId: z.number().int().positive(),
  dayId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
  sets: z.number().int().min(1).max(10),
  reps: z.number().int().min(1).max(100).optional(),
  weight: z.number().min(0).optional(),
  order: z.number().int().min(1).optional(),
  comment: z.string().max(200).optional()
});

const GetUserRoutinesSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0)
});

// API response schemas
const ExerciseSchema = z.object({
  id: z.number(),
  name: z.string(),
  uuid: z.string(),
  description: z.string(),
  category: z.number(),
  muscles: z.array(z.number()),
  muscles_secondary: z.array(z.number()),
  equipment: z.array(z.number()),
  language: z.number(),
  license: z.number(),
  license_author: z.string(),
  variations: z.array(z.number())
});

const CategorySchema = z.object({
  id: z.number(),
  name: z.string()
});

const MuscleSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_en: z.string(),
  is_front: z.boolean()
});

const EquipmentSchema = z.object({
  id: z.number(),
  name: z.string()
});
```

## Testing Strategy

### Unit Test Requirements

**Coverage Targets**
- Overall coverage: 80% minimum
- Tool functions: 90% coverage (critical path)
- API client: 85% coverage
- Utilities: 80% coverage

**Test Organization**
- One test file per tool (e.g., `search-exercises.test.ts`)
- One test file per client module (e.g., `wger-client.test.ts`)
- One test file per utility module (e.g., `cache.test.ts`)

**What to Test**
- Tool input validation (valid and invalid inputs)
- Tool output format (verify structure matches interface)
- API client methods (request building, response parsing)
- Authentication flow (token caching, refresh logic)
- Cache operations (get, set, expiration)
- Error transformation (API errors to MCP errors)

**What NOT to Test** (per standards)
- Edge cases not business-critical
- Non-critical validation logic
- Implementation details (internal helper functions)

### Integration Test Requirements

**Mock Strategy**
- Use MSW (Mock Service Worker) to mock wger API responses
- Create realistic fixtures for common API responses
- Mock both success and error scenarios

**Test Scenarios**
- Search exercises with various filters
- Retrieve exercise details with caching
- List static data (categories, muscles, equipment)
- Create workout with authentication
- Add exercise to routine with validation
- Get user routines with pagination
- Authentication flow (login, token refresh, expiration)
- Error handling (401, 404, 429, 500 responses)

**Coverage Targets**
- All 8 tools tested end-to-end
- Authentication flow tested with token refresh
- All error cases tested with appropriate error types

### Coverage Targets

- Unit tests: 80% code coverage minimum
- Integration tests: All 8 tools covered with happy path + error cases
- CI/CD: Tests must pass before merge
- Coverage reports: Generated on every test run and reviewed in PRs

### Mock Strategy for wger API

**MSW Setup**
- Define handlers for all wger API endpoints
- Use realistic response data from fixtures
- Simulate network delays (50-200ms) for realistic testing
- Simulate error responses (401, 404, 429, 500)

**Fixture Data**
- Create sample exercises (10-20 examples)
- Create sample categories, muscles, equipment (full lists)
- Create sample workout routines (2-3 examples)
- Store in `tests/fixtures/api-responses.ts`

## Documentation Requirements

### README.md Structure

1. **Overview**
   - Brief description of wger-mcp
   - Key features and capabilities
   - Link to wger API documentation

2. **Quick Start**
   - Prerequisites (Node.js 18+)
   - Installation command (`npm install wger-mcp`)
   - Basic configuration (environment variables)
   - Claude Desktop setup (single command)

3. **Available Tools**
   - List of 8 tools with one-line descriptions
   - Link to API.md for full reference

4. **Authentication**
   - How to obtain wger API credentials
   - Environment variable setup
   - Authentication methods (API key vs username/password)

5. **Development**
   - How to run locally
   - How to run tests
   - How to build for production

6. **Contributing**
   - Link to contribution guidelines
   - How to report issues

7. **License**
   - MIT License (or as appropriate)

### SETUP.md Content

1. **Prerequisites**
   - Node.js version requirements
   - npm version requirements
   - wger account creation (if needed)

2. **Installation Steps**
   - Clone repository (for development)
   - Install dependencies (`npm install`)
   - Copy environment variables (`cp .env.example .env`)
   - Configure environment variables

3. **Claude Desktop Integration**
   - Location of config file (platform-specific)
   - Configuration JSON structure
   - How to add wger-mcp to config
   - Restart Claude Desktop

4. **Verification**
   - How to test if server is working
   - Example tool call in Claude
   - Troubleshooting common issues

5. **Advanced Configuration**
   - Custom API URL
   - Timeout settings
   - Log level configuration

### API Reference Format (API.md)

For each tool, document:

1. **Tool Name**
2. **Description** (1-2 sentences)
3. **Parameters** (table with name, type, required, description)
4. **Returns** (type and structure)
5. **Errors** (possible error types and when they occur)
6. **Example Usage** (code snippet with Claude conversation)
7. **Notes** (any caveats or special considerations)

### Example Scenarios (EXAMPLES.md)

1. **Find Exercises for Home Workout**
   - Search by equipment (bodyweight, dumbbells)
   - Filter by muscle group
   - Review exercise details

2. **Create Full Body Routine**
   - Create workout routine
   - Add exercises for different muscle groups
   - Specify sets and reps

3. **View and Modify Routines**
   - List user routines
   - Add exercises to existing routine
   - Update routine metadata

4. **Explore Exercise Database**
   - List all categories
   - List all muscles
   - Search exercises by keyword

## Deployment & Configuration

### npm Package Setup

**package.json Configuration**
```json
{
  "name": "wger-mcp",
  "version": "0.1.0",
  "description": "MCP server for wger workout and fitness API",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "wger-mcp": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts",
    "prepare": "npm run build"
  },
  "keywords": ["mcp", "wger", "fitness", "workout", "exercise", "ai"],
  "author": "Your Name",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Dependencies**
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@types/jest": "^29.5.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "msw": "^2.0.0",
    "typescript": "^5.2.0"
  }
}
```

### Claude Desktop Configuration

**Configuration File Location**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Configuration Format**
```json
{
  "mcpServers": {
    "wger": {
      "command": "node",
      "args": ["/path/to/wger-mcp/dist/index.js"],
      "env": {
        "WGER_API_URL": "https://wger.de/api/v2",
        "WGER_API_KEY": "your_api_key_here",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**Alternative: Global Installation**
```json
{
  "mcpServers": {
    "wger": {
      "command": "npx",
      "args": ["wger-mcp"],
      "env": {
        "WGER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Environment Variables

**Required Variables**
- `WGER_API_KEY` OR `WGER_USERNAME` + `WGER_PASSWORD`: Authentication credentials

**Optional Variables**
- `WGER_API_URL`: Base URL for wger API (default: https://wger.de/api/v2)
- `LOG_LEVEL`: Logging verbosity - debug, info, warn, error (default: info)
- `HTTP_TIMEOUT`: Request timeout in milliseconds (default: 10000)
- `CACHE_TTL_STATIC`: Cache TTL for static data in seconds (default: 86400 = 24 hours)
- `CACHE_TTL_EXERCISE`: Cache TTL for exercise details in seconds (default: 3600 = 1 hour)

**.env.example File**
```
# Authentication (choose one method)
WGER_API_KEY=your_api_key_here
# OR
# WGER_USERNAME=your_username
# WGER_PASSWORD=your_password

# Optional configuration
WGER_API_URL=https://wger.de/api/v2
LOG_LEVEL=info
HTTP_TIMEOUT=10000
CACHE_TTL_STATIC=86400
CACHE_TTL_EXERCISE=3600
```

### Installation Steps

1. **Install via npm** (when published)
   ```bash
   npm install -g wger-mcp
   ```

2. **Configure Environment Variables**
   - Create `.env` file with authentication credentials
   - Or set environment variables in Claude Desktop config

3. **Update Claude Desktop Config**
   - Add wger-mcp to `mcpServers` section
   - Restart Claude Desktop

4. **Verify Installation**
   - Open Claude Desktop
   - Try asking "What exercise tools are available?"
   - Claude should list the 8 wger tools

**Development Installation**
```bash
git clone https://github.com/yourusername/wger-mcp.git
cd wger-mcp
npm install
npm run build
```

## Technical Constraints

### Node.js Version Requirements

- **Minimum Version**: Node.js 18.0.0 (LTS)
- **Recommended Version**: Node.js 20.x (Active LTS)
- **Reason**: Requires native fetch support and modern ECMAScript features

### TypeScript Configuration

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Key Settings**
- `strict: true`: Enable all strict type checking options
- `noUnusedLocals: true`: Prevent unused variables
- `noImplicitReturns: true`: Ensure all code paths return a value
- `declaration: true`: Generate .d.ts files for type definitions

### Dependencies and Versions

**Core Dependencies**
```json
{
  "@modelcontextprotocol/sdk": "^1.0.0",    // MCP protocol implementation
  "axios": "^1.6.0",                         // HTTP client
  "zod": "^3.22.0",                          // Schema validation
  "dotenv": "^16.3.0"                        // Environment variable loading
}
```

**Dev Dependencies**
```json
{
  "@types/node": "^18.0.0",                  // Node.js type definitions
  "@types/jest": "^29.5.0",                  // Jest type definitions
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "@typescript-eslint/parser": "^6.0.0",
  "eslint": "^8.50.0",                       // Linter
  "prettier": "^3.0.0",                      // Code formatter
  "jest": "^29.7.0",                         // Test framework
  "ts-jest": "^29.1.0",                      // TypeScript support for Jest
  "msw": "^2.0.0",                           // API mocking for tests
  "typescript": "^5.2.0"                     // TypeScript compiler
}
```

**Version Constraints**
- Lock @modelcontextprotocol/sdk to prevent breaking changes
- Use caret (^) for other dependencies to allow minor updates
- Test compatibility before updating major versions

### Performance Targets

**Response Times**
- Exercise search: < 300ms (50th percentile), < 500ms (95th percentile)
- Exercise details: < 200ms (with cache), < 400ms (without cache)
- List operations: < 150ms (categories, muscles, equipment - cached)
- Create workout: < 400ms
- Add exercise to routine: < 350ms
- Get user routines: < 450ms

**Caching Performance**
- Cache hit rate: > 80% for static data (categories, muscles, equipment)
- Cache hit rate: > 50% for exercise details
- Memory usage: < 50MB for cache storage

**Network Performance**
- HTTP connection pooling: Reuse connections via axios defaults
- Concurrent requests: Max 10 simultaneous requests to wger API
- Retry logic: 1 retry with 1 second exponential backoff for network errors

**Resource Constraints**
- Memory usage: < 100MB under normal load
- CPU usage: Minimal (I/O bound operations)
- No blocking operations on main thread

## Out of Scope

**Future Phases (Not in MVP)**
- Nutrition tracking tools (Phase 2)
- Body weight tracking tools (Phase 2)
- Workout logging tools (Phase 2)
- Exercise images/videos (Phase 3)
- Workout templates and sharing (Phase 3)
- Progress analytics (Phase 3)
- Progression rules for automatic weight increases (Phase 3)

**Technical Features (Not in MVP)**
- SSE transport (only stdio for MVP)
- Docker containerization (nice-to-have, not required)
- Redis caching (in-memory cache sufficient)
- GraphQL support (REST only)
- Webhook support for routine updates
- Multi-user authentication (single user per server instance)

**Integrations (Not in MVP)**
- Third-party fitness trackers (Fitbit, Apple Health, etc.)
- Social features (sharing routines, following users)
- Premium wger features (if any)

## Success Criteria

**Functional Completeness**
- All 8 MVP tools implemented and working correctly
- Authentication flow working with both API key and username/password
- All tools handle errors gracefully with user-friendly messages
- Caching working for static data with proper TTLs

**Code Quality**
- TypeScript compiles with zero errors in strict mode
- 80%+ test coverage achieved across codebase
- All ESLint and Prettier checks pass
- No console.log statements in production code

**Performance**
- All tools respond within 500ms (95th percentile)
- Cache hit rate > 80% for static data
- Memory usage < 100MB under normal load
- Authentication token refresh working without user intervention

**Documentation**
- README.md complete with quick start guide
- SETUP.md complete with Claude Desktop integration steps
- API.md complete with all 8 tools documented
- EXAMPLES.md complete with common usage scenarios
- All public functions have JSDoc comments

**Testing**
- All unit tests passing
- All integration tests passing
- CI/CD pipeline configured and running on every commit
- Coverage reports generated and reviewed

**Integration**
- Package published to npm (or ready for publishing)
- Claude Desktop integration working locally
- Environment variable configuration working
- Can successfully call all 8 tools from Claude Desktop

**Developer Experience**
- Installation takes < 5 minutes
- First tool call works within 30 minutes of starting
- Clear error messages for common issues (missing auth, invalid params)
- Documentation is clear and accurate

## Open Questions

1. **SSE Transport**: Should we support SSE transport in addition to stdio for MVP?
   - **Recommendation**: No, defer to future phase. Stdio is sufficient for Claude Desktop integration.

2. **Authentication Default Behavior**: What should happen if user is not authenticated but calls an authenticated tool?
   - **Recommendation**: Return clear AuthenticationError with instructions to set up credentials.

3. **Claude Desktop Config**: Should we bundle example config in package or provide in docs only?
   - **Recommendation**: Provide in docs only. Example config in README.md and SETUP.md.

4. **Retry Logic**: Should we implement request retry logic for transient network errors?
   - **Recommendation**: Yes, retry once with 1 second backoff for network errors and 5xx responses.

5. **Rate Limiting**: How should we handle wger API rate limits?
   - **Recommendation**: Return RateLimitError with clear message. Caching should minimize rate limit issues.

6. **Token Refresh Timing**: When should we refresh authentication tokens?
   - **Recommendation**: Refresh when token is expired or within 5 minutes of expiration.

7. **Cache Invalidation**: Should we provide a tool to manually clear cache?
   - **Recommendation**: No for MVP. Cache TTLs handle staleness automatically.

8. **Multi-Language Support**: Should exercise names support multiple languages?
   - **Recommendation**: Not for MVP. Use English (language=2) for all exercises.

## Implementation Notes

**Development Workflow**
1. Set up project structure and configuration files
2. Implement core infrastructure (server, client, auth, cache)
3. Implement list tools first (categories, muscles, equipment) - simplest
4. Implement search and details tools (search_exercises, get_exercise_details)
5. Implement workout management tools (create_workout, add_exercise_to_routine, get_user_routines)
6. Write tests for all tools (unit and integration)
7. Write documentation (README, SETUP, API, EXAMPLES)
8. Set up CI/CD pipeline
9. Test end-to-end with Claude Desktop
10. Prepare for npm publishing

**Development Priorities**
1. Get basic MCP server running with one tool
2. Implement authentication and verify with wger API
3. Implement all 8 tools with basic error handling
4. Add comprehensive error handling and validation
5. Add caching layer
6. Write tests to meet coverage targets
7. Polish documentation
8. Optimize performance

**Testing Approach**
- Write tests after implementing core functionality (per standards)
- Focus on critical paths and user flows
- Use realistic mock data for integration tests
- Defer edge case testing until main flows are working

**Documentation Approach**
- Write README.md and SETUP.md early (before implementation)
- Update API.md as tools are implemented
- Write EXAMPLES.md after all tools are working
- Keep documentation in sync with code changes
