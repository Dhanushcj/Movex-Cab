import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { CalendarDays, MapPin, Eye, Activity } from 'lucide-react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const response = await API.get('/admin/bookings');
      setBookings(response.data.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Booking Registry</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Audit complete trip logs, active rides, fare breakdowns, and route maps</p>
      </div>

      {/* Grid Table */}
      <div className="glass-card overflow-hidden">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Driver</th>
              <th>Vehicle Class</th>
              <th>Trip Fare</th>
              <th>Status</th>
              <th>Placed At</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td className="font-mono text-xs font-semibold text-indigo-600">
                  {booking.bookingId}
                </td>
                <td className="text-sm font-semibold text-[var(--text-primary)]">
                  {booking.customer?.name}
                </td>
                <td className="text-sm text-[var(--text-primary)]">
                  {booking.driver?.name ? (
                    <div>
                      <div>{booking.driver.name}</div>
                      <span className="text-xs text-[var(--text-muted)]">{booking.driver.plateNumber}</span>
                    </div>
                  ) : (
                    <span className="text-[var(--text-muted)] italic">Unassigned</span>
                  )}
                </td>
                <td>
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded">
                    {booking.vehicleType}
                  </span>
                </td>
                <td className="text-sm font-bold text-[var(--text-primary)]">
                  ₹{booking.fare?.totalFare || 0}
                </td>
                <td>
                  <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full border ${
                    booking.status === 'completed'
                      ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                      : booking.status === 'cancelled'
                      ? 'bg-rose-100 border-rose-200 text-rose-700'
                      : 'bg-indigo-100 border-indigo-200 text-indigo-700'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="text-xs text-[var(--text-muted)]">
                  {new Date(booking.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="text-right">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-8 text-[var(--text-muted)]">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Dialog */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-xl p-8 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              Close
            </button>

            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Booking Details Audit</h3>
            
            <div className="space-y-6">
              {/* Pickup & Drop Details */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <MapPin className="text-emerald-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold text-[var(--text-muted)] uppercase">Pickup Address</h5>
                    <p className="text-sm text-[var(--text-primary)] font-medium">{selectedBooking.pickup?.address}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <MapPin className="text-rose-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold text-[var(--text-muted)] uppercase">Dropoff Address</h5>
                    <p className="text-sm text-[var(--text-primary)] font-medium">{selectedBooking.drop?.address}</p>
                  </div>
                </div>
              </div>

              {/* Ride info summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--bg-tertiary)] border border-[var(--border-glass)] rounded-xl">
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Distance Route</span>
                  <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{selectedBooking.route?.distance} km</div>
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Trip Duration</span>
                  <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{selectedBooking.route?.duration} mins</div>
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Vehicle Type</span>
                  <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5 uppercase">{selectedBooking.vehicleType}</div>
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Payment Mode</span>
                  <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5 uppercase">{selectedBooking.paymentMethod}</div>
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="border-t border-[var(--border-glass)] pt-4 space-y-2">
                <h4 className="font-semibold text-[var(--text-primary)] text-sm mb-3">Fare breakdown invoice</h4>
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Base Booking Rate:</span>
                  <span className="text-[var(--text-primary)]">₹{selectedBooking.fare?.baseFare || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Distance Charge:</span>
                  <span className="text-[var(--text-primary)]">₹{selectedBooking.fare?.distanceCharge || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Duration Charge:</span>
                  <span className="text-[var(--text-primary)]">₹{selectedBooking.fare?.timeCharge || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Surge Multiplier ({selectedBooking.fare?.surgeMultiplier || 1}x):</span>
                  <span className="text-[var(--text-primary)]">₹{selectedBooking.fare?.surgeAmount || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Promo discounts:</span>
                  <span className="text-emerald-600">-₹{selectedBooking.fare?.discount || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Taxes (5%):</span>
                  <span className="text-[var(--text-primary)]">₹{selectedBooking.fare?.tax || 0}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--border-glass)]">
                  <span>Grand Total Fare:</span>
                  <span>₹{selectedBooking.fare?.totalFare || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
