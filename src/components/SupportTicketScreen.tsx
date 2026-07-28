import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import CreateTicketModal from './CreateTicketModal';

interface SupportTicketScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function SupportTicketScreen({ visible, onClose }: SupportTicketScreenProps) {
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const styles = getStyles(colors);

    const [tickets, setTickets] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [showCreateModal, setShowCreateModal] = React.useState(false);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await API.get('/users/complaints');
            if (response.data) {
                setTickets(response.data);
            }
        } catch (error) {
            console.error('Error fetching tickets', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (visible) {
            fetchTickets();
        }
    }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Feather name="chevron-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('support.title') || 'Support Tickets'}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setShowCreateModal(true)}>
            <Feather name="edit" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0053B3" />
            </View>
        ) : tickets.length === 0 ? (
            <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                    <Feather name="x" size={24} color="#DA0707" />
                </View>
                <Text style={styles.emptyStateText}>{t('support.noTickets') || 'No tickets found'}</Text>
            </View>
        ) : (
            <View style={styles.listContainer}>
                {tickets.map(ticket => (
                    <View key={ticket._id} style={styles.ticketCard}>
                        <View style={styles.ticketHeader}>
                            <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: ticket.status === 'closed' || ticket.status === 'resolved' ? '#E8F5E9' : '#FFF3E0' }]}>
                                <Text style={[styles.statusText, { color: ticket.status === 'closed' || ticket.status === 'resolved' ? '#2E7D32' : '#E65100' }]}>
                                    {ticket.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.ticketType}>{ticket.type.replace('_', ' ')}</Text>
                        <Text style={styles.ticketDate}>{new Date(ticket.createdAt).toLocaleDateString()}</Text>
                        
                        {ticket.description && (
                            <View style={styles.descriptionContainer}>
                                <Text style={styles.ticketDescription}>{ticket.description}</Text>
                            </View>
                        )}

                        {ticket.resolution && (
                            <View style={styles.adminReplyContainer}>
                                <View style={styles.adminReplyHeader}>
                                    <Feather name="corner-down-right" size={14} color="#0053B3" />
                                    <Text style={styles.adminReplyLabel}>Admin Reply</Text>
                                </View>
                                <Text style={styles.adminReplyText}>{ticket.resolution}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>
        )}

        <CreateTicketModal 
            visible={showCreateModal} 
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
                setShowCreateModal(false);
                fetchTickets();
            }}
        />

      </View>
    </Modal>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgSecondary,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  editBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -80,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 44,
    backgroundColor: '#FDF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontFamily: 'Outfit',
    fontSize: 16,
    color: '#DA0707',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
  },
  ticketCard: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketSubject: {
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: 'Outfit',
    fontSize: 10,
    fontWeight: '600',
  },
  ticketType: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  ticketDate: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  descriptionContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  ticketDescription: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  adminReplyContainer: {
    marginTop: 12,
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0E4FF',
  },
  adminReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  adminReplyLabel: {
    fontFamily: 'Outfit',
    fontSize: 12,
    fontWeight: '700',
    color: '#0053B3',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  adminReplyText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: '#003370',
    lineHeight: 20,
  }
});
