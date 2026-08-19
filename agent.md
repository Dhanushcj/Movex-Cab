# Movex-Cab Complete Workflow & Rules

<!-- This file acts as the source of truth for the application's flow and architecture. Future AI modifications must strictly adhere to these rules and avoid reverting established flows. -->

## 1. Authentication Flow
- **Customers & Drivers**: Mobile app authentication is strictly **OTP-based verification** (reverted from QR Pass verification). Do not implement QR Code verification unless explicitly requested.
- **Admin**: Admins log in through the Web Dashboard (admin-dashboard). The option for admin login is hidden/removed from the mobile customer app login screen.

## 2. Admin Dashboard & Route Management
- **Predefined Routes**: Admins create predefined routes consisting of multiple stops/junctions via the dashboard. 
- **Driver Assignment**: Admins can assign specific routes and `employeeId`s to drivers.
- **Live Tracking**: The dashboard live map displays the actual route polylines and real-time vehicle icons.

## 3. Customer Booking Flow (Mobile App)
- **Mandatory Ride Booking Flow**: When a user selects "Book Ride" (or Schedule Ride), the UI **MUST** display predefined routes for the user to choose their pickup and drop locations.
- **Prohibited Flow**: DO NOT revert to the previous free-form text search or open map-pinning flow for booking a ride. Users must strictly select from the predefined route stops. This is essential to ensure precise route matching with drivers.
- **Payment**: Rides do not require in-app payment (the payment UI is intentionally removed/bypassed, and rides are marked free).

## 4. Driver Flow (Mobile App)
- **Active Route Fetching**: The driver's home screen fetches and renders their assigned active route (with a polyline) directly on the map.
- **Ride Matching**: Drivers are matched with customers based on strict route matching. Drivers will only receive ride requests for the specific route they are assigned to.
- **Driver Status**: Includes proper visual status text, accepting/canceling ride dispatches, and an explicit "cancel ride" option for arrived/accepted states.
- **Ride Completion**: After arriving, drivers verify the customer using OTP verification.

## 5. System & Backend Constraints
- **Socket Connections**: Drivers do not strictly need a persistent active socket connection to be matched; the backend handles fallbacks correctly. Active dispatches are cleared when a ride is accepted or canceled to prevent phantom popup requests upon reconnecting.
- **Vehicle Selection**: Customers can see and select available vehicle types for their route.
