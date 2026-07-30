<h1 align="center">
  <br>
  🚕 MoveX Cab Booking Platform
  <br>
</h1>

<h4 align="center">A fully featured, real-time Cab Booking Platform built with React Native (Expo) and Node.js.</h4>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture--tech-stack">Tech Stack</a> •
  <a href="#installation--setup">Installation</a> •
  <a href="#mobile-app-frontend">Frontend Setup</a> •
  <a href="#backend-api--sockets">Backend Setup</a>
</p>

---

## 🌟 Overview
MoveX is a comprehensive, production-ready ride-hailing solution. Instead of maintaining two separate apps, **MoveX uses a unified codebase** that seamlessly switches between a **Customer Interface** and a **Driver Interface** based on the authenticated user's role. 

The platform supports live tracking, real-time fare negotiation, dynamic surge pricing, and background location updates.

## ✨ Features
* **Unified Application:** One Expo React Native app for both Riders and Drivers.
* **Real-time Live Tracking:** Socket.io integration for instant ride requests, location tracking, and status updates.
* **Fare Engine & Negotiations:** Supports dynamic pricing based on distance/time, surge multipliers, and a feature for drivers/riders to negotiate fares in real-time.
* **Subscription Models:** Drivers can operate on a standard commission model, or purchase a Daily/Monthly pass to keep 100% of their fares.
* **Document Verification:** Secure document uploads (Aadhaar, Driving License, RC, etc.) to AWS S3.
* **Multi-Vehicle Support:** Bike, Auto, Mini, Sedan, and SUV variants.

---

## 🛠 Architecture & Tech Stack

**Frontend (Mobile App)**
* [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/)
* [Zustand](https://github.com/pmndrs/zustand) (State Management)
* [React Navigation](https://reactnavigation.org/) (Routing)
* [Expo Location & Maps](https://docs.expo.dev/versions/latest/sdk/location/)
* [Firebase Cloud Messaging (FCM)](https://rnfirebase.io/) (Push Notifications)

**Backend (API & WebSockets)**
* [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* [MongoDB](https://www.mongodb.com/) & Mongoose (Database)
* [Socket.io](https://socket.io/) (Real-time Engine)
* [Redis](https://redis.io/) (Caching & Rate Limiting)
* [AWS S3](https://aws.amazon.com/s3/) (Media Storage)

---

## 🚀 Installation & Setup

Clone the repository to your local machine:
```bash
git clone https://github.com/Dhanushcj/Movex-Cab.git
cd Movex-Cab
```

---

## 📱 Mobile App (Frontend)

The frontend is located in the `customer-app` folder. 

### Prerequisites
- Node.js (v18+)
- [Expo CLI](https://docs.expo.dev/more/expo-cli/) (`npm install -g eas-cli`)

### Quickstart
1. Navigate to the app directory:
   ```bash
   cd customer-app
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. **Configure API Endpoint:** Open `src/services/api.ts` and set your `baseURL`:
   ```typescript
   // Local Development
   baseURL: 'http://<YOUR_LOCAL_IP>:5000/api' 
   ```
4. Start the Expo bundler:
   ```bash
   npx expo start
   ```

### Building for Android (APK)
To test background location and Firebase notifications, you must build a standalone APK:
```bash
eas login
eas build -p android --profile preview
```

---

## ⚙️ Backend API & Sockets

The backend is located in the `backend` folder.

### Prerequisites
- Node.js (v18+)
- MongoDB Instance (Local or Atlas)
- Redis Server

### Quickstart
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Create a `.env` file at the root of the `backend` folder:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/movex
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   REDIS_URL=redis://localhost:6379
   COMMISSION_RATE=0.20
   TAX_RATE=0.05
   DRIVER_SEARCH_RADIUS_KM=10
   
   # Optional: AWS & Firebase for full functionality
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_REGION=
   AWS_BUCKET_NAME=
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

---
<div align="center">
  <i>Built for scale. Designed for speed.</i>
</div>
