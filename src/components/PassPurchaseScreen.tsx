import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView, Platform, Dimensions } from 'react-native';
import Colors from '../constants/colors';
import { Feather } from '@expo/vector-icons';
import API from '../services/api';

const { width } = Dimensions.get('window');

interface PassPurchaseScreenProps {
  onBack: () => void;
  onPassPurchased: () => void;
}

export default function PassPurchaseScreen({ onBack, onPassPurchased }: PassPurchaseScreenProps) {
  const [passes, setPasses] = useState<any[]>([]);
  const [myPass, setMyPass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedPassId, setSelectedPassId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [passesRes, myPassRes] = await Promise.all([
        API.get('/subscriptions/available'),
        API.get('/subscriptions/my-pass')
      ]);
      const fetchedPasses = passesRes.data.data || [];
      setPasses(fetchedPasses);
      setMyPass(myPassRes.data.data || null);
      
      // Auto-select Gold (middle) or first pass
      if (fetchedPasses.length > 0) {
        const goldPass = fetchedPasses.find((p: any) => p.name.toLowerCase() === 'gold');
        setSelectedPassId(goldPass ? goldPass._id : fetchedPasses[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPassId) return;
    
    Alert.alert(
      'Confirm Purchase',
      'Are you sure you want to buy this pass? The amount will be deducted from your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setProcessingId(selectedPassId);
            try {
              await API.post('/subscriptions/purchase', { passId: selectedPassId });
              Alert.alert('Success', 'Pass activated successfully!');
              onPassPurchased();
            } catch (err: any) {
              const msg = err.response?.data?.message || 'Purchase failed';
              Alert.alert('Error', msg);
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  const renderIcon = (type: 'check' | 'cross') => {
    return (
      <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
        {type === 'check' ? (
          <Feather name="check" size={16} color="#0053B3" />
        ) : (
          <Feather name="x" size={16} color="#C90303" />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0053B3" />
      </View>
    );
  }

  // Fallback rendering if no passes
  if (passes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Feather name="chevron-left" size={24} color="#262D36" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Your Membership</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ fontFamily: 'sans-serif', fontSize: 16, color: '#7C848D' }}>No passes available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="chevron-left" size={24} color="#262D36" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Membership</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.subtitle}>
        Ride <Text style={{ color: '#0053B3' }}>Smarter</Text> Every Day
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Comparison Table */}
        <View style={styles.tableContainer}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <View style={styles.featureCol} />
            {passes.map((pass) => (
              <View key={pass._id} style={styles.valueCol}>
                <Text style={styles.columnHeader}>{pass.name}</Text>
              </View>
            ))}
          </View>

          {/* Ride Discount Row */}
          <View style={styles.tableRow}>
            <View style={styles.featureCol}>
              <Text style={styles.featureText}>Ride Discount</Text>
            </View>
            {passes.map((pass) => (
              <View key={pass._id} style={styles.valueCol}>
                <Text style={styles.valueText}>{pass.discountPercentage > 0 ? pass.discountPercentage + '%' : '-'}</Text>
              </View>
            ))}
          </View>

          {/* Priority Booking Row */}
          <View style={styles.tableRow}>
            <View style={styles.featureCol}>
              <Text style={styles.featureText}>Priority Booking</Text>
            </View>
            {passes.map((pass) => (
              <View key={pass._id} style={styles.valueCol}>
                {renderIcon(pass.benefits.priorityBooking ? 'check' : 'cross')}
              </View>
            ))}
          </View>

          {/* Free Cancellations Row */}
          <View style={styles.tableRow}>
            <View style={styles.featureCol}>
              <Text style={styles.featureText}>Free Cancellations</Text>
            </View>
            {passes.map((pass) => (
              <View key={pass._id} style={styles.valueCol}>
                <Text style={styles.valueText}>
                  {pass.benefits.freeCancellations === -1 ? 'Unlimited' : (pass.benefits.freeCancellations === 0 ? renderIcon('cross') : pass.benefits.freeCancellations + '/mo')}
                </Text>
              </View>
            ))}
          </View>

          {/* Free Wait Time Row */}
          <View style={styles.tableRow}>
            <View style={styles.featureCol}>
              <Text style={styles.featureText}>Free Wait Time</Text>
            </View>
            {passes.map((pass) => (
              <View key={pass._id} style={styles.valueCol}>
                <Text style={styles.valueText}>
                  {pass.benefits.freeWaitTimeMinutes > 0 ? pass.benefits.freeWaitTimeMinutes + ' min' : renderIcon('cross')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pass Selection Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.cardsContainer}
          snapToInterval={240}
          decelerationRate="fast"
          snapToAlignment="center"
        >
          {passes.map((pass, index) => {
            const isSelected = selectedPassId === pass._id;
            const isActivePass = myPass?.pass?._id === pass._id || myPass?.pass === pass._id;
            const isGold = pass.name.toLowerCase() === 'gold';
            const isPlatinum = pass.name.toLowerCase() === 'platinum' || pass.name.toLowerCase() === 'diamond';
            
            let highlightColor = '#7C848D';
            let subtitle = 'For Regular Commuters';
            
            if (isGold) {
              highlightColor = '#D49F0C';
              subtitle = 'Most Popular';
            } else if (isPlatinum) {
              highlightColor = '#8B5BF4';
              subtitle = 'Ultimate Experience';
            }

            return (
              <TouchableOpacity 
                key={pass._id} 
                activeOpacity={0.9}
                onPress={() => setSelectedPassId(pass._id)}
                style={{ alignItems: 'center' }}
              >
                {/* Current Plan Badge OR Recommended Badge */}
                {isActivePass ? (
                  <View style={[styles.recommendedBadge, { backgroundColor: '#47BE61' }]}>
                    <Feather name="check-circle" size={12} color="#FCFCFC" />
                    <Text style={styles.recommendedText}>Current Plan</Text>
                  </View>
                ) : isGold ? (
                  <View style={styles.recommendedBadge}>
                    <Feather name="star" size={12} color="#FFD035" />
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                ) : null}
                
                <View style={[styles.passCard, isSelected && { borderColor: '#0053B3', borderWidth: 2 }, isActivePass && !isSelected && { borderColor: '#47BE61', borderWidth: 2 }]}>
                  <Text style={[styles.cardTier, { color: highlightColor }]}>{pass.name.toUpperCase()}</Text>
                  <Text style={styles.cardSubtitle}>{subtitle}</Text>
                  
                  {/* Decorative Icon inside Card */}
                  <View style={styles.cardIconBox}>
                    <Feather name="award" size={32} color={highlightColor} />
                  </View>
                  
                  <Text style={styles.cardPrice}>₹{pass.price}<Text style={{fontSize: 14, color: '#7C848D'}}>/month</Text></Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.continueBtn, (myPass?.pass?._id === selectedPassId || myPass?.pass === selectedPassId) && { backgroundColor: '#47BE61' }]} 
          onPress={handlePurchase} 
          disabled={!selectedPassId || processingId !== null || myPass?.pass?._id === selectedPassId || myPass?.pass === selectedPassId}
          activeOpacity={0.8}
        >
          {processingId ? (
            <ActivityIndicator color="#FCFCFC" />
          ) : (
            <Text style={styles.continueText}>
              {(myPass?.pass?._id === selectedPassId || myPass?.pass === selectedPassId) ? 'Current Plan Active' : 'Get Membership'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    fontWeight: '600',
    color: '#262D36',
  },
  subtitle: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    fontWeight: '600',
    color: '#262D36',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  tableContainer: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  featureCol: {
    flex: 1.5,
    justifyContent: 'center',
  },
  valueCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnHeader: {
    fontFamily: 'sans-serif',
    fontSize: 15,
    color: '#262D36',
    fontWeight: '500',
  },
  featureText: {
    fontFamily: 'sans-serif',
    fontSize: 13,
    color: '#7C848D',
  },
  valueText: {
    fontFamily: 'sans-serif',
    fontSize: 13,
    color: '#262D36',
    fontWeight: '500',
  },
  cardsContainer: {
    paddingHorizontal: width / 2 - 112, // Centers the 224 width card
    gap: 16,
    paddingTop: 20,
  },
  passCard: {
    width: 224,
    height: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#E9EAEC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTier: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'sans-serif',
    fontSize: 13,
    color: '#7C848D',
    marginBottom: 20,
  },
  cardIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardPrice: {
    fontFamily: 'sans-serif',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#262D36',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -14,
    zIndex: 10,
    backgroundColor: '#0053B3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recommendedText: {
    color: '#FCFCFC',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#F3F4F6',
  },
  continueBtn: {
    backgroundColor: '#0053B3',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0053B3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  continueText: {
    fontFamily: 'sans-serif',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
