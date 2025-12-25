# Meeting Room Booking API
 REST API for meeting room booking platform developed as part of Radio.Cloud Backend Developer Take Home Test 2025.

Built with **Node.js**, **TypeScript**, **Express**, **Prisma**, and **PostgreSQL**.

## 🚀 Features

- **Authentication**: Secure JWT authentication with bcrypt password hashing.
- **Room Management**: Admin-only CRUD operations for meeting rooms.
- **Booking System**: Users can book rooms with real-time conflict detection.
- **Conflict Detection**: Robust algorithm handling exact overlaps, partial overlaps, and containment scenarios.
- **Availability Checking**: Check room status for specific dates.
- **API Documentation**: Integrated Swagger documentation.
- **Type Safety**: Full TypeScript support with Zod validation.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT (jsonwebtoken)
- **Testing**: Jest + Supertest
- **Documentation**: Swagger UI

## 📋 Prerequisites

- Node.js (v18+)
- PostgreSQL
- npm or yarn

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/hairuljr/meeting-room-booking-api.git
   cd meeting-room-booking-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Copy `.env.example` to `.env` and update database credentials:
   ```bash
   cp .env.example .env
   ```
   
   Example `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/meeting_room_booking?schema=public"
   JWT_SECRET="the-secure-secret"
   JWT_EXPIRES_IN="24h"
  
   PORT=3000
   NODE_ENV="development"
   
   API_PREFIX="/api/v1"
   ```

4. **Setup Database**
   Run migrations and seed data:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## 🧪 Running Tests

Run the comprehensive test suite covering unit and integration tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📬 Postman Collection
Postman collection is available at:
/docs/Meeting Room Booking API.postman_collection.json

## 📚 API Documentation

Once the server is running, access the full API documentation at:
**http://localhost:3000/api-docs**

### Key Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/login` | Login user | Public |
| GET | `/api/v1/rooms` | List all rooms | Public |
| POST | `/api/v1/rooms` | Create room | Admin |
| POST | `/api/v1/bookings` | Book a room | User |
| GET | `/api/v1/bookings/my` | Get my bookings | User |

## 🧪 Test Credentials

**Admin User:**
- Email: `admin@radio.cloud`
- Password: `Admin123!`

**Regular User:**
- Email: `user@radio.cloud`
- Password: `User123!`

## 🏗 Architecture

This project follows a **Layered Architecture** pattern:
1. **Controllers**: Handle HTTP request/response.
2. **Services**: Contain business logic and validation.
3. **Repositories**: Handle database interactions (abstracted via Prisma).

**Conflict Detection Logic:**
The booking system uses a robust algorithm to prevent double bookings. Two bookings conflict if:
`(NewStart < ExistingEnd) AND (NewEnd > ExistingStart)`

## 📝 License

ISC
