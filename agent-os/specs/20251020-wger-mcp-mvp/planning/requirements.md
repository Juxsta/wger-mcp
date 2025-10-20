# Requirements: wger MCP Server MVP

## Overview
Build an MCP (Model Context Protocol) server that provides AI assistants with access to the wger fitness API. This initial build will focus on the MVP phase covering core exercise discovery and workout routine management capabilities.

## Project Context
- **Product**: wger-mcp - MCP server for wger workout/fitness API
- **Target Users**: AI application developers, MCP tool builders, fitness tech startups
- **Timeline**: Initial build/initialization + MVP (3-4 weeks)
- **Tech Stack**: TypeScript, Node.js 18+, @modelcontextprotocol/sdk, axios, zod

## User Stories

### As an AI application developer
- I want to integrate exercise data into my AI assistant within 30 minutes
- I want type-safe TypeScript interfaces for all wger API entities
- I want comprehensive documentation with usage examples
- I want reliable authentication handling with automatic token refresh

### As an AI assistant (Claude)
- I want to search for exercises by muscle group, equipment, and keywords
- I want to retrieve detailed exercise information including form instructions
- I want to create workout routines for authenticated users
- I want to add exercises to routines with set/rep parameters
- I want to list all available exercise categories, muscles, and equipment

### As a fitness tech startup
- I want zero-cost access to a comprehensive exercise database (400+ exercises)
- I want production-ready code with 80%+ test coverage
- I want clear error messages and proper error handling
- I want easy deployment to cloud or local environments

## Scope for Initial Build

### Phase 0: Project Initialization (1 week)
1. **Project Setup**
   - Initialize npm package with TypeScript configuration
   - Set up ESLint, Prettier, and development tooling
   - Configure Jest for testing
   - Create basic project structure

2. **Development Infrastructure**
   - Set up GitHub repository with CI/CD pipeline (GitHub Actions)
   - Configure automated type checking, linting, and testing
   - Create package.json with all dependencies
   - Set up environment variable handling with dotenv

3. **Documentation Foundation**
   - Create README.md with quick start guide
   - Create SETUP.md with detailed installation instructions
   - Set up documentation structure for API reference

### Phase 1: MVP Core Features (2-3 weeks)

#### MCP Server Foundation
- Implement basic MCP server using @modelcontextprotocol/sdk
- Configure stdio transport for Claude Desktop integration
- Set up server initialization and tool registration
- Implement structured logging system

#### Authentication System
- Implement JWT authentication flow with wger API
- Support both API key and username/password methods
- Implement token refresh logic with in-memory caching
- Add authentication error handling

#### Exercise Discovery Tools (5 tools)
1. **search_exercises**
   - Filter by muscle group, equipment, category, keywords
   - Pagination support
   - Return exercise IDs, names, and basic metadata
   - Input validation with zod schemas

2. **get_exercise_details**
   - Fetch comprehensive exercise information by ID
   - Include description, muscles worked, equipment, category
   - Include form instructions and variations
   - Handle not-found errors gracefully

3. **list_categories**
   - Return all exercise categories (strength, cardio, stretching, etc.)
   - Include category IDs and names
   - Cache results for performance

4. **list_muscles**
   - Return all muscle groups with IDs and names
   - Used for filtering exercises
   - Cache results for performance

5. **list_equipment**
   - Return all equipment types with IDs and names
   - Used for filtering exercises
   - Cache results for performance

#### Workout Routine Management Tools (3 tools)
6. **create_workout**
   - Create new workout routine for authenticated user
   - Accept name, description, and metadata
   - Return routine ID for subsequent operations
   - Validate user authentication

7. **add_exercise_to_routine**
   - Add exercises to existing workout routine
   - Specify sets, reps, order, and optional notes
   - Support multiple exercises in single routine
   - Validate routine ownership

8. **get_user_routines**
   - Fetch all workout routines for authenticated user
   - Include complete exercise lists with set/rep schemes
   - Include routine metadata (name, description, created date)
   - Support pagination for users with many routines

## Technical Requirements

### Code Quality
- TypeScript strict mode enabled
- 80% minimum test coverage
- All public functions must have JSDoc comments
- ESLint and Prettier compliance
- No TypeScript errors or warnings

### Error Handling
- All API calls must have try-catch error handling
- Meaningful error messages for debugging
- Proper HTTP status code handling
- Authentication errors handled gracefully
- Network timeout handling

### Type Safety
- TypeScript interfaces for all wger API entities
- Zod schemas for runtime validation
- Input validation for all tool parameters
- Type-safe API client methods

### Performance
- Response time under 500ms for all tools
- In-memory caching for static data (categories, muscles, equipment)
- Token refresh logic to avoid re-authentication
- Efficient HTTP client with connection pooling

### Testing
- Unit tests for all tool functions
- Integration tests with mocked API responses
- Authentication flow tests
- Error handling tests
- CI/CD pipeline with automated testing

### Documentation
- README.md with quick start guide
- SETUP.md with installation instructions
- API.md with tool reference (generated during/after implementation)
- EXAMPLES.md with usage examples
- Inline JSDoc for all public APIs

### Deployment
- npm package configuration for public registry
- Claude Desktop configuration example
- Environment variable documentation
- Docker support (optional, nice-to-have)

## Out of Scope (Future Phases)
- Nutrition tracking (Phase 2)
- Body weight tracking (Phase 2)
- Workout logging (Phase 2)
- Exercise images/videos (Phase 3)
- Workout templates and sharing (Phase 3)
- Progress analytics (Phase 3)
- Progression rules (Phase 3)

## Success Criteria
- [ ] All 8 MVP tools implemented and tested
- [ ] 80%+ test coverage achieved
- [ ] TypeScript compiles with no errors
- [ ] All CI/CD checks pass
- [ ] Documentation complete (README, SETUP, API docs)
- [ ] Package published to npm (or ready for publishing)
- [ ] Claude Desktop integration working locally
- [ ] Response time under 500ms for all tools
- [ ] Authentication flow working with token refresh

## Constraints
- Must use official @modelcontextprotocol/sdk
- Must support Node.js 18+ LTS
- Must follow MCP protocol standards
- Must use wger API v2 (https://wger.de/api/v2)
- Must not require external paid services for MVP
- Must work with Claude Desktop out of the box

## Dependencies
- wger REST API v2 availability and stability
- @modelcontextprotocol/sdk compatibility
- Node.js 18+ runtime environment
- npm registry for package distribution

## Risks & Mitigations
- **Risk**: wger API changes breaking compatibility
  - **Mitigation**: Version pin API endpoints, add integration tests, monitor API documentation

- **Risk**: MCP SDK updates causing issues
  - **Mitigation**: Pin SDK version, follow MCP changelog, maintain backward compatibility

- **Risk**: Authentication token expiration during long conversations
  - **Mitigation**: Implement automatic token refresh, handle 401 errors gracefully

- **Risk**: Rate limiting on wger API
  - **Mitigation**: Implement caching for static data, respect rate limits, document limitations

## Open Questions
- Should we support SSE transport in addition to stdio for MVP?
- What should be the default behavior if user is not authenticated (fail gracefully or prompt for auth)?
- Should we bundle example Claude Desktop config or provide it in docs only?
- Should we implement request retry logic for transient network errors?
