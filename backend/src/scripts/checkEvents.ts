import mongoose from 'mongoose';
import Event from '../models/Event.js';
import { connectDB } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkEvents() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get all events
    const allEvents = await Event.find({}).lean();
    console.log(`\n📊 Total events in database: ${allEvents.length}`);

    if (allEvents.length > 0) {
      console.log('\n📋 All events:');
      allEvents.forEach((event, index) => {
        console.log(`\n${index + 1}. ${event.title}`);
        console.log(`   - Status: ${event.status}`);
        console.log(`   - Date: ${event.date}`);
        console.log(`   - Category: ${event.category}`);
        console.log(`   - City: ${event.location?.city}`);
        console.log(`   - Organizer: ${event.organizationName}`);
        console.log(`   - ID: ${event._id}`);
      });

      // Check published future events (what the API should return)
      const now = new Date();
      const publishedFutureEvents = await Event.find({
        status: 'published',
        date: { $gte: now }
      }).lean();

      console.log(`\n🔍 Published future events (API filter): ${publishedFutureEvents.length}`);
      console.log(`Current time: ${now}`);

      publishedFutureEvents.forEach((event, index) => {
        console.log(`\n${index + 1}. ${event.title}`);
        console.log(`   - Date: ${event.date} (${event.date >= now ? 'FUTURE' : 'PAST'})`);
        console.log(`   - Status: ${event.status}`);
      });

      // Check events by status
      const statusCounts = await Event.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      console.log('\n📈 Events by status:');
      statusCounts.forEach(stat => {
        console.log(`   - ${stat._id}: ${stat.count}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking events:', error);
    process.exit(1);
  }
}

checkEvents();
