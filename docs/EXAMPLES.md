# Usage Examples

This guide provides real-world scenarios demonstrating how to use the wger MCP server with Claude. Each example shows a complete conversation flow with the tools being used behind the scenes.

## Table of Contents

1. [Find Exercises for Home Workout](#scenario-1-find-exercises-for-home-workout)
2. [Create Full Body Routine](#scenario-2-create-full-body-routine)
3. [View and Modify Routines](#scenario-3-view-and-modify-routines)
4. [Explore Exercise Database](#scenario-4-explore-exercise-database)

---

## Scenario 1: Find Exercises for Home Workout

**Goal**: Find exercises that can be done at home with minimal equipment.

### Conversation Flow

```
User: "I want to work out at home. What equipment types are available?"

Claude: [calls list_equipment]

Claude: "Here are the available equipment types:
- Barbell (id: 1)
- Dumbbell (id: 3)
- Gym mat (id: 4)
- Pull-up bar (id: 6)
- None/bodyweight (id: 7)
- Bench (id: 8)
- Kettlebell (id: 9)
- Swiss Ball (id: 10)

For home workouts, I'd recommend focusing on bodyweight exercises (id: 7),
dumbbells (id: 3), or a gym mat (id: 4)."

---

User: "Show me bodyweight exercises I can do at home"

Claude: [calls search_exercises with equipment=7, limit=10]

Claude: "I found 87 bodyweight exercises! Here are some popular ones:

1. Push-ups - Works chest, shoulders, and triceps
2. Pull-ups - Targets back and biceps
3. Squats - Leg and glute exercise
4. Lunges - Single-leg strength
5. Plank - Core stability
6. Burpees - Full body cardio
7. Mountain climbers - Cardio and core
8. Dips - Triceps and chest
9. Leg raises - Lower abs
10. Jump squats - Plyometric leg exercise

Would you like details on any of these?"

---

User: "Tell me more about push-ups"

Claude: [calls get_exercise_details with exerciseId=123]

Claude: "Push-ups are a fundamental bodyweight exercise:

**Primary Muscles**: Chest (pectoralis major)
**Secondary Muscles**: Shoulders (deltoids), Triceps
**Equipment**: None (bodyweight)

**How to perform**:
1. Start in a plank position with hands slightly wider than shoulder-width
2. Keep your body in a straight line from head to heels
3. Lower your body until your chest nearly touches the floor
4. Push back up to the starting position
5. Keep your core engaged throughout the movement

**Tips**:
- Don't let your hips sag or pike up
- Breathe in on the way down, out on the way up
- Start with knee push-ups if regular push-ups are too difficult
- Progress to decline or diamond push-ups for more challenge

This is a great exercise for building upper body strength at home!"

---

User: "What muscles can I work with bodyweight exercises?"

Claude: [calls list_muscles]

Claude: "You can target all major muscle groups with bodyweight exercises:

**Upper Body:**
- Chest - Push-ups, dips
- Back - Pull-ups, rows
- Shoulders - Pike push-ups, handstands
- Biceps - Pull-ups, chin-ups
- Triceps - Dips, close-grip push-ups

**Core:**
- Abs - Planks, crunches, leg raises
- Obliques - Side planks, Russian twists

**Lower Body:**
- Quadriceps - Squats, lunges
- Hamstrings - Single-leg deadlifts
- Glutes - Squats, glute bridges
- Calves - Calf raises

Would you like exercises for any specific muscle group?"

---

User: "Show me back exercises that don't need a pull-up bar"

Claude: [calls search_exercises with muscle=3 (lats/back), equipment=7 (bodyweight)]

Claude: "Here are bodyweight back exercises that don't require a pull-up bar:

1. Superman - Lie face down and lift arms and legs
2. Reverse snow angels - Upper back strengthening
3. Bridge - Lower back and posterior chain
4. Body rows (table rows) - Use a sturdy table
5. Floor angels - Scapular mobility

These exercises help strengthen your back using just your body weight and a floor!"
```

### Tools Used

1. **list_equipment** - Browse available equipment
2. **search_exercises** (equipment=7) - Find bodyweight exercises
3. **get_exercise_details** - Learn proper form for push-ups
4. **list_muscles** - Understand what muscles can be targeted
5. **search_exercises** (muscle=3, equipment=7) - Find specific back exercises

---

## Scenario 2: Create Full Body Routine

**Goal**: Create a comprehensive workout routine with exercises for all major muscle groups.

### Conversation Flow

```
User: "Help me create a full body workout routine"

Claude: "I'd be happy to help! Let me create a new workout routine for you.
What would you like to call it?"

---

User: "Call it 'Full Body Strength - 3x per week'"

Claude: [calls create_workout with name="Full Body Strength - 3x per week",
        description="Complete full body workout hitting all major muscle groups"]

Claude: "Perfect! I've created your workout routine 'Full Body Strength - 3x per week'
(ID: 42). Now let's add some exercises. What equipment do you have available?"

---

User: "I have a barbell, dumbbells, and a bench"

Claude: "Great! With that equipment we can build a comprehensive full body routine.
Let me search for exercises that target all major muscle groups.

For a full body routine, I recommend:
- A compound leg exercise (squats)
- A push exercise (bench press)
- A pull exercise (rows)
- A shoulder exercise
- Some core work

Let me find these exercises..."

Claude: [calls search_exercises with category=10 (strength), equipment=1 (barbell)]
Claude: [calls search_exercises with category=10 (strength), equipment=3 (dumbbell)]

Claude: "I found some excellent exercises. Let me add them to your routine:

**Compound Lifts:**
1. Barbell Squats - Legs and core
2. Bench Press - Chest, shoulders, triceps
3. Barbell Rows - Back and biceps
4. Overhead Press - Shoulders and core

**Accessories:**
5. Dumbbell Lunges - Single-leg work
6. Dumbbell Curls - Biceps
7. Planks - Core stability

Should I add all of these with standard rep ranges?"

---

User: "Yes, add them with 3-4 sets each"

Claude: [calls add_exercise_to_routine for each exercise]

Claude: [calls add_exercise_to_routine with workoutId=42, dayId=1,
        exerciseId=111, sets=4, reps=8, comment="Compound leg builder"]

Claude: [calls add_exercise_to_routine with workoutId=42, dayId=1,
        exerciseId=88, sets=4, reps=8, comment="Main chest exercise"]

Claude: [calls add_exercise_to_routine with workoutId=42, dayId=1,
        exerciseId=145, sets=4, reps=8, comment="Back thickness"]

Claude: [calls add_exercise_to_routine with workoutId=42, dayId=1,
        exerciseId=67, sets=3, reps=10, comment="Shoulder strength"]

Claude: [calls add_exercise_to_routine with workoutId=42, dayId=1,
        exerciseId=89, sets=3, reps=12, comment="Single leg work"]

Claude: [calls add_exercise_to_routine with workoutId=42, dayId=1,
        exerciseId=34, sets=3, reps=12, comment="Bicep isolation"]

Claude: [calls add_exercise_to_routine with workoutId=42, dayId=1,
        exerciseId=201, sets=3, reps=30, comment="Core stability"]

Claude: "Excellent! I've added all 7 exercises to your Full Body Strength routine:

**Your Workout:**

1. **Barbell Squats** - 4 sets x 8 reps
   Compound leg builder

2. **Bench Press** - 4 sets x 8 reps
   Main chest exercise

3. **Barbell Rows** - 4 sets x 8 reps
   Back thickness

4. **Overhead Press** - 3 sets x 10 reps
   Shoulder strength

5. **Dumbbell Lunges** - 3 sets x 12 reps (each leg)
   Single leg work

6. **Dumbbell Curls** - 3 sets x 12 reps
   Bicep isolation

7. **Planks** - 3 sets x 30 seconds
   Core stability

This routine hits all major muscle groups and should take about 60-75 minutes.
Perform this workout 3 times per week with at least one rest day between sessions."

---

User: "Should I add weights to these exercises?"

Claude: "Absolutely! Let me update the exercises with suggested starting weights.
What's your experience level?"

---

User: "Intermediate - I've been lifting for about a year"

Claude: [calls add_exercise_to_routine to update exercises with weight values]

Claude: "I've updated your routine with suggested weights for intermediate lifters.
Start with these and adjust based on your strength:

1. Barbell Squats - 60kg (132 lbs)
2. Bench Press - 60kg (132 lbs)
3. Barbell Rows - 50kg (110 lbs)
4. Overhead Press - 40kg (88 lbs)
5. Dumbbell Lunges - 12kg per hand (26 lbs)
6. Dumbbell Curls - 12kg per hand (26 lbs)

These are starting points. Aim to add 2.5-5kg every 2-3 weeks as you progress!"
```

### Tools Used

1. **create_workout** - Create the routine
2. **search_exercises** (multiple times) - Find appropriate exercises
3. **add_exercise_to_routine** (7 times) - Add each exercise with sets/reps
4. **add_exercise_to_routine** (again) - Update with weight recommendations

---

## Scenario 3: View and Modify Routines

**Goal**: Review existing routines and make modifications.

### Conversation Flow

```
User: "Show me all my workout routines"

Claude: [calls get_user_routines]

Claude: "You have 3 workout routines:

**1. Full Body Strength - 3x per week**
   Created: Oct 15, 2025
   - 7 exercises
   - Mon/Wed/Fri schedule

**2. Upper Body Push**
   Created: Oct 18, 2025
   - 5 exercises
   - Tue/Thu schedule

**3. Home Cardio**
   Created: Oct 19, 2025
   - Empty (no exercises added yet)

Would you like details on any of these?"

---

User: "Show me the details of my Full Body routine"

Claude: "Here's your Full Body Strength routine in detail:

**Full Body Strength - 3x per week**
Schedule: Monday, Wednesday, Friday

1. Barbell Squats - 4 sets x 8 reps @ 60kg
   Note: Compound leg builder

2. Bench Press - 4 sets x 8 reps @ 60kg
   Note: Main chest exercise

3. Barbell Rows - 4 sets x 8 reps @ 50kg
   Note: Back thickness

4. Overhead Press - 3 sets x 10 reps @ 40kg
   Note: Shoulder strength

5. Dumbbell Lunges - 3 sets x 12 reps @ 12kg per hand
   Note: Single leg work

6. Dumbbell Curls - 3 sets x 12 reps @ 12kg per hand
   Note: Bicep isolation

7. Planks - 3 sets x 30 seconds
   Note: Core stability

Total estimated time: 60-75 minutes"

---

User: "I want to add deadlifts to this routine"

Claude: "Great idea! Deadlifts are an excellent compound exercise. Let me search
for deadlift variations..."

Claude: [calls search_exercises with query="deadlift"]

Claude: "I found several deadlift variations:

1. Conventional Deadlift (id: 95) - Barbell, full body
2. Romanian Deadlift (id: 96) - Focus on hamstrings
3. Sumo Deadlift (id: 97) - Wide stance variation
4. Trap Bar Deadlift (id: 98) - Alternative bar position

Which would you like to add? I'd recommend conventional deadlifts for your routine."

---

User: "Add conventional deadlifts right after squats"

Claude: [calls add_exercise_to_routine with workoutId=42, dayId=1,
        exerciseId=95, sets=3, reps=6, weight=80, order=2,
        comment="Posterior chain, heavy weight"]

Claude: "Perfect! I've added Conventional Deadlift to your routine:

**Updated Exercise Order:**

1. Barbell Squats - 4 sets x 8 reps @ 60kg
2. **Conventional Deadlift - 3 sets x 6 reps @ 80kg** (NEW)
3. Bench Press - 4 sets x 8 reps @ 60kg
4. Barbell Rows - 4 sets x 8 reps @ 50kg
[remaining exercises...]

Note: This is now a very demanding routine with two heavy compound leg exercises.
Make sure you're eating and sleeping enough to recover!"

---

User: "Can I see just my cardio routine?"

Claude: [calls get_user_routines with limit=50]
[Filters for the specific routine from results]

Claude: "Your Home Cardio routine is currently empty. Would you like me to help
you add some cardio exercises? We could add:
- Burpees
- Mountain climbers
- Jump rope
- High knees
- Jumping jacks

These don't require any equipment!"

---

User: "Yes! Add those as a circuit - 30 seconds each"

Claude: [calls search_exercises for each cardio exercise]
Claude: [calls add_exercise_to_routine for each exercise]

Claude: "I've created a cardio circuit for you! Your Home Cardio routine now has:

1. Burpees - 3 rounds x 30 seconds
2. Mountain Climbers - 3 rounds x 30 seconds
3. Jump Rope - 3 rounds x 30 seconds
4. High Knees - 3 rounds x 30 seconds
5. Jumping Jacks - 3 rounds x 30 seconds

Perform each exercise for 30 seconds, rest 30 seconds, then move to the next.
Complete all 5 exercises for 1 round. Do 3 rounds total.
Total workout time: about 15 minutes including rest!"
```

### Tools Used

1. **get_user_routines** - View all routines
2. **search_exercises** (query="deadlift") - Find deadlift exercise
3. **add_exercise_to_routine** - Add deadlift with specific order
4. **search_exercises** (multiple times) - Find cardio exercises
5. **add_exercise_to_routine** (5 times) - Build cardio circuit

---

## Scenario 4: Explore Exercise Database

**Goal**: Browse and learn about different exercises and categories.

### Conversation Flow

```
User: "I'm new to working out. What types of exercises exist?"

Claude: [calls list_categories]

Claude: "Welcome to fitness! There are 7 main exercise categories:

1. **Arms** - Biceps, triceps, forearms
2. **Legs** - Quadriceps, hamstrings, calves
3. **Back** - Lats, traps, lower back
4. **Abs** - Core, obliques
5. **Shoulders** - Deltoids
6. **Chest** - Pectorals
7. **Cardio** - Heart and endurance training

As a beginner, I recommend starting with compound exercises that work multiple
muscle groups at once. Would you like to learn about exercises for a specific area?"

---

User: "Tell me about chest exercises"

Claude: [calls search_exercises with category=13 (chest), limit=15]

Claude: "Here are popular chest exercises:

**Beginner-Friendly:**
1. Push-ups (bodyweight) - Classic chest builder
2. Dumbbell Bench Press - Allows natural movement
3. Machine Chest Press - Guided movement

**Intermediate:**
4. Barbell Bench Press - Standard chest exercise
5. Incline Dumbbell Press - Upper chest focus
6. Cable Flyes - Chest isolation

**Advanced:**
7. Dips - Bodyweight chest and tricep builder
8. Decline Bench Press - Lower chest emphasis

Which exercise would you like to learn more about?"

---

User: "What's the difference between incline and regular bench press?"

Claude: [calls get_exercise_details for both exercises]

Claude: "Great question! Here are the key differences:

**Regular (Flat) Bench Press:**
- Primary: Middle chest (pectoralis major)
- Secondary: Front shoulders, triceps
- Most people can lift the most weight
- All-around chest development

**Incline Bench Press:**
- Primary: Upper chest (clavicular head of pectoralis)
- Secondary: Front shoulders (more shoulder involvement)
- Angle: 30-45 degrees
- Targets often-underdeveloped upper chest
- Slightly lighter weights than flat bench

**Recommendation for beginners:**
Start with flat bench press to build overall chest strength, then add incline
press after 2-3 months to target upper chest. Doing both in your routine
provides complete chest development!"

---

User: "What muscles does bench press work exactly?"

Claude: [calls list_muscles]
[Filters and explains based on bench press exercise details]

Claude: "The bench press is a compound movement that works multiple muscles:

**Primary Muscles (main movers):**
- Pectoralis Major (Chest) - Does most of the work
  - This is the large fan-shaped muscle on your chest

**Secondary Muscles (assist the movement):**
- Anterior Deltoid (Front Shoulder) - Helps push the weight
- Triceps Brachii (Back of arm) - Extends the elbow
- Serratus Anterior (Side ribs) - Stabilizes shoulder blade

**Stabilizer Muscles:**
- Core muscles - Keep your body stable
- Upper back - Maintains shoulder position

This is why bench press is so popular - it's an efficient exercise that works
your entire pushing musculature!"

---

User: "Can I work out chest without equipment?"

Claude: [calls search_exercises with category=13 (chest), equipment=7 (bodyweight)]

Claude: "Absolutely! Here are effective bodyweight chest exercises:

**Beginner:**
1. Wall Push-ups - Easiest variation
2. Knee Push-ups - Building strength
3. Standard Push-ups - Foundation exercise

**Intermediate:**
4. Wide-grip Push-ups - More chest activation
5. Diamond Push-ups - Inner chest and triceps
6. Decline Push-ups - Feet elevated for difficulty

**Advanced:**
7. One-arm Push-ups - Unilateral strength
8. Plyometric Push-ups - Explosive power
9. Pseudo Planche Push-ups - Very challenging

**Recommendation:**
Start with knee push-ups, progress to standard push-ups, then try variations.
You can build a strong chest with just these exercises!"

---

User: "Show me exercises I can do with just a pull-up bar"

Claude: [calls search_exercises with equipment=6 (pull-up bar)]

Claude: "With just a pull-up bar, you can work your entire upper body! Here are
the main exercises:

**Back Exercises:**
1. Pull-ups (wide grip) - Lat development
2. Chin-ups (underhand) - Biceps and lats
3. Neutral grip pull-ups - Balanced development

**Core Exercises:**
4. Hanging knee raises - Lower abs
5. Hanging leg raises - Full core
6. Windshield wipers - Obliques

**Advanced:**
7. Muscle-ups - Dynamic movement
8. Front lever - Extreme core and back
9. L-sit - Core strength and control

**For Beginners:**
If you can't do pull-ups yet, start with:
- Dead hangs (just hang from the bar)
- Negative pull-ups (jump up, lower slowly)
- Band-assisted pull-ups

A pull-up bar is one of the most versatile pieces of equipment you can have!"
```

### Tools Used

1. **list_categories** - Understand exercise types
2. **search_exercises** (category=13) - Browse chest exercises
3. **get_exercise_details** (multiple) - Compare exercises
4. **list_muscles** - Learn muscle anatomy
5. **search_exercises** (category=13, equipment=7) - Bodyweight chest exercises
6. **search_exercises** (equipment=6) - Pull-up bar exercises

---

## Tips for Using the wger MCP Server

### General Tips

1. **Start with list tools**: Use `list_categories`, `list_muscles`, and `list_equipment` first to understand available options

2. **Be specific**: The more specific your request, the better Claude can help you find the right exercises

3. **Combine filters**: Search by multiple criteria (muscle + equipment + category) for targeted results

4. **Save IDs**: Remember workout IDs and exercise IDs for future modifications

5. **Ask for details**: Don't hesitate to ask for more information about exercises using `get_exercise_details`

### Creating Effective Workouts

1. **Name descriptively**: Use workout names that indicate the type and frequency
   - Good: "Upper Body Push - 2x/week"
   - Bad: "Workout 1"

2. **Add comments**: Use the comment field to note form cues or progression plans

3. **Specify weights**: Include weights for tracking progress over time

4. **Order matters**: Add exercises in the order you'll perform them

5. **Build progressively**: Start with basic exercises, add complexity later

### Learning About Exercises

1. **Ask "why"**: Ask Claude to explain why certain exercises are recommended

2. **Compare options**: Ask to compare different exercises for the same muscle group

3. **Check requirements**: Verify equipment needs before planning workouts

4. **Learn anatomy**: Ask about which muscles are worked to understand your body better

5. **Get alternatives**: If an exercise is too hard or uses unavailable equipment, ask for alternatives

---

## Need More Help?

- **Full API Documentation**: See [API.md](API.md) for detailed tool reference
- **Setup Issues**: See [SETUP.md](SETUP.md) for installation and configuration help
- **Report Problems**: [GitHub Issues](https://github.com/yourusername/wger-mcp/issues)

Happy training!
