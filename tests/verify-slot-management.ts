
import { wgerClient } from '../src/client/wger-client';
import { addDayToRoutineHandler } from '../src/tools/manage-day';
import { getRoutineDetailsHandler } from '../src/tools/get-routine-details';
import { addExerciseToRoutineHandler } from '../src/tools/add-exercise-to-routine';
import { deleteSlotHandler } from '../src/tools/delete-slot';
import { createWorkoutHandler } from '../src/tools/create-workout';
import { Routine } from '../src/types/wger';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config();

async function runVerification() {
    console.log('Starting SLOT management verification with REAL API...');

    if (!process.env.WGER_API_KEY && (!process.env.WGER_USERNAME || !process.env.WGER_PASSWORD)) {
        console.error('Missing credentials in .env');
        process.exit(1);
    }

    let routineId: number | undefined;

    try {
        // 1. Create a test workout
        console.log('1. Creating test routine...');
        const routine = await createWorkoutHandler({
            name: `SlotTest ${Date.now().toString().slice(-6)}`,
        }) as Routine;
        routineId = routine.id;
        console.log(`   -> Created routine: ${routineId}`);

        // 2. Add a Day
        console.log('2. Adding a day...');
        const day = await addDayToRoutineHandler({
            routineId,
            description: 'Slot Test Day',
        });
        console.log(`   -> Created day: ${day.id}`);

        // 3. Add Exercise (Creates Slot)
        console.log('3. Adding exercise (creating slot)...');
        // Using exercise 12 (Crunches) as standard
        const slotEntry = await addExerciseToRoutineHandler({
            routineId,
            exerciseId: 12,
            sets: 3,
            reps: 10,
            dayName: 'Slot Test Day'
        });
        console.log(`   -> Added slot entry: ${slotEntry.id} in slot: ${slotEntry.slot}`);

        // 4. Verify Slot Exists via Details
        console.log('4. Verifying slot exists...');
        let details = await getRoutineDetailsHandler({ routineId });
        let dDay = details.days.find(d => d.id === day.id);
        let dSlot = dDay?.slots.find(s => s.id === slotEntry.slot);

        if (!dSlot) {
            throw new Error('Slot NOT found after creation!');
        }
        console.log('   -> Slot found.');

        // 5. Delete Slot
        console.log(`5. Deleting slot ${slotEntry.slot}...`);
        await deleteSlotHandler({ slotId: slotEntry.slot });
        console.log('   -> Slot deleted.');

        // 6. Verify Slot is Gone
        console.log('6. Verifying slot is gone...');
        details = await getRoutineDetailsHandler({ routineId });
        dDay = details.days.find(d => d.id === day.id);
        dSlot = dDay?.slots.find(s => s.id === slotEntry.slot);

        if (dSlot) {
            throw new Error('Slot STILL found after deletion!');
        }
        console.log('   -> Slot successfully removed.');

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
