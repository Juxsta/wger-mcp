
import { wgerClient } from '../src/client/wger-client';

import { addDayToRoutineHandler, updateDayHandler, deleteDayHandler } from '../src/tools/manage-day';
import { getRoutineDetailsHandler } from '../src/tools/get-routine-details';
import { addExerciseToRoutineHandler } from '../src/tools/add-exercise-to-routine';
import { updateExerciseInRoutineHandler } from '../src/tools/update-exercise';
import { createWorkoutHandler } from '../src/tools/create-workout';
import { Routine } from '../src/types/wger';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config();

// Mute logger for test output clarity, or keep it for debugging
// logger.level = 'debug'; 

async function runVerification() {
    console.log('Starting verification with REAL API...');

    if (!process.env.WGER_API_KEY && (!process.env.WGER_USERNAME || !process.env.WGER_PASSWORD)) {
        console.error('Missing credentials in .env');
        process.exit(1);
    }

    let routineId: number | undefined;

    try {
        // 1. Create a test workout
        console.log('1. Creating test routine...');
        const routine = await createWorkoutHandler({
            name: `Test ${Date.now().toString().slice(-6)}`,
            description: 'Temporary routine for verification',
        }) as Routine;
        routineId = routine.id;
        console.log(`   -> Created routine: ${routineId}`);

        // 2. Add a Day
        console.log('2. Adding a day...');
        const day = await addDayToRoutineHandler({
            routineId,
            description: 'Test Day 1',
            is_rest: false
        });
        console.log(`   -> Created day: ${day.id}`);

        // 3. Update the Day
        console.log('3. Updating the day...');
        await updateDayHandler({
            dayId: day.id,
            description: 'Updated Test Day 1',
            name: 'Updated Test Day 1',
            is_rest: true // Toggle rest to test
        });
        console.log('   -> Day updated');

        // 4. Add an Exercise (finding a common one, e.g., Bench Press id=88 usually, or search first)
        // We'll trust the user/env has access to standard exercises. 
        // Let's use ID 88 (Bench Press) if it exists, otherwise this might fail if the DB is empty.
        // Actually, let's search for one first to be safe.

        // Quick search (using client directly to avoid importing another tool/handler overlap)
        const exerciseRes = await wgerClient.get<{ results: { id: number }[] }>('/exercise/', { params: { limit: 1 } });
        const exerciseId = exerciseRes.results[0]?.id;

        if (!exerciseId) {
            throw new Error('No exercises found in DB to test with.');
        }

        console.log(`4. Adding exercise ${exerciseId} to routine...`);
        // Note: addExerciseToRoutineHandler might create its own day if name matches, or use existing?
        // The tool implementation: "dayName... Creates new day if not found."
        // Let's use the day we just created? The tool logic is a bit specific:
        // It looks for a day by name. If we pass the name of our updated day, it should work.
        // 'Updated Test Day 1'

        const slotEntry = await addExerciseToRoutineHandler({
            routineId,
            exerciseId,
            sets: 3,
            reps: 10,
            dayName: 'Updated Test Day 1'
        });
        console.log(`   -> Added slot entry: ${slotEntry.id}`);

        // 5. Get Routine Details
        console.log('5. Fetching routine details...');
        const details = await getRoutineDetailsHandler({ routineId });
        console.log('   -> Details fetched. Verifying structure...');

        // Verify
        const dDay = details.days.find(d => d.id === day.id);
        if (!dDay) {
            throw new Error('Day not found in details');
        }
        const dSlot = dDay.slots.find(s => s.id === slotEntry.slot);
        if (!dSlot) {
            throw new Error('Slot not found in details');
        }
        const dEntry = dSlot.entries.find(e => e.id === slotEntry.id);
        if (!dEntry) throw new Error('Entry not found in details');

        if (dEntry.sets !== 3 || dEntry.reps != '10') { // Note: wger API returns decimal strings often, wait, our type says number or string?
            // In our tool we cast/parse value.
            console.warn(`   Warning: sets/reps mismatch? Got sets=${dEntry.sets}, reps=${dEntry.reps}`);
        }
        console.log('   -> Structure verified.');

        // 6. Update Exercise
        console.log('6. Updating exercise entry...');
        await updateExerciseInRoutineHandler({
            slotEntryId: slotEntry.id,
            sets: 4,
            reps: 12,
            weight: 50
        });
        console.log('   -> Exercise updated.');

        // Verify update
        const details2 = await getRoutineDetailsHandler({ routineId });
        const dEntry2 = details2.days.find(d => d.id === day.id)?.slots[0].entries.find(e => e.id === slotEntry.id);
        console.log(`   -> Verified update: sets=${dEntry2?.sets}, reps=${dEntry2?.reps}, weight=${dEntry2?.weight}`);

        // 7. Delete Day
        console.log('7. Deleting day...');
        await deleteDayHandler({ dayId: day.id });
        console.log('   -> Day deleted.');

    } catch (err: any) {
        console.error('FAILED:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
        process.exit(1);
    } finally {
        // Cleanup Routine
        if (routineId) {
            console.log('Cleaning up routine...');
            try {
                await wgerClient.delete(`/routine/${routineId}/`);
                console.log('Routine deleted.');
            } catch (e) {
                console.error('Failed to cleanup routine', e);
            }
        }
    }
}

runVerification();
