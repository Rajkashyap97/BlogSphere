# BlogSphere

## Sprint 10 - The Data Storm
### Track B: Fullstack Developer &bull; Phase 4: Advanced Integration

BlogSphere is a modern full-stack blogging platform. In Sprint 10, the application transitions from volatile, in-memory mock data arrays to persistent cloud storage using **MongoDB Atlas**, **Mongoose ODM**, **Express.js**, and relational document modeling with `populate()`.

---

## Features

- **MongoDB Atlas Cloud Persistence**: Full migration from in-memory arrays to cloud-hosted MongoDB Atlas.
- **Mongoose ODM Integration**: Strictly typed schemas with built-in validation, timestamps, and trimming.
- **User Schema & CRUD**: Management of blog authors (`name`, `email`, unique constraints).
- **Post Schema & CRUD**: Creation, retrieval, and deletion of blog posts (`title`, `content`, `authorId`, timestamps).
- **Relational Document Modeling**: Posts link directly to User documents via `authorId` (`mongoose.Schema.Types.ObjectId`, `ref: 'User'`).
- **Data Population (`populate()`)**: Queries populate relational author data (`name`, `email`) into the post payload.
- **Dedicated Top 3 Recent Posts**: Efficient database-level sorting and limiting (`.sort({ createdAt: -1 }).limit(3).populate('authorId')`).
- **Decoupled Architecture**: Clean MVC organization separating models, controllers, routes, and middleware.
- **Centralized Error Handling**: Standardized error responses with appropriate HTTP status codes (`400`, `404`, `409`, `500`).
- **Interactive Responsive Frontend**: Clean UI with live status indicator, post creation modal, author assignment, delete confirmations, and loading/error states.
- **Postman QA Testing**: Full Postman Collection v2.1 export for end-to-end API verification.

---

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Server Framework**: Express.js
- **Database**: MongoDB Atlas (M0 Free Tier)
- **Object Data Modeling (ODM)**: Mongoose (v8+)
- **Configuration & Security**: dotenv, CORS
- **Client Frontend**: Modern HTML5, Responsive CSS3, Modular JavaScript (ES6+)
- **QA & Testing**: Postman Collection v2.1, Automated Node.js Test Suite

---

## Project Structure

```text
DataStorm/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection handler
│   ├── controllers/
│   │   ├── postController.js     # Post CRUD & Top 3 logic
│   │   └── userController.js     # User creation & retrieval logic
│   ├── middleware/
│   │   └── errorHandler.js       # Centralized API error handling
│   ├── models/
│   │   ├── Post.js               # Post schema with relational authorId
│   │   └── User.js               # User schema with unique email
│   ├── routes/
│   │   ├── postRoutes.js         # /posts routes (ordering protected)
│   │   └── userRoutes.js         # /users routes
│   ├── seed.js                   # Development seed script
│   ├── server.js                 # Express server entry point
│   └── test.js                   # Automated test suite
├── frontend/
│   ├── css/
│   │   └── style.css             # Responsive styling & design system
│   ├── js/
│   │   └── app.js                # Frontend API client & UI interactions
│   └── index.html                # Single-page interface
├── BlogSphere - Sprint 10.postman_collection.json # Ready-to-import Postman QA collection
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore file protecting .env & node_modules
├── package.json                  # Scripts and dependencies
├── Prompts.md                    # AI Assistance Log (internship requirement)
└── README.md                     # Project documentation
```

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/blogsphere.git
cd blogsphere
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory by copying `.env.example`:
```bash
cp .env.example .env
```

Open `.env` and configure your credentials:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
```

> **Security Note:** Never commit your `.env` file or hardcode credentials in source code. `.env` is listed in `.gitignore`.

### 4. (Optional) Seed the Database
To populate your MongoDB Atlas database with initial users and the 3 required test posts:
```bash
npm run seed
```

### 5. Run the Application
#### Development Mode (with Nodemon):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

The Express server will start on port `5000` and automatically serve both the REST API and the frontend interface at `http://localhost:5000`.

---

## API Endpoints

### User Endpoints

| Method | Endpoint | Description | Request Body | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/users` | Create a new user | `{ "name": "Raj Kumar", "email": "raj@example.com" }` | `201 Created` |
| `GET` | `/users` | Get all registered users | None | `200 OK` |

### Post Endpoints

| Method | Endpoint | Description | Request Body | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/posts` | Create a new post | `{ "title": "My Post", "content": "Post body", "authorId": "USER_ID" }` | `201 Created` |
| `GET` | `/posts` | Get all posts (populated author) | None | `200 OK` |
| `GET` | `/posts/recent/top` | Get top 3 most recent posts | None | `200 OK` |
| `DELETE`| `/posts/:id` | Delete a post by ID | None | `200 OK` |

### System & Health

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check | `200 OK` |

---

## API Request & Response Examples

### 1. Create a User (`POST /users`)
**Request:**
```http
POST /users HTTP/1.1
Content-Type: application/json

{
  "name": "Raj Kumar",
  "email": "raj@example.com"
}
```

**Response (`201 Created`):**
```json
{
  "_id": "664fa1e2b58d99c4a1120011",
  "name": "Raj Kumar",
  "email": "raj@example.com",
  "createdAt": "2026-09-25T03:30:00.000Z",
  "updatedAt": "2026-09-25T03:30:00.000Z",
  "__v": 0
}
```

---

### 2. Create a Post (`POST /posts`)
**Request:**
```http
POST /posts HTTP/1.1
Content-Type: application/json

{
  "title": "MongoDB Atlas Integration",
  "content": "This post is stored in MongoDB Atlas and references an author.",
  "authorId": "664fa1e2b58d99c4a1120011"
}
```

**Response (`201 Created`):**
```json
{
  "_id": "664fa2e5b58d99c4a1120022",
  "title": "MongoDB Atlas Integration",
  "content": "This post is stored in MongoDB Atlas and references an author.",
  "authorId": {
    "_id": "664fa1e2b58d99c4a1120011",
    "name": "Raj Kumar",
    "email": "raj@example.com"
  },
  "createdAt": "2026-09-25T03:31:00.000Z",
  "updatedAt": "2026-09-25T03:31:00.000Z",
  "__v": 0
}
```

---

### 3. Get All Posts with Author Population (`GET /posts`)
**Response (`200 OK`):**
```json
[
  {
    "_id": "664fa2e5b58d99c4a1120022",
    "title": "MongoDB Atlas Integration",
    "content": "This post is stored in MongoDB Atlas and references an author.",
    "authorId": {
      "_id": "664fa1e2b58d99c4a1120011",
      "name": "Raj Kumar",
      "email": "raj@example.com"
    },
    "createdAt": "2026-09-25T03:31:00.000Z",
    "updatedAt": "2026-09-25T03:31:00.000Z"
  }
]
```

---

### 4. Get Top 3 Recent Posts (`GET /posts/recent/top`)
**Response (`200 OK`):**
```json
[
  {
    "_id": "664fa2e5b58d99c4a1120025",
    "title": "Building REST APIs with Express",
    "content": "Express routing and middleware architecture.",
    "authorId": {
      "_id": "664fa1e2b58d99c4a1120011",
      "name": "Raj Kumar",
      "email": "raj@example.com"
    },
    "createdAt": "2026-09-25T03:35:00.000Z"
  }
]
```

---

### 5. Delete Post by ID (`DELETE /posts/:id`)
**Response (`200 OK`):**
```json
{
  "message": "Post deleted successfully",
  "id": "664fa2e5b58d99c4a1120022"
}
```

---

## Postman Testing Guide

1. Open Postman.
2. Click **Import** in the upper left corner.
3. Select the file: `BlogSphere - Sprint 10.postman_collection.json`.
4. Ensure your server is running (`npm run dev`).
5. Run the requests in order:
   - `POST /users` (stores user ID dynamically)
   - `GET /users`
   - `POST /posts` (uses created user ID)
   - `GET /posts` (verifies `populate("authorId")`)
   - `GET /posts/recent/top` (verifies top 3 limit and sorting)
   - `DELETE /posts/:id` (verifies deletion)
   - Error handling test cases (missing fields, invalid ObjectId, 404).

---

## Automated Verification Suite

Run the built-in test suite anytime:
```bash
npm test
```
This executes automated assertions verifying:
- User schema paths, required constraints, and timestamps.
- Post schema paths, required constraints, Mongoose `ObjectId` type, and `ref: 'User'` relation.
- Router architecture and static route ordering (`/recent/top` registered before `/:id`).
- Live database persistence and population verification (when valid Atlas URI is supplied).

