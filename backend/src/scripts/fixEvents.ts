import mongoose from 'mongoose';
import Event from '../models/Event.js';
import { connectDB } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixEvents() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Update all events to have future dates and published status
    const eventsToUpdate = await Event.find({});
    
    console.log(`Found ${eventsToUpdate.length} events to update`);

    for (let i = 0; i < eventsToUpdate.length; i++) {
      const event = eventsToUpdate[i];
      
      // Set future dates (starting from tomorrow)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i + 1); // Tomorrow, day after, etc.
      
      // Update the event
      await Event.findByIdAndUpdate(event._id, {
        status: 'published',
        date: futureDate,
        title: event.title === 's' ? 'Community Health Camp' : event.title,
        description: event.title === 's' ? 'Free health checkup and medical consultation for the community' : event.description
      });

      console.log(`✅ Updated event: ${event.title} -> Date: ${futureDate.toDateString()}, Status: published`);
    }

    // Verify the updates
    const publishedFutureEvents = await Event.find({
      status: 'published',
      date: { $gte: new Date() }
    }).lean();

    console.log(`\n🎉 Published future events now: ${publishedFutureEvents.length}`);
    
    publishedFutureEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} - ${new Date(event.date).toDateString()}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error fixing events:', error);
    process.exit(1);
  }
}

fixEvents();
