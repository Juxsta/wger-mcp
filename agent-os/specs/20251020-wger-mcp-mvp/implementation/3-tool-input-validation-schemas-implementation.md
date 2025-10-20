# Task 3: Tool Input Validation Schemas

## Overview
**Task Reference:** Task #3 from `/home/ericreyes/github/wger-mcp/agent-os/specs/20251020-wger-mcp-mvp/tasks.md`
**Implemented By:** api-engineer (tool-developer role)
**Date:** 2025-10-20
**Status:** Complete

### Task Description
Create Zod schemas for validating all 8 MCP tool inputs before they are processed by tool handlers. These schemas provide runtime validation with user-friendly error messages and enforce constraints as specified in the technical specification.

## Implementation Summary

Implemented comprehensive Zod validation schemas for all 8 tool inputs in the wger MCP Server MVP. The schemas validate user-provided parameters with proper type checking, range constraints, and user-friendly error messages. Each schema includes JSDoc comments explaining parameters and exports TypeScript type inference helpers for type safety throughout the codebase.

The implementation follows the existing patterns established in `/home/ericreyes/github/wger-mcp/src/schemas/api.ts` while extending them with custom error messages for better user experience. All validation rules match the detailed specifications in the project spec, including string length limits, numeric ranges, and optional/required field definitions.

## Files Changed/Created

### New Files
None - file already existed but needed updates to match spec requirements.

### Modified Files
- `/home/ericreyes/github/wger-mcp/src/schemas/tools.ts` - Updated tool input validation schemas to match spec requirements exactly, including:
  - Fixed `CreateWorkoutSchema` name max length from 100 to 200 characters
  - Fixed `CreateWorkoutSchema` description max length from 500 to 2000 characters
  - Fixed `AddExerciseToRoutineSchema` reps min value from 1 to 0 (allows 0 reps)
  - Fixed `AddExerciseToRoutineSchema` order to have default value of 1
  - Fixed `AddExerciseToRoutineSchema` comment max length from 200 to 500 characters
  - Fixed `GetUserRoutinesSchema` limit max value from 50 to 100
  - Added user-friendly error messages to all validation rules

### Deleted Files
None

## Key Implementation Details

### Schema: SearchExercisesSchema
**Location:** `/home/ericreyes/github/wger-mcp/src/schemas/tools.ts`

Validates parameters for the `search_exercises` tool, supporting optional keyword search and multiple filter criteria (muscle, equipment, category) with pagination.

**Key Features:**
- All filter parameters (query, muscle, equipment, category) are optional
- Limit defaults to 20 with a maximum of 100
- Offset defaults to 0 and cannot be negative
- Includes validation for positive integers on ID fields

**Rationale:** Flexible search requires all parameters to be optional while still validating types when provided. Default pagination values ensure reasonable API usage.

### Schema: GetExerciseDetailsSchema
**Location:** `/home/ericreyes/github/wger-mcp/src/schemas/tools.ts`

Simple schema that validates a single required parameter: exerciseId.

**Key Features:**
- Requires a positive integer for exerciseId
- Custom error message guides users on correct input format

**Rationale:** Minimal validation needed since this tool only takes one parameter. Clear error message prevents confusion.

### Schema: CreateWorkoutSchema
**Location:** `/home/ericreyes/github/wger-mcp/src/schemas/tools.ts`

Validates workout creation parameters with generous limits for name and description.

**Key Features:**
- Name is required (1-200 characters)
- Description is optional (max 2000 characters)
- Custom error messages for both min and max length violations

**Rationale:** Name length of 200 characters accommodates detailed workout names. Description limit of 2000 characters allows for comprehensive workout plans while preventing abuse. These limits were specifically defined in the spec to match wger API capabilities.

### Schema: AddExerciseToRoutineSchema
**Location:** `/home/ericreyes/github/wger-mcp/src/schemas/tools.ts`

Most complex schema, validating all parameters needed to add an exercise to a workout routine.

**Key Features:**
- Required: workoutId, dayId, exerciseId (all positive integers)
- Required: sets (1-10 range)
- Optional: reps (0-100 range, allows 0 for time-based exercises)
- Optional: weight (non-negative, allows decimals)
- Optional: order (positive integer with default of 1)
- Optional: comment (max 500 characters)

**Rationale:** The reps field allows 0 to support exercises measured by time or other metrics rather than repetitions. The order field defaults to 1 to automatically sequence exercises. Weight allows decimals to support fractional weights (e.g., 2.5 kg plates).

### Schema: GetUserRoutinesSchema
**Location:** `/home/ericreyes/github/wger-mcp/src/schemas/tools.ts`

Validates pagination parameters for fetching user workout routines.

**Key Features:**
- Limit defaults to 20 with maximum of 100
- Offset defaults to 0 and cannot be negative

**Rationale:** Matches `SearchExercisesSchema` pagination behavior for consistency. Limit of 100 (not 50 as initially implemented) matches the spec and prevents overly large API responses.

### Type Exports
**Location:** `/home/ericreyes/github/wger-mcp/src/schemas/tools.ts`

All schemas export TypeScript type inference helpers using `z.infer<typeof SchemaName>`, enabling type-safe usage throughout the codebase without duplicating type definitions.

**Rationale:** Follows DRY principle by deriving TypeScript types from Zod schemas, ensuring runtime validation and compile-time types stay synchronized.

## Database Changes
Not applicable - this task involves validation schemas only, no database changes.

## Dependencies
No new dependencies added. Uses existing Zod library that was already installed in Task Group 1.

## Testing

### Test Files Created/Updated
None - testing is assigned to testing-engineer in Task Group 6. The schemas themselves will be tested indirectly through tool testing.

### Test Coverage
Not applicable for this task. Validation schemas will be tested as part of tool implementations (Task Groups 4-5) and unit tests (Task Group 6).

### Manual Testing Performed
- Verified TypeScript compilation with `npm run build` - zero errors
- Verified ESLint compliance with `npx eslint src/schemas/tools.ts` - zero errors
- Auto-fixed Prettier formatting with `npx prettier --write src/schemas/tools.ts`
- Confirmed all schemas follow the exact specifications from `spec.md`

## User Standards & Preferences Compliance

### Global: Validation Standards
**File Reference:** `/home/ericreyes/github/wger-mcp/agent-os/standards/global/validation.md`

**How Implementation Complies:**
- All validation is performed at the schema boundary (fail early principle)
- Each validation rule includes specific error messages that help users correct their input
- Schemas use allowlists (defining what is allowed) rather than blocklists
- Type and format validation is systematic across all fields
- Validation rules are consistent across similar parameters (e.g., pagination limits)

**Deviations:** None

### Global: Coding Style Standards
**File Reference:** `/home/ericreyes/github/wger-mcp/agent-os/standards/global/coding-style.md`

**How Implementation Complies:**
- Follows existing naming conventions from `api.ts` (SchemaName format)
- Uses automated formatting via Prettier for consistent code style
- Variable and function names are descriptive and reveal intent
- Zod schema chains are formatted for readability (one method per line when needed)
- No dead code or unused imports
- Follows DRY principle by exporting type inference helpers instead of duplicating types

**Deviations:** None

### Global: Commenting Standards
**File Reference:** `/home/ericreyes/github/wger-mcp/agent-os/standards/global/commenting.md`

**How Implementation Complies:**
- JSDoc comments explain the purpose of each schema
- Individual field comments describe parameter meanings
- Comments are concise and evergreen (no temporal references)
- Code structure is self-documenting through clear schema definitions

**Deviations:** None

### Global: Error Handling Standards
**File Reference:** `/home/ericreyes/github/wger-mcp/agent-os/standards/global/error-handling.md`

**How Implementation Complies:**
- User-friendly error messages provided for all validation failures (e.g., "Limit must be at least 1" rather than generic errors)
- No technical details exposed in error messages
- Validation fails fast with clear, actionable guidance
- Error messages are specific to the validation rule that failed

**Deviations:** None

### Backend: API Standards
**File Reference:** `/home/ericreyes/github/wger-mcp/agent-os/standards/backend/api.md`

**How Implementation Complies:**
- Consistent naming conventions for schema exports
- Validation enforces data types, ranges, and required fields systematically
- Query parameters validated with proper types (pagination uses limit/offset pattern)

**Deviations:** None - this task doesn't involve API endpoint implementation

## Integration Points

### APIs/Endpoints
Not applicable - schemas are used internally by tool implementations. Tool implementations (Task Groups 4-5) will use these schemas for input validation.

### Internal Dependencies
These schemas will be imported and used by:
- `src/tools/search-exercises.ts` (uses SearchExercisesSchema)
- `src/tools/get-exercise-details.ts` (uses GetExerciseDetailsSchema)
- `src/tools/create-workout.ts` (uses CreateWorkoutSchema)
- `src/tools/add-exercise-to-routine.ts` (uses AddExerciseToRoutineSchema)
- `src/tools/get-user-routines.ts` (uses GetUserRoutinesSchema)

## Known Issues & Limitations

### Issues
None

### Limitations
1. **Validation Message Customization**
   - Description: Error messages are defined inline with validation rules rather than in a centralized i18n system
   - Reason: Project spec doesn't require internationalization for MVP
   - Future Consideration: Could extract messages to a central location if multi-language support is needed

## Performance Considerations
Zod validation is highly optimized and adds minimal overhead (typically <1ms per validation). All schemas use simple validation rules without complex transformations, ensuring fast validation even under load.

## Security Considerations
- All user inputs are validated before processing, preventing injection attacks
- String length limits prevent memory exhaustion attacks
- Numeric ranges prevent integer overflow issues
- No sensitive information is logged in error messages

## Dependencies for Other Tasks
- Task Group 4 (Exercise Discovery Tools) depends on these schemas
- Task Group 5 (Workout Routine Management Tools) depends on these schemas
- Task Group 6 (Unit Tests) will test tool implementations that use these schemas

## Notes

### Spec Compliance
All schema implementations were carefully cross-referenced with the detailed tool specifications in `spec.md` (lines 236-577). Every parameter constraint, default value, and optional/required status matches the spec exactly.

### Pattern Consistency
Schemas follow the established pattern from `api.ts`:
- JSDoc comments above each schema
- Inline field comments using `/** ... */` syntax
- Custom error messages for validation rules
- Type exports using `z.infer<typeof SchemaName>`
- Consistent ordering: required fields first, optional fields last

### Breaking Changes from Initial Implementation
The file existed with an initial implementation that had several discrepancies from the spec:
1. CreateWorkoutSchema had incorrect length limits (100 instead of 200 for name, 500 instead of 2000 for description)
2. AddExerciseToRoutineSchema had incorrect validation (reps min was 1 instead of 0, order had no default, comment max was 200 instead of 500)
3. GetUserRoutinesSchema had incorrect limit max (50 instead of 100)
4. Missing user-friendly error messages throughout

All issues were corrected to exactly match the specification.
