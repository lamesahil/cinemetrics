# Product Requirements Document (PRD)

## CineMetrics Backend

### 1. Product Overview

**Product Name:** CineMetrics Backend  
**Version:** 1.0.0  
**Product Type:** Backend API for Movie Analytics & Tracking System  

CineMetrics Backend ek RESTful API service hai jo personal movie tracking aur data-driven analytics ke liye design ki gayi hai. Ye system users ko apni favorite movies add karne, unka watch status update karne, aur MongoDB Aggregation Pipelines ka use karke apne viewing patterns (jaise top genres aur average ratings) ko analyze karne ki power deta hai. Phase 2 mein ise ek full-fledged social network mein upgrade kiya jayega.

### 2. Target Users

- **Cinephiles (Phase 1):** Jo log apni dekhi hui movies ka record rakhna chahte hain aur apne personal movie taste ka deep data analysis dekhna chahte hain.
- **Social Users (Phase 2):** Jo apne doston ke viewing patterns dekhna, unhe follow karna aur movie reviews pe react karna chahte hain.

### 3. Core Features

#### 3.1 Movie Management (Phase 1)
- **Movie Creation:** Nayi movie add karna (Title, Genres, Rating, Release Year ke sath).
- **Movie Listing:** Database se saari movies ko fetch karna.
- **Status Update:** Kisi bhi movie ko 'Unwatched' se 'Watched' mark karna using unique ID.

#### 3.2 Analytics Engine (Phase 1)
- **Total Watched Count:** Database mein check karna ki exactly kitni movies dekhi ja chuki hain (ignoring unwatched).
- **Average Rating Calculator:** Sirf watched movies ki total average rating nikalna.
- **Top Genre Finder:** Array ko unwind karke sabse zyada dekha jaane wala movie genre dhoondhna.

#### 3.3 User Authentication & Social (Phase 2)
- **User Registration & Login:** JWT tokens aur bcrypt password hashing ke sath secure login.
- **Social Networking:** Users ko ek dusre ko follow karne ka feature.
- **Interactions:** Dusre users ke movie logs par likes aur replies dena.

### 4. Technical Architecture & Data Models

#### 4.1 API Endpoints (Phase 1)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/movies` | POST | Nayi movie database mein insert karna |
| `/api/movies` | GET | Saari movies ki list fetch karna |
| `/api/movies/:id` | PATCH | Kisi specific movie ka `isWatched` status update karna |
| `/api/movies/analytics` | GET | Aggregation pipelines se calculated analytics fetch karna |

#### 4.2 Data Models

**Movie Schema:**
- `title` (String, Required) - Movie ka naam
- `genre` (Array of Strings, Required) - Categories (e.g., ["Thriller", "Mystery"])
- `rating` (Number, Min:1, Max:5) - User rating
- `isWatched` (Boolean, Default: false) - Watch status
- `releaseYear` (Number) - Movie release ka saal
- `timestamps` - Automatically managed createdAt/updatedAt

**User Schema (Phase 2):**
- `name` (String)
- `email` (String, Unique)
- `password` (String, Hashed)
- `following` / `followers` (Array of ObjectIds)

### 5. Security & Validation Features

- Mongoose Schema-level input validation (Required fields, Min/Max limits).
- Express routing hierarchy correctly implemented to prevent endpoint collision (Analytics vs ID routes).
- CORS configuration taaki external frontends API ko securely access kar sakein.
- Environment variables (`.env`) ka use sensitive MongoDB URI aur Ports hide karne ke liye.
- **Phase 2:** JWT-based authentication aur bcrypt hashing.

### 6. Success Criteria

- Zero data leakage during MongoDB Aggregation operations.
- Seamless calculation of Top Genre even with multiple array values.
- Proper error handling (400, 404, 500 status codes) API requests ke time.
- Ready to be integrated with a Tailwind CSS + Vanilla JS frontend dashboard.
