import re
import os

controller_path = r"g:\Dhanush\New folder\Movex-Cab\backend\src\controllers\bookingController.js"

with open(controller_path, "r", encoding="utf-8") as f:
    content = f.read()

# Helper to inject socket logic after a specific line
def inject_after(content, search_text, insert_text):
    idx = content.find(search_text)
    if idx == -1: return content
    insert_idx = idx + len(search_text)
    return content[:insert_idx] + insert_text + content[insert_idx:]

# 1. acceptBooking
accept_search = "driver.totalRides += 1;\n    await driver.save();"
accept_inject = """

    // --- SOCKET INJECTION ---
    const { getIO, getActiveRides } = require('../config/socket');
    const io = getIO();
    if (io) {
      getActiveRides().set(booking._id.toString(), { driverId: driver._id.toString(), status: 'accepted' });
      io.to(`ride:${booking._id}`).emit('ride:accepted', {
        bookingId: booking._id,
        driverInfo: driver,
        booking,
        timestamp: Date.now()
      });
    }
    // ------------------------
"""
content = inject_after(content, accept_search, accept_inject)

# 2. driverArrived
arrived_search = "booking.arrivedAt = new Date();\n    await booking.save();"
arrived_inject = """

    // --- SOCKET INJECTION ---
    const { getIO, getActiveRides } = require('../config/socket');
    const io = getIO();
    if (io) {
      const activeRides = getActiveRides();
      const ride = activeRides.get(booking._id.toString());
      if (ride) {
        ride.status = 'arrived';
        activeRides.set(booking._id.toString(), ride);
      }
      io.to(`ride:${booking._id}`).emit('booking:status', { status: 'arrived' });
    }
    // ------------------------
"""
content = inject_after(content, arrived_search, arrived_inject)

# 3. startRide
start_search = "await booking.save();\n\n    // Verify OTP"
start_search_alt = "booking.startedAt = new Date();\n    await booking.save();"
start_inject = """

    // --- SOCKET INJECTION ---
    const { getIO, getActiveRides } = require('../config/socket');
    const io = getIO();
    if (io) {
      const activeRides = getActiveRides();
      const ride = activeRides.get(booking._id.toString());
      if (ride) {
        ride.status = 'in_progress';
        activeRides.set(booking._id.toString(), ride);
      }
      io.to(`ride:${booking._id}`).emit('ride:started', { bookingId: booking._id });
    }
    // ------------------------
"""
content = inject_after(content, start_search_alt, start_inject)

# 4. completeRide
complete_search = "booking.completedAt = new Date();\n    await booking.save();"
complete_inject = """

    // --- SOCKET INJECTION ---
    const { getIO, getActiveRides, setDriverAvailable } = require('../config/socket');
    const io = getIO();
    if (io) {
      getActiveRides().delete(booking._id.toString());
      if (booking.driver) {
         setDriverAvailable(booking.driver, true);
      }
      io.to(`ride:${booking._id}`).emit('ride:completed', { bookingId: booking._id });
    }
    // ------------------------
"""
content = inject_after(content, complete_search, complete_inject)

with open(controller_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Backend socket emits patched successfully.")
