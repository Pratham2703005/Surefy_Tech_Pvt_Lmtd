# Event Management REST API

A production-ready Event Management REST API built with Node.js, Express, and PostgreSQL using Prisma ORM.


## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM for database operations
- **express-validator** - Input validation
- **dotenv** - Environment variable management

## Database Schema

```
┌──────────────┐         ┌─────────────────┐         ┌──────────────┐
│    User      │         │  Registration   │         │    Event     │
├──────────────┤         ├─────────────────┤         ├──────────────┤
│ id (UUID)    │────────<│ userId (UUID)   │>────────│ id (UUID)    │
│ name         │         │ eventId (UUID)  │         │ title        │
│ email (uniq) │         │ registeredAt    │         │ dateTime     │
│ createdAt    │         │                 │         │ location     │
└──────────────┘         └─────────────────┘         │ capacity     │
                                                      │ createdAt    │
                                                      └──────────────┘
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example env file
   copy .env.example .env
   
   # Edit .env and update with your PostgreSQL credentials
   # DATABASE_URL="postgresql://username:password@localhost:5432/event_management?schema=public"
   ```

4. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```
   Or push the schema directly:
   ```bash
   npm run db:push
   ```

5. **Start the server:**
   ```bash
   # Production
   npm start
   
   # Development (with auto-reload)
   npm run dev
   ```

6. **Access the API:**
   - API: http://localhost:3000/api
   - Health Check: http://localhost:3000/health

## API Endpoints

### 1. Create Event
**POST** `/api/events`

Create a new event with capacity validation.

**Request Body:**
```json
{
  "title": "Tech Conference 2025",
  "dateTime": "2025-12-15T10:00:00.000Z",
  "location": "San Francisco Convention Center",
  "capacity": 500
}
```

**Response (201):**
```json
{
  "message": "Event created successfully",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Tech Conference 2025",
    "dateTime": "2025-12-15T10:00:00.000Z",
    "location": "San Francisco Convention Center",
    "capacity": 500,
    "createdAt": "2025-10-15T08:30:00.000Z"
  }
}
```

**Validation:**
- Title: 3-200 characters
- DateTime: Valid ISO 8601 string
- Location: 3-200 characters
- Capacity: 1-1000 (enforced)

---

### 2. Get Event Details
**GET** `/api/events/:id`

Get event details with list of registered users.

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Tech Conference 2025",
  "dateTime": "2025-12-15T10:00:00.000Z",
  "location": "San Francisco Convention Center",
  "capacity": 500,
  "totalRegistrations": 2,
  "registeredUsers": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ]
}
```

---

### 3. Register User for Event
**POST** `/api/events/:id/register`

Register a user for an event. Can either use existing userId or create new user.

**Option 1: Register with existing user**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Option 2: Register with new user**
```json
{
  "userName": "John Doe",
  "userEmail": "john@example.com"
}
```

**Response (201):**
```json
{
  "message": "Successfully registered for event",
  "registration": {
    "id": "reg-uuid-here",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "registeredAt": "2025-10-15T08:45:00.000Z",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "event": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Tech Conference 2025",
      "dateTime": "2025-12-15T10:00:00.000Z",
      "location": "San Francisco Convention Center"
    }
  }
}
```

**Error Cases:**
- **400**: Duplicate registration
- **400**: Event is at full capacity
- **400**: Cannot register for past events
- **404**: Event not found / User not found

---

### 4. Cancel Registration
**DELETE** `/api/events/:id/register/:userId`

Cancel a user's registration for an event.

**Response (200):**
```json
{
  "message": "Registration cancelled successfully"
}
```

**Error Cases:**
- **404**: Registration not found (user not registered)
- **404**: Event not found
- **404**: User not found

---

### 5. Get Upcoming Events
**GET** `/api/events/upcoming`

List all future events, sorted by date (ascending) then location (alphabetically).

**Response (200):**
```json
{
  "count": 2,
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Tech Conference 2025",
      "dateTime": "2025-12-15T10:00:00.000Z",
      "location": "San Francisco Convention Center",
      "capacity": 500,
      "registrations": 150,
      "availableSpots": 350
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Workshop on AI",
      "dateTime": "2025-12-20T14:00:00.000Z",
      "location": "Austin Tech Hub",
      "capacity": 100,
      "registrations": 100,
      "availableSpots": 0
    }
  ]
}
```

---

### 6. Get Event Statistics
**GET** `/api/events/:id/stats`

Get registration statistics for an event.

**Response (200):**
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "eventTitle": "Tech Conference 2025",
  "capacity": 500,
  "totalRegistrations": 350,
  "remainingCapacity": 150,
  "percentageUsed": 70.00,
  "isFull": false
}
```

---

## Business Logic & Validations

### Event Creation
- ✅ Capacity must be between 1 and 1000
- ✅ Title: 3-200 characters
- ✅ DateTime must be valid ISO 8601 format
- ✅ Location: 3-200 characters

### User Registration
- ✅ **No duplicate registrations** - Same user cannot register twice
- ✅ **Capacity enforcement** - Prevents registration when event is full
- ✅ **Past event prevention** - Cannot register for events that have already occurred
- ✅ **User creation** - Automatically creates user if doesn't exist (by email)
- ✅ **Email uniqueness** - Each email can only have one user account

### Registration Cancellation
- ✅ Returns error if user is not registered for the event
- ✅ Validates event and user existence

## HTTP Status Codes

- `200` - Success (GET, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors, business logic violations)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Development Tools

### Prisma Studio
Open a visual database editor:
```bash
npm run db:studio
```

### Database Management
```bash
# Create new migration
npm run db:migrate

# Push schema changes
npm run db:push

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## Project Structure

```
src/
├── models/           # Database models (User, Event, Registration)
│   ├── User.js
│   ├── Event.js
│   └── Registration.js
├── routes/           # API route definitions
│   └── eventRoutes.js
├── controllers/      # Request handlers and business logic
│   └── eventController.js
├── db/               # Database configuration
│   └── prisma.js
└── index.js          # Application entry point

prisma/
└── schema.prisma     # Database schema definition
```

## Error Handling

All endpoints include comprehensive error handling with:
- Meaningful error messages
- Appropriate HTTP status codes
- Detailed validation errors
- Development-mode stack traces
- Database constraint handling

## Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/event_management?schema=public"
PORT=3000
NODE_ENV=development
```

## Testing the API

You can test the API using tools like:
- **Postman** - Import endpoints and test
- **cURL** - Command-line testing
- **Thunder Client** - VS Code extension
- **REST Client** - VS Code extension

### Example cURL Commands

```bash
# Create an event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference 2025",
    "dateTime": "2025-12-15T10:00:00.000Z",
    "location": "San Francisco",
    "capacity": 500
  }'

# Get upcoming events
curl http://localhost:3000/api/events/upcoming

# Register for event
curl -X POST http://localhost:3000/api/events/{eventId}/register \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "John Doe",
    "userEmail": "john@example.com"
  }'
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production PostgreSQL database
3. Enable SSL for database connections
4. Use environment variables for sensitive data
5. Implement rate limiting
6. Add authentication/authorization
7. Set up logging and monitoring
8. Use a process manager (PM2, systemd)

## License

ISC

## Author

Your Name

---

**Built with ❤️ using Node.js, Express, and PostgreSQL**
#   S u r e f y _ T e c h _ P v t _ L m t d  
 