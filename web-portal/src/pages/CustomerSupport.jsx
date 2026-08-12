import React, { useState, useEffect, useRef } from 'react';
import {
  Ticket,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  PhoneCall,
  Mail,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  ArrowLeft,
  Paperclip,
  User,
  Car,
  Headset
} from 'lucide-react';
import styles from './CustomerSupport.module.css';
import API from '../services/api';

const FAQS = [
  { id: 1, q: 'How do I cancel a ride?', a: 'Go to "My Rides", select your active or upcoming ride, and tap "Cancel Ride".' },
  { id: 2, q: 'How does my mobility pass work?', a: 'Your mobility pass gives you access to unlimited rides within a selected validity period on covered routes.' },
  { id: 3, q: 'How can I request a refund?', a: 'Refunds are automatically processed for eligible cancellations. For other issues, please raise a support ticket.' },
  { id: 4, q: 'How do I change my pickup location?', a: 'Once a ride is booked, the pickup location cannot be changed for route-based trips. You will need to cancel and rebook.' },
  { id: 5, q: 'Where can I see my ride history?', a: 'You can view your complete ride history in the "My Rides" section of the dashboard.' }
];

// Map frontend categories to backend types
const CATEGORY_MAP = {
  'Ride Issue': 'route_issue',
  'Payment Issue': 'payment',
  'Driver Issue': 'driver_behavior',
  'Pass Issue': 'app_issue',
  'Account Issue': 'app_issue',
  'Technical Issue': 'app_issue',
  'Other': 'other'
};

const BACKEND_TYPE_MAP = {
  'safety': 'Safety Issue',
  'payment': 'Payment Issue',
  'driver_behavior': 'Driver Issue',
  'vehicle_condition': 'Vehicle Issue',
  'route_issue': 'Ride Issue',
  'fare_dispute': 'Fare Dispute',
  'app_issue': 'Technical Issue',
  'other': 'Other'
};

const CustomerSupport = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [recentRides, setRecentRides] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  // Form State
  const [formData, setFormData] = useState({
    category: '',
    ride: '',
    priority: '',
    subject: '',
    description: ''
  });

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const fetchTickets = async () => {
    try {
      const response = await API.get('/users/complaints');
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRides = async () => {
    try {
      const res = await API.get('/users/me/rides');
      if (res.data.success) {
        const historyRides = res.data.data || [];
        historyRides.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentRides(historyRides.slice(0, 10));
      }
    } catch (err) {
      console.error('Failed to fetch recent rides', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchRecentRides();
  }, []);

  const getStatusBadge = (code) => {
    const text = code.charAt(0).toUpperCase() + code.slice(1).replace('_', ' ');
    switch(code) {
      case 'open':
        return <span className={`${styles.badge} ${styles.badgeOpen}`}>{text}</span>;
      case 'in_progress':
        return <span className={`${styles.badge} ${styles.badgeInProgress}`}>{text}</span>;
      case 'resolved':
        return <span className={`${styles.badge} ${styles.badgeResolved}`}>{text}</span>;
      case 'closed':
        return <span className={`${styles.badge} ${styles.badgeClosed}`}>{text}</span>;
      default:
        return <span className={`${styles.badge} ${styles.badgeOpen}`}>{text}</span>;
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      let attachmentUrl = null;
      if (selectedFile) {
        const fileData = new FormData();
        fileData.append('image', selectedFile);
        fileData.append('folder', 'complaints');
        
        const uploadRes = await API.post('/upload/image', fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data.success) {
          attachmentUrl = uploadRes.data.imageUrl;
        }
      }

      await API.post('/users/complaints', {
        type: CATEGORY_MAP[formData.category] || 'other',
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority.toLowerCase() || 'medium',
        bookingId: formData.ride || null,
        attachments: attachmentUrl ? [attachmentUrl] : []
      });
      alert('Ticket submitted successfully!');
      setFormData({ category: '', ride: '', priority: '', subject: '', description: '' });
      setSelectedFile(null);
      fetchTickets();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Low': return '#10b981'; // Green
      case 'Medium': return '#f59e0b'; // Orange
      case 'High': return '#ef4444'; // Red
      default: return 'var(--border-color, #cbd5e1)'; // Gray
    }
  };

  const renderMainView = () => (
    <div className={styles.leftColumn}>
      {/* Raise Ticket Form */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIconBox}><Ticket size={24} /></div>
          <div>
            <h2 className={styles.cardTitle}>Raise a Support Ticket</h2>
            <p className={styles.cardSubtitle}>Submit your issue to our support team. We'll get back to you as soon as possible.</p>
          </div>
        </div>
        
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <div className={styles.formRow3}>
            <div className={styles.formGroup}>
              <label>Issue Category <span>*</span></label>
              <select name="category" value={formData.category} onChange={handleFormChange} required>
                <option value="">Select Category</option>
                <option value="Ride Issue">Ride Issue</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Driver Issue">Driver Issue</option>
                <option value="Pass Issue">Pass Issue</option>
                <option value="Account Issue">Account Issue</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Related Ride (Optional)</label>
              <select name="ride" value={formData.ride} onChange={handleFormChange}>
                <option value="">Select a recent ride</option>
                {recentRides.map(ride => {
                  const dateObj = new Date(ride.createdAt);
                  const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
                  const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                  const pickup = ride.pickup?.address || 'Pickup';
                  const dropoff = ride.dropoff?.address || ride.drop?.address || 'Dropoff';
                  // Use short address (split by comma) to keep it concise
                  const pickupShort = pickup.split(',')[0];
                  const dropoffShort = dropoff.split(',')[0];
                  
                  return (
                    <option key={ride._id} value={ride._id}>
                      {dateStr}, {timeStr} • {pickupShort} → {dropoffShort}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Priority <span>*</span></label>
              <div className={styles.prioritySelector}>
                <div className={styles.priorityDot} style={{ backgroundColor: getPriorityColor(formData.priority) }}></div>
                <select name="priority" value={formData.priority} onChange={handleFormChange} required>
                  <option value="">Select Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Subject <span>*</span></label>
            <input 
              type="text" 
              name="subject"
              value={formData.subject}
              onChange={handleFormChange}
              placeholder="E.g. Driver was late and I had to wait too long" 
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Describe your issue in detail <span>*</span></label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Please provide as much detail as possible..." 
              rows={4}
              required
            ></textarea>
          </div>

          <div className={styles.formGroup}>
            <label>Upload Screenshot / Attachment (Optional)</label>
            <div 
              className={styles.uploadBox}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={24} color="var(--forge-blue)" />
              {selectedFile ? (
                <p><span>{selectedFile.name}</span> selected</p>
              ) : (
                <p><span>Click to upload</span> or drag and drop</p>
              )}
              <small>PNG, JPG, PDF up to 5MB</small>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }}
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={() => setFormData({ category: '', ride: '', priority: '', subject: '', description: '' })}>Cancel</button>
            <button type="submit" className={styles.btnPrimary} disabled={submitLoading}>
              {submitLoading ? 'Submitting...' : <>Submit Ticket <ArrowRight size={18} /></>}
            </button>
          </div>
        </form>
      </div>

      {/* Tickets Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader} style={{marginBottom: '20px'}}>
          <h2 className={styles.cardTitle}>My Support Tickets</h2>
        </div>
        <div className={styles.tableResponsive}>
          <table className={styles.ticketTable}>
            <thead>
              <tr>
                <th>TICKET ID</th>
                <th>SUBJECT</th>
                <th>CATEGORY</th>
                <th>RELATED RIDE</th>
                <th>STATUS</th>
                <th>LAST UPDATED</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>Loading tickets...</td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '20px', color: 'var(--text-muted)'}}>No support tickets found.</td>
                </tr>
              ) : (
                tickets.map(ticket => (
                  <tr key={ticket._id}>
                    <td className={styles.idCol}>#{ticket._id.slice(-6).toUpperCase()}</td>
                    <td className={styles.subjectCol}>{ticket.subject}</td>
                    <td>{BACKEND_TYPE_MAP[ticket.type] || 'Other'}</td>
                    <td className={styles.rideCol}>{ticket.bookingId || '—'}</td>
                    <td>{getStatusBadge(ticket.status)}</td>
                    <td>{formatDate(ticket.updatedAt)}</td>
                    <td>
                      <button className={styles.btnAction} onClick={() => setActiveTicket(ticket)}>
                        View Ticket <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDetailView = () => (
    <div className={styles.leftColumn}>
      <div className={styles.card}>
        <div className={styles.ticketDetailHeader}>
          <button className={styles.btnBack} onClick={() => setActiveTicket(null)}>
            <ArrowLeft size={18} /> Back to Tickets
          </button>
          <div className={styles.ticketMetaHeader}>
            <div>
              <div className={styles.idBadge}>#{activeTicket._id.slice(-6).toUpperCase()}</div>
              <h2 className={styles.cardTitle} style={{marginTop: '12px'}}>{activeTicket.subject}</h2>
              <div className={styles.ticketMetaTags}>
                <span><Clock size={14}/> Opened: {formatDate(activeTicket.createdAt)}</span>
                <span><AlertCircle size={14}/> {BACKEND_TYPE_MAP[activeTicket.type] || 'Other'}</span>
                {getStatusBadge(activeTicket.status)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.conversationTimeline}>
          <div className={`${styles.messageWrapper} ${styles.msgCustomer}`}>
            <div className={styles.messageAvatar}>
              <User size={16} />
            </div>
            <div className={styles.messageContentBox}>
              <div className={styles.messageMeta}>
                <strong>You</strong> <span>{formatDate(activeTicket.createdAt)}</span>
              </div>
              <div className={styles.messageText}>
                {activeTicket.description}
              </div>
            </div>
          </div>
          
          {activeTicket.resolution && (
            <div className={`${styles.messageWrapper} ${styles.msgSupport}`}>
              <div className={styles.messageAvatar}>
                <Headset size={16} />
              </div>
              <div className={styles.messageContentBox}>
                <div className={styles.messageMeta}>
                  <strong>Support Team</strong> <span>{formatDate(activeTicket.resolvedAt || activeTicket.updatedAt)}</span>
                </div>
                <div className={styles.messageText}>
                  {activeTicket.resolution}
                </div>
              </div>
            </div>
          )}
        </div>

        {activeTicket.status !== 'closed' && activeTicket.status !== 'resolved' && (
          <div className={styles.replyBox}>
            <label>Send a message (Mock)</label>
            <textarea placeholder="Type your reply here..." rows={3}></textarea>
            <div className={styles.replyActions}>
              <button className={styles.btnAttach}><Paperclip size={18} /> Attach File</button>
              <button className={styles.btnPrimary}>Send Reply <Send size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.mainLayout}>
        
        {/* Left Column (Dynamic view) */}
        {activeTicket ? renderDetailView() : renderMainView()}

        {/* Right Column: Contact & FAQs */}
        <div className={styles.rightSidebar}>
          
          {/* Contact Card */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Need Immediate Help?</h3>
            <p className={styles.sideSubtitle}>Connect with our support team through any of these channels.</p>
            
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon} style={{color: '#2563EB', background: '#EFF6FF'}}>
                  <MessageSquare size={18} />
                </div>
                <div className={styles.contactInfo}>
                  <h4>Live Chat</h4>
                  <p>Chat with us</p>
                </div>
                <div className={styles.contactBadgeSuccess}>Online</div>
              </div>
              
              <div className={styles.contactItem}>
                <div className={styles.contactIcon} style={{color: '#4F46E5', background: '#EEF2FF'}}>
                  <PhoneCall size={18} />
                </div>
                <div className={styles.contactInfo}>
                  <h4>Call Support</h4>
                  <p>+91 80 1234 5678</p>
                </div>
                <div className={styles.contactBadgeMuted}>24/7</div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIcon} style={{color: '#2563EB', background: '#EFF6FF'}}>
                  <Mail size={18} />
                </div>
                <div className={styles.contactInfo}>
                  <h4>Email Support</h4>
                  <p>support@forgeindia.com</p>
                </div>
                <div className={styles.contactBadgeMuted}>24/7</div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className={styles.sideCard}>
            <div className={styles.faqHeaderTop}>
              <h3 className={styles.sideTitle} style={{marginBottom: 0}}>Frequently Asked Questions</h3>
              <a href="#" className={styles.viewAllLink}>View all <ArrowRight size={14}/></a>
            </div>
            
            <div className={styles.faqList}>
              {FAQS.map(faq => (
                <div key={faq.id} className={styles.faqItem}>
                  <button className={styles.faqHeader} onClick={() => toggleFaq(faq.id)}>
                    {faq.q}
                    {openFaq === faq.id ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
                  </button>
                  {openFaq === faq.id && (
                    <div className={styles.faqContent}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Banner */}
          <div className={styles.heroSideBanner}>
            <div className={styles.heroBannerContent}>
              <ShieldCheck size={32} color="#FBB040" />
              <h3>We're here to help!</h3>
              <p>Our support team is available 24/7 to resolve your queries.</p>
            </div>
            <div className={styles.heroBannerGraphics}>
              <div className={styles.graphicCar}><Car size={40} color="var(--forge-blue)" strokeWidth={1.5} /></div>
              <div className={styles.graphicUser}><Headset size={30} color="var(--forge-blue)" strokeWidth={1.5} /></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
