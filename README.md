# Loading Dock Bookings Web App

Booking portal for LD1, LD2, LD3, and the shared Service Elevator with role-based workflows.

## What was added
- Backend server (`server.js`) using Node HTTP APIs.
- API endpoints for bootstrap data, bookings, booking updates, and rule updates.
- Centralized backend-managed resources and rules (including 15-minute conflict buffer and service-elevator defaults).
- Frontend now loads/saves bookings through the backend APIs.

## Run locally
1. `cd /workspace/loading-dock-bookings`
2. `npm start`
3. Open `http://localhost:8080`

## API
- `GET /api/bootstrap`
- `POST /api/bookings`
- `PATCH /api/bookings/:id`
- `PATCH /api/rules`
