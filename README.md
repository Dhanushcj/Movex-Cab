# MoveX Cab Booking Platform

This repository contains the complete source code for the MoveX Cab Booking Platform, split into a Node.js/Express backend and an Expo/React Native frontend.

## Project Structure
- `/backend` - The Node.js, Express, and MongoDB backend server (REST API + Socket.io)
- `/customer-app` - The unified Expo React Native mobile application for both Customers and Drivers.

---

## 1. Backend Setup

The backend handles the core API, WebSocket connections for real-time tracking, and MongoDB database interactions.

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas URI)
- Redis Server (Required for caching and rate-limiting)

### Installation Steps

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   **Core Packages Installed:**
   - `express`, `mongoose`, `socket.io`, `jsonwebtoken`, `bcryptjs`, `firebase-admin`, `redis`, `@aws-sdk/client-s3`

3. **Environment Configuration:**
   Create a `.env` file in the `backend` folder and populate it:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   REDIS_URL=redis://localhost:6379
   COMMISSION_RATE=0.20
   TAX_RATE=0.05
   DRIVER_SEARCH_RADIUS_KM=10
   ```
   *(Note: Make sure to also add your AWS S3 and Firebase credentials to the `.env` if using those services for uploads and push notifications).*

4. **Run the server:**
   ```bash
   # Development mode (auto-reloads on file changes)
   npm run dev

   # Production mode
   npm start
   ```
   The backend will run on `http://localhost:5000`.

---

## 2. Mobile App Setup (Frontend)

The frontend is a unified Expo app. Depending on the login credentials, the app dynamically switches between the Customer interface and the Driver interface.

### Prerequisites
- Node.js (v18+)
- Expo CLI (`npm install -g eas-cli`)
- Android Studio / Android Emulator (for local testing) or the Expo Go app on your physical device.

### Installation Steps

1. **Navigate to the app directory:**
   ```bash
   cd customer-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   **Core Packages Installed:**
   - `expo`, `react-native`, `@react-navigation/native`, `axios`, `socket.io-client`, `zustand`, `react-native-maps`, `@react-native-firebase/app`

3. **Configure the API Endpoint:**
   Open `customer-app/src/services/api.ts` and set the `baseURL` to point to your backend.
   - For local development with Expo Go, use your computer's local Wi-Fi IP address (e.g., `http://192.168.1.X:5000/api`).
   - For production, use your hosted URL (e.g., `https://your-backend.onrender.com/api`).

4. **Run the App Locally:**
   ```bash
   # Start the Expo bundler
   npx expo start
   ```
   - Press `a` in the terminal to open the app on an Android Emulator.
   - Or, scan the QR code using the **Expo Go** app on your physical Android device.

### Building the APK for Android
If you want to build a standalone APK (required for testing background location and Firebase Push Notifications):

1. **Login to EAS:**
   ```bash
   eas login
   ```
2. **Trigger the build:**
   ```bash
   eas build -p android --profile preview
   ```
3. Once the build finishes, download the provided `.apk` link and install it on your Android device.

---

## Technical Highlights
- **Real-time Engine:** Uses Socket.io to sync driver locations, dispatch ride requests, and track trip progress live.
- **Dynamic Fares:** Custom Fare Engine handles base fares, per/km billing, per/minute billing, and surge multipliers.
- **Unified App:** A single codebase handles both the Customer and Driver experiences, toggled seamlessly via JWT roles.
