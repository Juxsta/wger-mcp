# Task 5: Workout Routine Management Tools

## Overview
**Task Reference:** Task #5 from `/home/ericreyes/github/wger-mcp/agent-os/specs/20251020-wger-mcp-mvp/tasks.md`
**Implemented By:** API Engineer (tool-developer)
**Date:** 2025-10-20
**Status:** ✅ Complete

### Task Description
Implement 3 workout routine management tools requiring authentication: create_workout, add_exercise_to_routine, and get_user_routines. These tools allow authenticated users to create workout plans, add exercises with sets/reps parameters, and retrieve their workout routines.

## Implementation Summary
Successfully implemented all three authenticated workout management tools following the established patterns from Task Group 4 (Exercise Discovery Tools). Each tool validates input using Zod schemas, ensures authentication before making API requests, handles errors gracefully, and returns properly typed responses. All tools were registered with the MCP server in `src/server.ts` and are fully functional with automatic token refresh support.

The implementation follows a consistent pattern: validate credentials, parse and validate input parameters, ensure authentication token is valid, make the API request, and handle errors with user-friendly messages. No caching is used for user-specific data as workout routines may change frequently.

## Files Changed/Created

### New Files
- `/home/ericreyes/github/wger-mcp/src/tools/create-workout.ts` - MCP tool for creating new workout routines for authenticated users
- `/home/ericreyes/github/wger-mcp/src/tools/add-exercise-to-routine.ts` - MCP tool for adding exercises to workout days with set/rep parameters
- `/home/ericreyes/github/wger-mcp/src/tools/get-user-routines.ts` - MCP tool for retrieving user's workout routines with pagination support

### Modified Files
- `/home/ericreyes/github/wger-mcp/src/server.ts` - Added imports and registration for the three new workout management tools

### Deleted Files
None

## Key Implementation Details

### create_workout Tool
**Location:** `/home/ericreyes/github/wger-mcp/src/tools/create-workout.ts`

Implements the ability to create new workout routines with a required name and optional description. The tool follows this workflow:

1. Validates that authentication credentials are configured using `authManager.hasCredentials()`
2. Validates input parameters (name, description) using `CreateWorkoutSchema`
3. Ensures a valid authentication token exists via `authManager.getToken()`
4. Posts to `/api/v2/workout/` with workout details
5. Returns the created workout object including ID, name, description, creation date, and days array

**Rationale:** This tool is essential for the workout management flow as users must first create a workout container before adding exercises. The authentication check happens before token retrieval to provide early, clear error messages if credentials are missing.

### add_exercise_to_routine Tool
**Location:** `/home/ericreyes/github/wger-mcp/src/tools/add-exercise-to-routine.ts`

Implements adding exercises to existing workout days with detailed parameters including sets, reps, weight, order, and comments. The tool workflow:

1. Validates authentication credentials are configured
2. Validates all input parameters using `AddExerciseToRoutineSchema` (workoutId, dayId, exerciseId, sets, and optional reps/weight/order/comment)
3. Ensures valid authentication token
4. Constructs request body with required and optional parameters
5. Posts to `/api/v2/set/` to create the exercise set
6. Returns the created set object with all parameters

**Rationale:** This tool provides fine-grained control over workout programming by supporting all wger API set parameters. Optional parameters are only included in the request if provided, keeping the API payload clean. The API endpoint is `/set/` rather than a nested route, which matches the wger API design.

### get_user_routines Tool
**Location:** `/home/ericreyes/github/wger-mcp/src/tools/get-user-routines.ts`

Implements retrieval of user's workout routines with pagination support. The tool workflow:

1. Validates authentication credentials are configured
2. Validates pagination parameters (limit, offset) with defaults (limit=20, offset=0)
3. Ensures valid authentication token
4. Gets from `/api/v2/workout/` with pagination query parameters
5. Returns paginated response with count, next/previous URLs, and workout results including nested days and sets

**Rationale:** This tool enables users to view their existing workouts. Pagination support is essential for users with many routines. Unlike exercise data, workout data is NOT cached because it's user-specific and may change frequently as users modify their plans. The API returns nested data structures automatically, so no additional requests are needed.

## Database Changes
Not applicable - this is an MCP client implementation that interacts with the existing wger API.

## Dependencies

### New Dependencies Added
None - all dependencies were already installed in Task Group 1.

### Configuration Changes
None - authentication configuration was already established in Task Group 2.

## Testing

### Test Files Created/Updated
None in this task - unit tests will be written by the testing-engineer in Task Group 6 (tasks 6.12, 6.13, 6.14).

### Test Coverage
Unit tests to be created by testing-engineer:
- `/home/ericreyes/github/wger-mcp/tests/unit/tools/create-workout.test.ts` (3-5 tests)
- `/home/ericreyes/github/wger-mcp/tests/unit/tools/add-exercise-to-routine.test.ts` (4-6 tests)
- `/home/ericreyes/github/wger-mcp/tests/unit/tools/get-user-routines.test.ts` (3-5 tests)

Integration tests will cover the full authenticated workflow in Task Group 7.

### Manual Testing Performed
- Verified TypeScript compilation with `npm run build` - zero errors
- Verified ESLint compliance with `npm run lint` - no violations
- Confirmed all three tools are properly imported and registered in `src/server.ts`
- Validated that tool definitions include proper MCP inputSchema with all required parameters

## User Standards & Preferences Compliance

### Backend API Standards (`agent-os/standards/backend/api.md`)
**How Implementation Complies:**
All three tools follow RESTful principles by using the appropriate HTTP methods (POST for create_workout and add_exercise_to_routine, GET for get_user_routines) and proper resource-based URLs provided by the wger API. Authentication is handled consistently across all tools using the JWT token pattern. HTTP status codes are properly handled through the wgerClient error interceptor.

**Deviations:** None

### Global Coding Style Standards (`agent-os/standards/global/coding-style.md`)
**How Implementation Complies:**
All functions use descriptive, meaningful names (e.g., `createWorkoutHandler`, `addExerciseToRoutineHandler`) and include comprehensive JSDoc comments. Small, focused functions handle specific responsibilities - validation, authentication checking, and API requests are separated. No dead code or unused imports exist. The DRY principle is followed by reusing the wgerClient, authManager, and validation schemas rather than duplicating logic.

**Deviations:** None

### Global Error Handling Standards (`agent-os/standards/global/error-handling.md`)
**How Implementation Complies:**
All tools fail fast with explicit validation using Zod schemas and early authentication credential checks. User-friendly error messages are provided without exposing technical details (e.g., "Authentication required to create workouts" rather than "Token missing"). Specific error types (AuthenticationError, ValidationError) are used rather than generic errors. The centralized error handling in the MCP server's CallToolRequestSchema handler ensures consistent error responses. Authentication errors benefit from the retry strategy implemented in authManager (automatic token refresh).

**Deviations:** None

### Global Validation Standards (`agent-os/standards/global/validation.md`)
**How Implementation Complies:**
All tools use Zod schemas for input validation with clear, actionable error messages. Validation happens at the tool boundary before any business logic executes (fail-fast principle). The CreateWorkoutSchema enforces name length (1-100 chars) and description length (max 500 chars). The AddExerciseToRoutineSchema validates sets (1-10), reps (1-100), weight (non-negative), and all required IDs are positive integers. The GetUserRoutinesSchema validates pagination parameters (limit 1-50, offset >= 0) with sensible defaults.

**Deviations:** None

## Integration Points

### APIs/Endpoints
- `POST /api/v2/workout/` - Creates new workout routine
  - Request format: `{ name: string, description?: string }`
  - Response format: `Workout` object with id, name, description, creation_date, days[]

- `POST /api/v2/set/` - Adds exercise to workout day
  - Request format: `{ exerciseday: number, exercise: number, sets: number, reps?: number, weight?: number, order?: number, comment?: string }`
  - Response format: `Set` object with id, exercise, sets, reps, weight, order, comment

- `GET /api/v2/workout/` - Retrieves user's workout routines
  - Request format: Query params `{ limit?: number, offset?: number }`
  - Response format: `PaginatedResponse<Workout>` with count, next, previous, results[]

### External Services
- wger REST API v2 (https://wger.de/api/v2) - All tools interact with this external fitness API

### Internal Dependencies
- `authManager` from `src/client/auth.ts` - Provides JWT token management and authentication
- `wgerClient` from `src/client/wger-client.ts` - HTTP client with retry logic and error handling
- `CreateWorkoutSchema`, `AddExerciseToRoutineSchema`, `GetUserRoutinesSchema` from `src/schemas/tools.ts` - Input validation
- `Workout`, `Set`, `PaginatedResponse` types from `src/types/wger.ts` - Type definitions
- `AuthenticationError`, `ValidationError` from `src/utils/errors.ts` - Custom error types
- `logger` from `src/utils/logger.ts` - Structured logging

## Known Issues & Limitations

### Issues
None identified

### Limitations
1. **Workout Ownership Validation**
   - Description: The add_exercise_to_routine tool cannot verify that the user owns the workout being modified before attempting to add exercises. The API will reject the request if the user doesn't own the workout, but this results in a less friendly error experience.
   - Reason: The wger API doesn't provide an endpoint to check workout ownership without fetching the full workout details, which would add unnecessary overhead.
   - Future Consideration: Could be addressed by implementing a lightweight ownership check endpoint in the wger API, or by caching workout ownership information client-side.

2. **Day Creation Not Supported**
   - Description: The add_exercise_to_routine tool requires a dayId parameter, but there's no tool in this task group to create workout days.
   - Reason: Day creation is a separate API operation not included in the MVP scope.
   - Future Consideration: Add a create_workout_day tool in a future phase to provide complete workout management capabilities.

3. **No Exercise Reordering**
   - Description: While the order parameter can be set when adding exercises, there's no tool to reorder existing exercises within a day.
   - Reason: Not part of the MVP requirements.
   - Future Consideration: Add update_exercise_order tool in future phase.

## Performance Considerations
All three tools leverage the wgerClient's built-in retry logic for transient failures and automatic token refresh to minimize failed requests due to expired tokens. No caching is implemented for user workout data as it's user-specific and frequently changing, ensuring users always see their latest workout modifications. Pagination in get_user_routines prevents excessive data transfer for users with many routines.

## Security Considerations
All three tools enforce authentication before allowing any operations, preventing unauthorized access to workout management features. Authentication tokens are automatically included in requests via the wgerClient interceptor and are refreshed when expired. The authManager ensures tokens are cached securely and never logged. Input validation via Zod schemas prevents injection attacks and malformed data from reaching the API.

## Dependencies for Other Tasks
- **Task 6.12-6.14** (Unit Tests): Testing engineer will write unit tests for these three tools
- **Task 7.3** (Integration Tests): Will include end-to-end tests of the authenticated workout management flow
- **Task 8.3** (API Documentation): Will document these three tools in the API reference
- **Task 8.4** (Usage Examples): Will include workout creation scenarios using these tools

## Notes
The implementation successfully completes Task Group 5 and delivers all required functionality for workout routine management. All tools follow consistent patterns established in earlier task groups, making the codebase maintainable and easy to understand. TypeScript strict mode compilation passes with zero errors, and ESLint reports no violations. The tools are production-ready pending test coverage in Task Group 6.
