# AI Assistance Log

This document records the AI prompts, engineering thought processes, architectural decisions, and troubleshooting steps employed during the development of **Sprint 10: The Data Storm (Track B: Fullstack Developer)** for BlogSphere.

---

## Prompt 1
**Purpose:**
Connecting Express to MongoDB Atlas securely using Mongoose and environment variables.

**Prompt:**
> "How do I securely configure a Mongoose connection to MongoDB Atlas in an Express.js backend so that errors cause the application to log clear diagnostics and exit immediately instead of hanging or silently failing?"

**Result:**
Implemented `backend/config/db.js` using `mongoose.connect(process.env.MONGO_URI)`. Enforced strict environment variable validation to detect missing or placeholder configuration strings, ensuring the server logs the connected host upon success or invokes `process.exit(1)` upon connection failures.

---

## Prompt 2
**Purpose:**
Relational modeling between Posts and Users using Mongoose Schemas.

**Prompt:**
> "In Mongoose, how should I define a Post schema that references a User model by its ObjectId as authorId, and ensure that createdAt/updatedAt timestamps and required field validations are enforced?"

**Result:**
Created `models/Post.js` with:
```javascript
authorId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: [true, "Please provide an author ID"]
}
```
Enabled `{ timestamps: true }` on both `User` and `Post` schemas, providing automatic tracking of creation and modification dates.

---

## Prompt 3
**Purpose:**
Transitioning from volatile mock arrays to persistent MongoDB CRUD operations.

**Prompt:**
> "How do I replace in-memory arrays like `let posts = []` with Mongoose `Post.create()`, `Post.find()`, and `Post.findByIdAndDelete()`, while handling invalid ObjectId formats cleanly?"

**Result:**
Replaced all volatile storage with asynchronous controller methods in `postController.js`. Added `mongoose.Types.ObjectId.isValid(id)` checks before invoking database methods to prevent unhandled CastErrors and return immediate `400 Bad Request` responses for malformed IDs.

---

## Prompt 4
**Purpose:**
Understanding and implementing Mongoose `populate()`.

**Prompt:**
> "How does `populate('authorId')` work in Mongoose when querying posts, and how do I select only specific author fields like name and email while hiding sensitive internal fields?"

**Result:**
In `getPosts`, `createPost`, and `getTopRecentPosts`, chained `.populate('authorId', 'name email')`. This replaces the raw `ObjectId` in the JSON response with the associated user's profile document (`{ _id, name, email }`), fulfilling the Phase 12 relational integration requirement.

---

## Prompt 5
**Purpose:**
Implementing the Top 3 Most Recent Posts with database-level querying.

**Prompt:**
> "How should the Express route and Mongoose query be structured to fetch the top 3 most recent posts directly from the database without retrieving all documents into memory?"

**Result:**
Built the dedicated endpoint `GET /posts/recent/top` using:
```javascript
Post.find()
  .sort({ createdAt: -1 })
  .limit(3)
  .populate('authorId', 'name email');
```
Critically, organized route registration in `postRoutes.js` so that `/recent/top` is declared before `/:id`, preventing Express from incorrectly matching `"recent"` as a post ID parameter.

---

## Prompt 6
**Purpose:**
Centralized error handling and status code mapping.

**Prompt:**
> "What is the best way to write an Express error-handling middleware that intercepts Mongoose ValidationError, CastError, and duplicate key (code 11000) errors and returns structured JSON responses?"

**Result:**
Created `backend/middleware/errorHandler.js` that inspects error types:
- `CastError` &rarr; `400 Bad Request` ("Invalid ID format")
- `ValidationError` &rarr; `400 Bad Request` (concatenated field errors)
- `code 11000` &rarr; `409 Conflict` ("Duplicate field value entered")
- Not found resources &rarr; `404 Not Found`
- Uncaught exceptions &rarr; `500 Internal Server Error`

---

## Prompt 7
**Purpose:**
Frontend integration, loading states, and resilient UI error handling.

**Prompt:**
> "How can I integrate an Express API with a vanilla JavaScript frontend to display populated post cards, provide author selection from a `/users` endpoint, and display user-friendly loading and error banners if the server is offline?"

**Result:**
Developed `frontend/js/app.js` with:
- Asynchronous `fetch` calls for all CRUD operations.
- Dynamic population of author dropdown menus from `/users`.
- Skeleton/spinner loaders during network requests.
- Offline banner with a "Retry Connection" button that gracefully handles server downtime without breaking the DOM.

---

## Prompt 8
**Purpose:**
Automated testing and Postman collection creation.

**Prompt:**
> "How do I build an automated verification script in Node.js to assert schema requirements, route ordering, and CRUD operations, and export a Postman Collection v2.1 for QA?"

**Result:**
- Created `backend/test.js` which verifies User/Post schema paths, required constraints, ObjectId reference types, and router registration order.
- Authored `BlogSphere - Sprint 10.postman_collection.json` with pre-request scripts and test assertions for all 6 required endpoints plus negative QA scenarios.

