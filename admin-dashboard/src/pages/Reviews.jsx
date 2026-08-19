import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Activity, Star, Eye } from 'lucide-react';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  const fetchReviews = async () => {
    try {
      const response = await API.get('/admin/bookings');
      // Filter bookings that have a customer rating or review
      const bookingsWithReviews = response.data.data.filter(
        (booking) => booking.customerRating || booking.customerReview
      );
      setReviews(bookingsWithReviews);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 inline-block ${
          index < (rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in p-6">
        {/* Top Header */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Customer Reviews</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Monitor and review customer feedback and ratings after their rides.
          </p>
        </div>

        {/* Grid Table */}
        <div className="glass-card overflow-hidden">
          <table className="premium-table w-full text-left">
            <thead>
              <tr>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Review</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((booking) => (
                <tr key={booking._id} className="border-t border-[var(--border-glass)]">
                  <td className="p-4 font-mono text-xs font-semibold text-indigo-600">
                    {booking.bookingId}
                  </td>
                  <td className="p-4 text-sm font-semibold text-[var(--text-primary)]">
                    {booking.customer?.name || 'Unknown'}
                  </td>
                  <td className="p-4 text-sm text-[var(--text-primary)]">
                    {booking.driver?.name || 'Unassigned'}
                  </td>
                  <td className="p-4">
                    {renderStars(booking.customerRating)}
                  </td>
                  <td className="p-4 text-sm text-[var(--text-primary)] max-w-xs truncate">
                    {booking.customerReview || <span className="text-[var(--text-muted)] italic">No text</span>}
                  </td>
                  <td className="p-4 text-xs text-[var(--text-muted)]">
                    {new Date(booking.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedReview(booking)}
                      className="btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-[var(--text-muted)]">
                    No reviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Dialog */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReview(null)}
              className="absolute top-6 right-6 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="text-[var(--text-muted)]">Close</span>
            </button>

            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Review Details</h3>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Booking ID</p>
                <p className="font-mono font-medium text-indigo-600">{selectedReview.bookingId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Customer</p>
                  <p className="font-medium text-[var(--text-primary)]">{selectedReview.customer?.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Driver</p>
                  <p className="font-medium text-[var(--text-primary)]">{selectedReview.driver?.name}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Rating</p>
                <div className="flex gap-1">
                  {renderStars(selectedReview.customerRating)}
                </div>
              </div>

              <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-glass)]">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Customer Feedback</p>
                <p className="text-[var(--text-primary)] whitespace-pre-wrap">
                  {selectedReview.customerReview || <span className="text-[var(--text-muted)] italic">No comments provided.</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Reviews;
