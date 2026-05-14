# Loading Dock Bookings Web App

A modern, mobile-friendly booking portal for commercial building loading docks and service elevators.

## Features
- Role-based experience for Tenant, Security, Property Management, and Operations.
- Tenant request flow with required booking fields and attachments.
- Delivery policy controls for designated routes, prearranged after-hours access, heavy article declarations, and policy acknowledgment.
- Approval workflow for Security and Property Management (approve, deny, propose new time).
- Shared operations calendar and activity log.
- Resource and notification settings overview with landlord operating rules.
- Resource-aware scheduling for three docks (LD1, LD2, LD3 with dock leveler) and one shared service elevator, including overlap prevention per resource.

## Run locally
1. `cd /workspace/loading-dock-bookings`
2. `python3 -m http.server 8080`
3. Visit `http://localhost:8080`
