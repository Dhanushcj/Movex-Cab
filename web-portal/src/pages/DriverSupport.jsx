import React, { useState, useEffect, useContext } from 'react';
import { Plus, X, LifeBuoy, MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import styles from './DriverSupport.module.css';

const DriverSupport = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: 'general', subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/drivers/complaints');
      // Backend returns array directly or wrapped in {success, data}
      const data = res.data.success ? (res.data.data || []) : (Array.isArray(res.data) ? res.data : []);
      setTickets(data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      // Show empty state if API fails (no mock data)
      setTickets([]);
    }
  };

  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    setSubmitting(true);
    try {
      const res = await API.post('/drivers/complaints', {
        subject: form.subject,
        description: form.description,
        type: form.category, // backend uses 'type' not 'category'
      });
      // Backend returns the complaint object directly
      const newComplaint = res.data.success ? res.data.data : res.data;
      if (newComplaint && newComplaint._id) {
        setTickets(prev => [newComplaint, ...prev]);
      }
    } catch (err) {
      console.error('Failed to submit ticket:', err);
      alert(err.response?.data?.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
      setShowModal(false);
      setForm({ category: 'general', subject: '', description: '' });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <MessageCircle size={22} strokeWidth={2.5} />;
      case 'resolved': return <CheckCircle2 size={22} strokeWidth={2.5} />;
      case 'pending': return <Clock size={22} strokeWidth={2.5} />;
      default: return <MessageCircle size={22} strokeWidth={2.5} />;
    }
  };

  const getIconClass = (status) => {
    switch (status) {
      case 'open': return styles.iconOpen;
      case 'resolved': return styles.iconResolved;
      case 'pending': return styles.iconPending;
      default: return styles.iconOpen;
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'open': return styles.badgeOpen;
      case 'resolved': return styles.badgeResolved;
      case 'pending': return styles.badgePending;
      default: return styles.badgeOpen;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className={styles.supportContainer}>
      <h1 className={styles.pageTitle}>Support Tickets</h1>
      <p className={styles.pageSubtitle}>Need help? Raise a ticket and our team will get back to you.</p>

      <div className={styles.topBar}>
        <div className={styles.filterGroup}>
          {['all', 'open', 'pending', 'resolved'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className={styles.btnNewTicket} onClick={() => setShowModal(true)}>
          <Plus size={18} strokeWidth={2.5} /> New Ticket
        </button>
      </div>

      <div className={styles.ticketList}>
        {filteredTickets.length === 0 ? (
          <div className={styles.emptyState}>
            <LifeBuoy size={56} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No tickets found</h3>
            <p className={styles.emptyText}>
              {filter === 'all' 
                ? "You haven't raised any support tickets yet." 
                : `No ${filter} tickets at the moment.`}
            </p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div key={ticket._id} className={styles.ticketCard}>
              <div className={styles.ticketLeft}>
                <div className={`${styles.ticketIconBox} ${getIconClass(ticket.status)}`}>
                  {getStatusIcon(ticket.status)}
                </div>
                <div className={styles.ticketContent}>
                  <p className={styles.ticketId}>{ticket.ticketId || `#${ticket._id.slice(-6)}`}</p>
                  <h3 className={styles.ticketSubject}>{ticket.subject}</h3>
                  <p className={styles.ticketDesc}>{ticket.description}</p>
                </div>
              </div>
              <div className={styles.ticketRight}>
                <span className={styles.ticketDate}>{formatDate(ticket.createdAt)}</span>
                <span className={`${styles.statusBadge} ${getBadgeClass(ticket.status)}`}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Raise a Ticket</h2>
              <button className={styles.btnClose} onClick={() => setShowModal(false)}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <select 
                  className={styles.formSelect}
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Issue</option>
                  <option value="payment">Payment / Earnings</option>
                  <option value="safety">Safety Concern</option>
                  <option value="route">Route Problem</option>
                  <option value="account">Account Issue</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Subject</label>
                <input
                  className={styles.formInput}
                  type="text"
                  placeholder="Brief summary of your issue"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formTextarea}
                  placeholder="Describe your issue in detail..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>

              <button className={styles.btnSubmitTicket} type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverSupport;
