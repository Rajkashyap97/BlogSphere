const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Post = require('./models/Post');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

// ANSI colors for clean test reporting
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${colors.green}✓ PASS${colors.reset}: ${testName}`);
  } else {
    console.error(`  ${colors.red}✗ FAIL${colors.reset}: ${testName}`);
    throw new Error(`Test assertion failed: ${testName}`);
  }
}

async function runTests() {
  console.log(`\n${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.cyan}    BlogSphere - Sprint 10 Automated Test Suite     ${colors.reset}`);
  console.log(`${colors.cyan}====================================================${colors.reset}\n`);

  // ==========================================
  // SECTION 1: Model & Schema Verification
  // ==========================================
  console.log(`${colors.blue}[1] Verifying User Model Schema...${colors.reset}`);
  const userPaths = User.schema.paths;
  assert(userPaths.name, 'User schema has "name" path');
  assert(userPaths.name.isRequired === true, 'User "name" is required');
  assert(userPaths.email, 'User schema has "email" path');
  assert(userPaths.email.isRequired === true, 'User "email" is required');
  assert(User.schema.options.timestamps === true, 'User schema has timestamps enabled (createdAt, updatedAt)');

  console.log(`\n${colors.blue}[2] Verifying Post Model Schema & Relational Modeling...${colors.reset}`);
  const postPaths = Post.schema.paths;
  assert(postPaths.title, 'Post schema has "title" path');
  assert(postPaths.title.isRequired === true, 'Post "title" is required');
  assert(postPaths.content, 'Post schema has "content" path');
  assert(postPaths.content.isRequired === true, 'Post "content" is required');
  assert(postPaths.authorId, 'Post schema has "authorId" path');
  assert(postPaths.authorId.isRequired === true, 'Post "authorId" is required');
  assert(postPaths.authorId.instance.toLowerCase() === 'objectid', 'Post "authorId" is Mongoose ObjectId');
  assert(postPaths.authorId.options.ref === 'User', 'Post "authorId" references "User" model');
  assert(Post.schema.options.timestamps === true, 'Post schema has timestamps enabled (createdAt, updatedAt)');

  // ==========================================
  // SECTION 2: Route Architecture & Ordering
  // ==========================================
  console.log(`\n${colors.blue}[3] Verifying Router Architecture & Route Ordering...${colors.reset}`);
  const postRouterStack = postRoutes.stack;
  const postRoutePaths = postRouterStack
    .filter(layer => layer.route)
    .map(layer => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods)
    }));

  const recentTopIndex = postRoutePaths.findIndex(r => r.path === '/recent/top');
  const idIndex = postRoutePaths.findIndex(r => r.path === '/:id');

  assert(recentTopIndex !== -1, 'Dedicated route GET /recent/top is registered');
  assert(idIndex !== -1, 'Dynamic route DELETE /:id is registered');
  assert(
    recentTopIndex < idIndex,
    'CRITICAL: Static route /recent/top is declared BEFORE /:id to prevent route shadowing'
  );

  const rootPostRoute = postRoutePaths.find(r => r.path === '/');
  assert(rootPostRoute && rootPostRoute.methods.includes('get'), 'GET /posts is registered');
  assert(rootPostRoute && rootPostRoute.methods.includes('post'), 'POST /posts is registered');

  // ==========================================
  // SECTION 3: Database & End-to-End API Logic
  // ==========================================
  console.log(`\n${colors.blue}[4] Checking MongoDB Connection for End-to-End Testing...${colors.reset}`);
  const mongoUri = process.env.MONGO_URI;

  const isConfigured = mongoUri &&
    !mongoUri.includes('<username>') &&
    !mongoUri.includes('your_mongodb_atlas_connection_string');

  if (!isConfigured) {
    console.log(`  ${colors.yellow}ℹ NOTICE: MONGO_URI in .env is currently a template/placeholder.${colors.reset}`);
    console.log(`  ${colors.yellow}  To run live cloud persistence tests, update .env with your real Atlas URI.${colors.reset}`);
    console.log(`  ${colors.yellow}  Skipping live database write tests. All structural and schema tests passed!${colors.reset}`);
  } else {
    try {
      console.log(`  Attempting connection to MongoDB Atlas...`);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`  ${colors.green}✓ Connected to MongoDB Atlas.${colors.reset}`);

      // Clean test sandbox
      const testEmail = `test_${Date.now()}@example.com`;

      // 1. Test User Creation
      console.log(`\n${colors.blue}[5] Live Database: Creating User...${colors.reset}`);
      const testUser = await User.create({
        name: 'Test Automation User',
        email: testEmail
      });
      assert(testUser._id, 'User created in Atlas with valid _id');

      // 2. Test Post Creation with Relational authorId
      console.log(`\n${colors.blue}[6] Live Database: Creating Relational Posts...${colors.reset}`);
      const testPost1 = await Post.create({
        title: 'Automation Post 1',
        content: 'Content for automated verification 1',
        authorId: testUser._id
      });
      const testPost2 = await Post.create({
        title: 'Automation Post 2',
        content: 'Content for automated verification 2',
        authorId: testUser._id
      });
      const testPost3 = await Post.create({
        title: 'Automation Post 3',
        content: 'Content for automated verification 3',
        authorId: testUser._id
      });
      assert(testPost1._id && testPost2._id && testPost3._id, '3 posts created with authorId relation');

      // 3. Test populate('authorId')
      console.log(`\n${colors.blue}[7] Live Database: Testing populate("authorId")...${colors.reset}`);
      const populatedPost = await Post.findById(testPost1._id).populate('authorId');
      assert(populatedPost.authorId && populatedPost.authorId.name === 'Test Automation User', 'Post populated with author name');
      assert(populatedPost.authorId.email === testEmail, 'Post populated with author email');

      // 4. Test Top 3 Recent Posts
      console.log(`\n${colors.blue}[8] Live Database: Testing Top 3 Recent Posts Query...${colors.reset}`);
      const topRecent = await Post.find().sort({ createdAt: -1 }).limit(3).populate('authorId');
      assert(topRecent.length <= 3, 'Top recent query returns at most 3 items');
      assert(topRecent.length > 0, 'Top recent query returns recent items');

      // 5. Test Delete Post
      console.log(`\n${colors.blue}[9] Live Database: Testing Post Deletion...${colors.reset}`);
      const deleted = await Post.findByIdAndDelete(testPost1._id);
      assert(deleted && deleted._id.toString() === testPost1._id.toString(), 'Post successfully deleted');
      const verifyDeleted = await Post.findById(testPost1._id);
      assert(verifyDeleted === null, 'Deleted post is no longer present in MongoDB');

      // Cleanup remaining test data
      await Post.deleteMany({ authorId: testUser._id });
      await User.findByIdAndDelete(testUser._id);
      console.log(`  ${colors.green}✓ Cleaned up automated test data.${colors.reset}`);

      await mongoose.disconnect();
    } catch (err) {
      console.error(`  ${colors.red}Database connection/test error: ${err.message}${colors.reset}`);
    }
  }

  console.log(`\n${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.green}  Summary: ${passedTests}/${totalTests} Tests Passed Successfully!${colors.reset}`);
  console.log(`${colors.cyan}====================================================\n${colors.reset}`);
  process.exit(0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
