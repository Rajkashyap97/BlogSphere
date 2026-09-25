const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Post = require('./models/Post');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    console.log('[BlogSphere Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[BlogSphere Seed] Connected to MongoDB.');

    // Clear existing data (optional / safe reset for seed)
    console.log('[BlogSphere Seed] Clearing existing test posts and users...');
    await Post.deleteMany({});
    await User.deleteMany({});

    // 1. Create Test Users
    console.log('[BlogSphere Seed] Creating seed users...');
    const user1 = await User.create({
      name: 'Raj Kumar',
      email: 'raj@example.com'
    });

    const user2 = await User.create({
      name: 'Jane Developer',
      email: 'jane@example.com'
    });

    console.log(`[BlogSphere Seed] Users created: ${user1.name} (${user1._id}), ${user2.name} (${user2._id})`);

    // 2. Create at least 3 test posts with required example titles
    console.log('[BlogSphere Seed] Creating seed posts...');
    const post1 = await Post.create({
      title: 'Introduction to Full Stack Development',
      content: 'Full Stack Development bridges the client interface with server systems and persistent databases. In this sprint, we explore modern decoupled architecture.',
      authorId: user1._id
    });

    // Slight delay to ensure distinct createdAt timestamps
    await new Promise(r => setTimeout(r, 100));

    const post2 = await Post.create({
      title: 'MongoDB Atlas Integration',
      content: 'Migrating from volatile in-memory collections to cloud-hosted MongoDB Atlas ensures zero data loss, geo-redundancy, and production scalability.',
      authorId: user2._id
    });

    await new Promise(r => setTimeout(r, 100));

    const post3 = await Post.create({
      title: 'Building REST APIs with Express',
      content: 'Express.js provides a minimalist and flexible Node.js web application framework with robust routing, controller separation, and middleware chaining.',
      authorId: user1._id
    });

    console.log('[BlogSphere Seed] Seed posts created:');
    console.log(`  1. "${post1.title}" (ID: ${post1._id})`);
    console.log(`  2. "${post2.title}" (ID: ${post2._id})`);
    console.log(`  3. "${post3.title}" (ID: ${post3._id})`);

    console.log('[BlogSphere Seed] Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[BlogSphere Seed] Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();

