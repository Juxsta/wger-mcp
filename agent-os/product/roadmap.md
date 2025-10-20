# Product Roadmap

## MVP - Core Exercise & Workout Tools

1. [ ] Exercise Search Tool - Implement search_exercises tool that queries wger API with filters for muscle group, equipment, category, and keywords. Returns paginated exercise list with IDs, names, and basic metadata. `S`

2. [ ] Exercise Details Tool - Implement get_exercise_details tool that fetches comprehensive information for a specific exercise including description, muscles worked, equipment required, and exercise category. `XS`

3. [ ] List Exercise Categories - Implement list_categories tool that returns all available exercise categories (strength, cardio, stretching, etc.) with IDs and names for filtering. `XS`

4. [ ] List Muscles & Equipment - Implement list_muscles and list_equipment tools that return all available muscle groups and equipment types with IDs and names for use in exercise filtering. `XS`

5. [ ] User Authentication - Implement authentication flow using wger's JWT token system. Support both API key and username/password authentication methods with token refresh capability. `S`

6. [ ] Create Workout Routine - Implement create_workout tool that creates a new workout routine for authenticated users with name, description, and basic metadata. Returns routine ID for subsequent operations. `S`

7. [ ] Add Exercises to Routine - Implement add_exercise_to_routine tool that adds specific exercises to a workout routine with set/rep parameters, order, and optional notes. Supports multiple exercises in single routine. `M`

8. [ ] Get User Routines - Implement get_user_routines tool that fetches all workout routines for authenticated user with complete exercise lists, set/rep schemes, and routine metadata. `S`

## Phase 2 - Nutrition & Tracking

9. [ ] Ingredient Search - Implement search_ingredients tool that queries wger nutrition database with keyword search. Returns ingredients with nutritional information (calories, protein, carbs, fat, fiber). `S`

10. [ ] Nutrition Plan Management - Implement create_nutrition_plan and get_nutrition_plan tools that allow users to create daily meal plans and retrieve them with complete nutritional totals. `M`

11. [ ] Body Weight Tracking - Implement log_weight and get_weight_history tools that record body weight measurements with timestamps and retrieve historical data for progress tracking. `S`

12. [ ] Workout Logging - Implement log_workout tool that records completed workouts with actual sets, reps, and weights used. Links to routine exercises for progress comparison. `M`

## Phase 3 - Advanced Features & Polish

13. [ ] Exercise Images & Media - Enhance get_exercise_details to include exercise images and video URLs. Add get_exercise_images tool for bulk image retrieval. `S`

14. [ ] Workout Templates & Sharing - Implement get_public_routines tool to browse community workout templates. Add export_routine tool to generate shareable routine formats. `M`

15. [ ] Progress Analytics - Implement get_progress_stats tool that analyzes workout logs and weight history to calculate strength gains, volume trends, and body composition changes over time. `L`

16. [ ] Routine Progression Rules - Implement set_progression_rule tool that defines automatic weight/rep progression schemes (linear, wave, percentage-based) for exercises in routines. `M`

> Notes
> - Each item represents an end-to-end functional and testable MCP tool
> - Items ordered by core functionality first, then enhanced features
> - MVP focuses on exercise discovery and basic workout management
> - Phase 2 adds nutrition tracking and workout logging capabilities
> - Phase 3 provides advanced features for serious fitness tracking
> - All tools require proper error handling, input validation, and documentation
> - Each tool should include TypeScript types and comprehensive JSDoc comments
