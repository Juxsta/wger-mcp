# API Reference

Complete documentation for all 8 tools provided by the wger MCP server.

## Table of Contents

### Exercise Discovery Tools
- [search_exercises](#search_exercises)
- [get_exercise_details](#get_exercise_details)
- [list_categories](#list_categories)
- [list_muscles](#list_muscles)
- [list_equipment](#list_equipment)

### Workout Management Tools (Authentication Required)
- [create_workout](#create_workout)
- [add_exercise_to_routine](#add_exercise_to_routine)
- [get_user_routines](#get_user_routines)

---

## Exercise Discovery Tools

These tools allow searching and browsing the wger exercise database. No authentication required.

### search_exercises

Search for exercises with optional filters for muscle group, equipment, category, and keywords. Supports pagination for large result sets.

#### Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `query` | string | No | - | Keyword to search in exercise names and descriptions |
| `muscle` | number | No | - | Muscle group ID to filter exercises by target muscle (use `list_muscles` to get IDs) |
| `equipment` | number | No | - | Equipment ID to filter exercises by required equipment (use `list_equipment` to get IDs) |
| `category` | number | No | - | Category ID to filter exercises by type (use `list_categories` to get IDs) |
| `limit` | number | No | 20 | Number of results to return (max: 100) |
| `offset` | number | No | 0 | Number of results to skip for pagination |

#### Returns

```typescript
{
  count: number;              // Total number of matching exercises
  next: string | null;        // URL for next page of results (null if last page)
  previous: string | null;    // URL for previous page of results (null if first page)
  results: Array<{
    id: number;               // Exercise ID (use with get_exercise_details)
    name: string;             // Exercise name
    category: number;         // Category ID
    muscles: number[];        // Primary muscle IDs
    muscles_secondary: number[]; // Secondary muscle IDs
    equipment: number[];      // Equipment IDs
    language: number;         // Language ID
  }>;
}
```

#### Errors

- **ValidationError**: Invalid parameter types or values (e.g., limit > 100, negative offset)
- **ApiError**: wger API is unavailable or returns an error
- **RateLimitError**: Too many requests to wger API

#### Example Usage

**Find chest exercises:**

```
User: "Show me some chest exercises"

Claude: [calls search_exercises with muscle=4 (chest)]

Response:
{
  "count": 45,
  "next": "...",
  "previous": null,
  "results": [
    {
      "id": 88,
      "name": "Bench press",
      "category": 10,
      "muscles": [4],
      "muscles_secondary": [1, 5],
      "equipment": [1],
      "language": 2
    },
    ...
  ]
}
```

**Search with multiple filters:**

```
User: "Find dumbbell exercises for shoulders"

Claude: [calls search_exercises with muscle=2 (shoulders), equipment=3 (dumbbell)]

Response: List of exercises matching both criteria
```

#### Notes

- Results are paginated with a default limit of 20
- Use `list_muscles`, `list_equipment`, and `list_categories` first to find valid filter IDs
- Empty filters return all exercises (paginated)
- The `query` parameter searches exercise names and descriptions (case-insensitive)
- Combining multiple filters applies AND logic (exercise must match all criteria)

---

### get_exercise_details

Retrieve comprehensive information about a specific exercise, including description, muscles worked, equipment needed, and form instructions.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `exerciseId` | number | Yes | The ID of the exercise to retrieve |

#### Returns

```typescript
{
  id: number;                 // Exercise ID
  name: string;               // Exercise name
  uuid: string;               // Unique identifier
  description: string;        // Detailed description with form instructions
  category: number;           // Category ID
  muscles: number[];          // Primary muscles worked
  muscles_secondary: number[]; // Secondary muscles worked
  equipment: number[];        // Required equipment
  language: number;           // Language ID
  license: number;            // Content license ID
  license_author: string;     // Author/source attribution
  variations: number[];       // IDs of exercise variations
}
```

#### Errors

- **ValidationError**: Missing or invalid exerciseId
- **NotFoundError**: Exercise with the given ID does not exist (404)
- **ApiError**: wger API is unavailable or returns an error

#### Example Usage

```
User: "Tell me more about exercise 88"

Claude: [calls get_exercise_details with exerciseId=88]

Response:
{
  "id": 88,
  "name": "Bench press",
  "uuid": "UUID-STRING",
  "description": "Lie on a flat bench with your feet on the floor...",
  "category": 10,
  "muscles": [4],
  "muscles_secondary": [1, 5],
  "equipment": [1],
  "language": 2,
  "license": 2,
  "license_author": "wger.de",
  "variations": [89, 90]
}

Claude explains: "The bench press is a compound exercise that primarily
targets the chest (pectoralis major). It also works the front shoulders
(anterior deltoids) and triceps as secondary muscles. You'll need a barbell
and bench. [Provides form instructions from description]"
```

#### Notes

- Exercise details are cached for 1 hour to improve performance
- The `description` field may contain HTML formatting
- Use `variations` array to find similar exercises
- Some exercises may not have descriptions in all languages
- The `license_author` field provides proper attribution for exercise content

---

### list_categories

Retrieve all available exercise categories (e.g., strength, cardio, stretching).

#### Parameters

None.

#### Returns

```typescript
{
  results: Array<{
    id: number;     // Category ID (use for filtering in search_exercises)
    name: string;   // Category name
  }>;
}
```

#### Errors

- **ApiError**: wger API is unavailable or returns an error
- **RateLimitError**: Too many requests to wger API

#### Example Usage

```
User: "What types of exercises are available?"

Claude: [calls list_categories]

Response:
{
  "results": [
    { "id": 10, "name": "Arms" },
    { "id": 8, "name": "Legs" },
    { "id": 12, "name": "Back" },
    { "id": 11, "name": "Abs" },
    { "id": 14, "name": "Shoulders" },
    { "id": 13, "name": "Chest" },
    { "id": 9, "name": "Cardio" }
  ]
}

Claude responds: "There are 7 exercise categories:
- Arms (id: 10)
- Legs (id: 8)
- Back (id: 12)
..."
```

#### Notes

- Results are cached for 24 hours (categories rarely change)
- Returns all categories without pagination
- Use the category IDs with `search_exercises` to filter by category
- Categories represent the primary muscle group or exercise type

---

### list_muscles

Retrieve all muscle groups that can be targeted with exercises.

#### Parameters

None.

#### Returns

```typescript
{
  results: Array<{
    id: number;        // Muscle ID (use for filtering in search_exercises)
    name: string;      // Muscle name (localized)
    name_en: string;   // English muscle name
    is_front: boolean; // true if muscle is on front of body, false if on back
  }>;
}
```

#### Errors

- **ApiError**: wger API is unavailable or returns an error
- **RateLimitError**: Too many requests to wger API

#### Example Usage

```
User: "What muscles can I target?"

Claude: [calls list_muscles]

Response:
{
  "results": [
    { "id": 1, "name": "Biceps brachii", "name_en": "Biceps", "is_front": true },
    { "id": 2, "name": "Anterior deltoid", "name_en": "Shoulders", "is_front": true },
    { "id": 4, "name": "Pectoralis major", "name_en": "Chest", "is_front": true },
    { "id": 3, "name": "Latissimus dorsi", "name_en": "Lats", "is_front": false },
    ...
  ]
}

Claude responds: "You can target these muscle groups:
Front muscles:
- Biceps (id: 1)
- Shoulders/Deltoids (id: 2)
- Chest (id: 4)
...
Back muscles:
- Lats (id: 3)
..."
```

#### Notes

- Results are cached for 24 hours (muscle list rarely changes)
- Returns all muscles without pagination
- Use the muscle IDs with `search_exercises` to filter exercises
- `is_front` helps categorize muscles by body side
- The `name_en` field provides standardized English names

---

### list_equipment

Retrieve all equipment types available for exercises.

#### Parameters

None.

#### Returns

```typescript
{
  results: Array<{
    id: number;     // Equipment ID (use for filtering in search_exercises)
    name: string;   // Equipment name
  }>;
}
```

#### Errors

- **ApiError**: wger API is unavailable or returns an error
- **RateLimitError**: Too many requests to wger API

#### Example Usage

```
User: "What equipment types are available?"

Claude: [calls list_equipment]

Response:
{
  "results": [
    { "id": 1, "name": "Barbell" },
    { "id": 3, "name": "Dumbbell" },
    { "id": 4, "name": "Gym mat" },
    { "id": 6, "name": "Pull-up bar" },
    { "id": 7, "name": "none (bodyweight)" },
    { "id": 8, "name": "Bench" },
    { "id": 9, "name": "Kettlebell" },
    ...
  ]
}

Claude responds: "Available equipment types:
- Barbell (id: 1)
- Dumbbell (id: 3)
- Bodyweight/No equipment (id: 7)
- Pull-up bar (id: 6)
..."
```

#### Notes

- Results are cached for 24 hours (equipment list rarely changes)
- Returns all equipment types without pagination
- Use equipment IDs with `search_exercises` to filter exercises
- "none (bodyweight)" indicates exercises that require no equipment
- Some exercises may require multiple equipment types

---

## Workout Management Tools

These tools require authentication to create and manage workout routines. You must set `WGER_API_KEY` or `WGER_USERNAME` and `WGER_PASSWORD` in your environment variables.

### create_workout

Create a new workout routine for the authenticated user.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Workout routine name (1-100 characters) |
| `description` | string | No | Optional workout description (max 500 characters) |

#### Returns

```typescript
{
  id: number;              // Workout ID (use with add_exercise_to_routine)
  name: string;            // Workout name
  description: string;     // Workout description
  creation_date: string;   // ISO 8601 timestamp
  days: number[];          // Array of day IDs in this workout
}
```

#### Errors

- **AuthenticationError**: User not authenticated or invalid credentials
- **ValidationError**: Invalid or missing name, description too long
- **ApiError**: wger API is unavailable or returns an error

#### Example Usage

```
User: "Create a new workout called 'Upper Body Strength'"

Claude: [calls create_workout with name="Upper Body Strength"]

Response:
{
  "id": 42,
  "name": "Upper Body Strength",
  "description": "",
  "creation_date": "2025-10-20T10:30:00Z",
  "days": []
}

Claude responds: "I've created your new workout 'Upper Body Strength'
(ID: 42). It's empty right now - you can add exercises to it using
add_exercise_to_routine."
```

**With description:**

```
User: "Create a workout called 'Home Cardio' for cardio exercises at home"

Claude: [calls create_workout with name="Home Cardio",
        description="Cardio exercises that can be done at home"]

Response:
{
  "id": 43,
  "name": "Home Cardio",
  "description": "Cardio exercises that can be done at home",
  "creation_date": "2025-10-20T10:35:00Z",
  "days": []
}
```

#### Notes

- Requires authentication (WGER_API_KEY or USERNAME/PASSWORD)
- The returned workout ID is needed to add exercises
- New workouts start with no days or exercises
- Workout names must be unique per user
- Description is optional but helpful for organization

---

### add_exercise_to_routine

Add an exercise to an existing workout routine with specific set and rep parameters.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `workoutId` | number | Yes | The workout routine ID |
| `dayId` | number | Yes | The day ID within the workout |
| `exerciseId` | number | Yes | The exercise ID to add |
| `sets` | number | Yes | Number of sets (1-10) |
| `reps` | number | No | Number of reps per set (1-100) |
| `weight` | number | No | Weight in kg (0 or positive) |
| `order` | number | No | Exercise order in the day (defaults to last) |
| `comment` | string | No | Optional notes about this exercise (max 200 characters) |

#### Returns

```typescript
{
  id: number;          // Set ID
  exercise: number;    // Exercise ID
  sets: number;        // Number of sets
  reps: number;        // Reps per set
  weight: number;      // Weight in kg
  order: number;       // Order in the workout day
  comment: string;     // Notes or comments
}
```

#### Errors

- **AuthenticationError**: User not authenticated or invalid credentials
- **ValidationError**: Invalid parameters (sets out of range, negative weight, etc.)
- **NotFoundError**: Workout, day, or exercise not found
- **ApiError**: wger API is unavailable or returns an error

#### Example Usage

**Basic usage:**

```
User: "Add bench press (exercise 88) to my upper body workout with 4 sets of 8 reps"

Claude: [calls add_exercise_to_routine with workoutId=42, dayId=1,
        exerciseId=88, sets=4, reps=8]

Response:
{
  "id": 201,
  "exercise": 88,
  "sets": 4,
  "reps": 8,
  "weight": 0,
  "order": 1,
  "comment": ""
}

Claude responds: "I've added bench press to your workout with 4 sets
of 8 reps."
```

**With weight and notes:**

```
User: "Add squats (exercise 111) with 3 sets of 10 reps at 60kg,
      and note to focus on form"

Claude: [calls add_exercise_to_routine with workoutId=42, dayId=1,
        exerciseId=111, sets=3, reps=10, weight=60,
        comment="Focus on form"]

Response:
{
  "id": 202,
  "exercise": 111,
  "sets": 3,
  "reps": 10,
  "weight": 60,
  "order": 2,
  "comment": "Focus on form"
}
```

#### Notes

- Requires authentication
- Both workoutId and dayId must exist and belong to the authenticated user
- The exerciseId must exist in the exercise database
- If `order` is not specified, the exercise is added at the end
- `reps` and `weight` are optional for exercises where they don't apply (e.g., timed exercises)
- Weight is assumed to be in kilograms
- Comments are useful for form cues, progression notes, or reminders

---

### get_user_routines

Retrieve all workout routines for the authenticated user, including all exercises, sets, and reps.

#### Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `limit` | number | No | 20 | Number of routines to return (max: 50) |
| `offset` | number | No | 0 | Number of routines to skip for pagination |

#### Returns

```typescript
{
  count: number;             // Total number of user's routines
  next: string | null;       // URL for next page (null if last page)
  previous: string | null;   // URL for previous page (null if first page)
  results: Array<{
    id: number;              // Workout ID
    name: string;            // Workout name
    description: string;     // Workout description
    creation_date: string;   // ISO 8601 timestamp
    days: Array<{
      id: number;            // Day ID
      description: string;   // Day description
      day: number[];         // Days of week this applies to
      sets: Array<{
        id: number;          // Set ID
        exercise: number;    // Exercise ID
        sets: number;        // Number of sets
        reps: number;        // Reps per set
        weight: number;      // Weight in kg
        order: number;       // Exercise order
        comment: string;     // Notes
      }>;
    }>;
  }>;
}
```

#### Errors

- **AuthenticationError**: User not authenticated or invalid credentials
- **ValidationError**: Invalid limit or offset values
- **ApiError**: wger API is unavailable or returns an error

#### Example Usage

```
User: "Show me all my workout routines"

Claude: [calls get_user_routines]

Response:
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 42,
      "name": "Upper Body Strength",
      "description": "",
      "creation_date": "2025-10-20T10:30:00Z",
      "days": [
        {
          "id": 1,
          "description": "Chest and Arms",
          "day": [1, 3, 5],
          "sets": [
            {
              "id": 201,
              "exercise": 88,
              "sets": 4,
              "reps": 8,
              "weight": 80,
              "order": 1,
              "comment": ""
            },
            {
              "id": 202,
              "exercise": 111,
              "sets": 3,
              "reps": 10,
              "weight": 60,
              "order": 2,
              "comment": "Focus on form"
            }
          ]
        }
      ]
    },
    {
      "id": 43,
      "name": "Home Cardio",
      "description": "Cardio exercises at home",
      "creation_date": "2025-10-20T10:35:00Z",
      "days": []
    }
  ]
}

Claude responds: "You have 2 workout routines:

1. Upper Body Strength - Created Oct 20
   - Contains 2 exercises on Mon/Wed/Fri
   - Bench press: 4 sets x 8 reps @ 80kg
   - Squats: 3 sets x 10 reps @ 60kg (Focus on form)

2. Home Cardio - Created Oct 20
   - Empty (no exercises yet)"
```

#### Notes

- Requires authentication
- Results are NOT cached (user data may change frequently)
- Default limit is 20 routines
- The nested structure includes full details of all days and exercises
- The `day` array in each day uses numeric codes (1=Monday, 2=Tuesday, etc.)
- Empty `days` array means the workout has no exercises yet
- Use the exercise IDs to get more details with `get_exercise_details`

---

## Error Handling

All tools may return the following error types:

### ValidationError

Input parameters failed validation.

**Example response:**
```
Error: Invalid search parameters. Check your input values.
```

**Common causes:**
- Missing required parameters
- Parameters out of valid range (e.g., limit > 100)
- Invalid parameter types (e.g., string instead of number)

### AuthenticationError

Authentication required or authentication failed.

**Example response:**
```
Error: Authentication required to create workouts. Please set WGER_API_KEY
or WGER_USERNAME and WGER_PASSWORD environment variables.
```

**Common causes:**
- No credentials configured
- Invalid API key or username/password
- Expired API key
- Attempting to use workout management tools without authentication

### NotFoundError

Requested resource not found.

**Example response:**
```
Error: Exercise with ID 99999 not found.
```

**Common causes:**
- Invalid exercise ID
- Invalid workout or day ID
- Resource was deleted

### RateLimitError

Too many requests to the wger API.

**Example response:**
```
Error: Rate limit exceeded. Please try again in a few moments.
```

**Common causes:**
- Making too many requests in a short time
- Multiple users sharing the same API key

**Solution:** Wait a moment and retry. The server's caching helps prevent this.

### ApiError

General API communication error.

**Example response:**
```
Error: Unable to connect to wger API. Please try again.
```

**Common causes:**
- Network connectivity issues
- wger API is down or under maintenance
- Request timeout
- Server errors (5xx)

---

## Rate Limiting and Caching

To provide optimal performance and minimize API load:

### Cached Data

- **Categories, Muscles, Equipment**: Cached for 24 hours
- **Exercise Details**: Cached for 1 hour
- **User Routines**: Never cached (always fresh)

### Cache Benefits

- Faster response times for frequently accessed data
- Reduced load on wger API
- Lower chance of hitting rate limits

### Rate Limits

The wger API may implement rate limiting. The server automatically:
- Retries failed requests once with exponential backoff
- Returns clear error messages when rate limited
- Uses caching to minimize API calls

---

## Best Practices

1. **Get filter IDs first**: Call `list_muscles`, `list_equipment`, and `list_categories` before filtering with `search_exercises`

2. **Use caching effectively**: Exercise details are cached, so it's efficient to call `get_exercise_details` multiple times for the same exercise

3. **Paginate large results**: Use `limit` and `offset` parameters to paginate through large result sets

4. **Handle errors gracefully**: Check for authentication before calling workout management tools

5. **Be specific in searches**: Combine multiple filters in `search_exercises` to get more targeted results

6. **Save important IDs**: Store workout and exercise IDs returned by tools for future operations

7. **Use descriptive names**: Give workouts and exercises clear, descriptive names and comments

---

## Support

For issues, questions, or feature requests:
- GitHub Issues: https://github.com/yourusername/wger-mcp/issues
- Documentation: See [SETUP.md](SETUP.md) and [EXAMPLES.md](EXAMPLES.md)
- wger API Docs: https://wger.de/en/software/api
