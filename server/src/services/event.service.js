import { Event } from '../models/Event.js';

export async function ingestEvents(events) {
  const eventList = Array.isArray(events) ? events : [events];
  if (eventList.length === 0) {
    return { insertedCount: 0, duplicateCount: 0 };
  }

  // Use bulkWrite with ordered: false to safely handle duplicates idempotently
  const operations = eventList.map((evt) => ({
    updateOne: {
      filter: { event_id: evt.event_id },
      update: { $setOnInsert: evt },
      upsert: true,
    },
  }));

  try {
    const result = await Event.bulkWrite(operations, { ordered: false });
    const insertedCount = result.upsertedCount || 0;
    const duplicateCount = eventList.length - insertedCount;

    return {
      insertedCount,
      duplicateCount,
      totalReceived: eventList.length,
    };
  } catch (error) {
    // If some events failed but others succeeded
    if (error.code === 11000 || error.writeErrors) {
      const inserted = error.result?.nUpserted || 0;
      return {
        insertedCount: inserted,
        duplicateCount: eventList.length - inserted,
        totalReceived: eventList.length,
      };
    }
    throw error;
  }
}
