import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Image, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/colors';

const DashboardUI = ({ 
  user, 
  activePasses,
  onNotificationPress,
  onProfilePress,
  onBookRide, 
  onBuyPass, 
  onScheduleRide,
  onTrackRide,
  scheduledRide,
  onCancelScheduledRide
}: any) => {
  const pass = activePasses && activePasses.length > 0 ? activePasses[0] : null;
  const passName = pass 
    ? String(pass.pass?.name || pass.vehicleType || 'Gold').toLowerCase() 
    : 'gold';
  const isDiamond = passName === 'diamond';
  const themeColor = isDiamond ? '#007BFF' : '#D49F0C';
  
  // Calculate progress percentage
  let progressWidth = 0;
  if (pass && pass.validUntil) {
    const start = new Date(pass.purchaseDate || pass.createdAt || Date.now()).getTime();
    const end = new Date(pass.validUntil).getTime();
    const now = Date.now();
    
    if (end > start) {
      // Calculate how much time has passed as a percentage
      const elapsed = now - start;
      const total = end - start;
      // We want to show remaining time, so 100% when purchased, down to 0%
      const remainingPercent = Math.max(0, Math.min(100, ((total - elapsed) / total) * 100));
      progressWidth = remainingPercent;
    }
  }
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F3F4F6' }} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* TOP HEADER */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
        <TouchableOpacity onPress={onProfilePress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgTertiary, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderGlass }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.accent }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#7C848D' }}>
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return 'Good Morning!';
                if (hour < 17) return 'Good Afternoon!';
                return 'Good Evening!';
              })()}
            </Text>
            <Text style={{ fontFamily: 'sans-serif', fontSize: 16, color: '#262D36', fontWeight: 'bold' }}>{user?.name?.split(' ')[0] || 'Rose'}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNotificationPress} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="bell" size={20} color="#262D36" />
        </TouchableOpacity>
      </View>

      {/* MONTHLY PASS CARD */}
      <View style={{ marginHorizontal: 16, marginTop: 12, borderRadius: 20, overflow: 'hidden' }}>
        <LinearGradient colors={['#ABCAED', '#EBEBEB']} start={{x:0, y:0}} end={{x:1, y:1}} style={{ padding: 20, height: 198 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontFamily: 'sans-serif', fontSize: 16, color: '#262D36', fontWeight: 'bold' }}>Monthly Pass</Text>
              <View style={{ backgroundColor: '#ECFDF2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="check" size={10} color="#39B45C" />
                <Text style={{ color: '#39B45C', fontSize: 10, fontWeight: 'bold' }}>Active</Text>
              </View>
            </View>
            <View style={{ backgroundColor: themeColor, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: '#FCFCFC', fontSize: 10, fontWeight: 'bold' }}>{passName.toUpperCase()}</Text>
              <Feather name="shield" size={10} color="#FCFCFC" />
            </View>
          </View>
          
          <View style={{ marginTop: 40 }}>
            <Text style={{ color: '#7C848D', fontSize: 10 }}>Valid Till</Text>
            <Text style={{ color: '#FCFCFC', fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
              {pass && pass.validUntil 
                ? new Date(pass.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'July 29, 2026'}
            </Text>
          </View>
          <View style={{ marginTop: 12, height: 8, backgroundColor: '#F6F8FE', borderRadius: 4, width: '50%', overflow: 'hidden' }}>
             <View style={{ width: `${progressWidth}%`, height: 8, backgroundColor: '#0053B3', borderRadius: 4 }} />
          </View>
          <Text style={{ color: '#262D36', fontSize: 12, marginTop: 4 }}>
            {pass && pass.validUntil 
              ? `${Math.max(0, Math.ceil((new Date(pass.validUntil).getTime() - Date.now()) / (1000 * 3600 * 24)))} Days Left`
              : (pass && pass.totalRides ? `${pass.totalRides - (pass.ridesCompleted || 0)} Rides Left` : 'Active')}
          </Text>
          
          <Image source={{ uri: 'https://www.pngplay.com/wp-content/uploads/13/White-Tata-Tiago-Transparent-PNG.png' }} style={{ position: 'absolute', right: -20, top: 40, width: 220, height: 120, resizeMode: 'contain' }} />
        </LinearGradient>
      </View>

      {/* SCHEDULED RIDE */}
      {scheduledRide && (
        <View style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E9EAEC' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'sans-serif', fontSize: 16, color: '#262D36', fontWeight: 'bold' }}>Upcoming Ride</Text>
            <View style={{ backgroundColor: '#EFFAF0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: '#198E1E', fontSize: 12, fontWeight: 'bold' }}>Scheduled</Text>
            </View>
          </View>
          
          {scheduledRide.pickupDateTime && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, backgroundColor: '#F6F8FE', padding: 8, borderRadius: 8, alignSelf: 'flex-start' }}>
              <Feather name="clock" size={14} color="#0053B3" />
              <Text style={{ color: '#0053B3', fontSize: 12, fontWeight: 'bold' }}>
                {new Date(scheduledRide.pickupDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                {' - '}
                {new Date(scheduledRide.pickupDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
             <Feather name="home" size={16} color="#198E1E" />
             <Text style={{ color: '#262D36', fontSize: 14 }} numberOfLines={1}>{scheduledRide.pickup || 'Pickup Location'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
             <Feather name="map-pin" size={16} color="#F85300" />
             <Text style={{ color: '#262D36', fontSize: 14, flex: 1 }} numberOfLines={1}>{scheduledRide.drop || 'Drop Location'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: '#0053B3', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
              onPress={onTrackRide}
            >
              <Feather name="navigation" size={16} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>Track</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: '#FFF0F0', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
              onPress={() => onCancelScheduledRide && onCancelScheduledRide(scheduledRide._id)}
            >
              <Feather name="x-circle" size={16} color="#FF3B30" />
              <Text style={{ color: '#FF3B30', fontSize: 14, fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SEARCH BAR */}
      <TouchableOpacity style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E9EAEC' }} onPress={onBookRide}>
        <Feather name="search" size={20} color="#7C848D" />
        <Text style={{ color: '#7C848D', fontSize: 14 }}>Search destination</Text>
      </TouchableOpacity>

      {/* FOR YOU */}
      <View style={{ marginHorizontal: 16, marginTop: 24 }}>
        <Text style={{ fontFamily: 'sans-serif', fontSize: 16, color: '#262D36', fontWeight: 'bold', marginBottom: 12 }}>For you</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 24 }}>
          <TouchableOpacity style={{ alignItems: 'center', gap: 8 }} onPress={onBuyPass}>
            <View style={{ width: 68, height: 68, backgroundColor: '#F9FAFB', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E9EAEC' }}>
               <Feather name="credit-card" size={28} color="#0053B3" />
            </View>
            <Text style={{ color: '#262D36', fontSize: 14 }}>Buy Pass</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center', gap: 8 }} onPress={onBookRide}>
            <View style={{ width: 68, height: 68, backgroundColor: '#F9FAFB', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E9EAEC' }}>
               <Feather name="navigation" size={28} color="#0053B3" />
            </View>
            <Text style={{ color: '#262D36', fontSize: 14 }}>Book Ride</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center', gap: 8 }} onPress={onScheduleRide}>
            <View style={{ width: 68, height: 68, backgroundColor: '#F9FAFB', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E9EAEC' }}>
               <Feather name="calendar" size={28} color="#0053B3" />
            </View>
            <Text style={{ color: '#262D36', fontSize: 14 }}>Schedule Ride</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AD BANNERS */}
      <View style={{ marginTop: 32, paddingBottom: 20 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
          snapToInterval={300 + 16}
          decelerationRate="fast"
          snapToAlignment="center"
        >
          {/* Banner 1 */}
          <View style={{ width: 300, height: 140, borderRadius: 20, overflow: 'hidden' }}>
            <LinearGradient colors={['#FF9A9E', '#FECFEF']} start={{x:0, y:0}} end={{x:1, y:1}} style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'sans-serif', fontSize: 18, color: '#D81B60', fontWeight: 'bold' }}>Get 20% Off!</Text>
              <Text style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#262D36', marginTop: 4, width: '60%' }}>On your first outstation ride this weekend.</Text>
              <View style={{ backgroundColor: '#D81B60', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 12 }}>
                <Text style={{ color: '#FCFCFC', fontSize: 12, fontWeight: 'bold' }}>Claim Now</Text>
              </View>
              <Feather name="gift" size={64} color="rgba(216, 27, 96, 0.2)" style={{ position: 'absolute', right: -10, bottom: -10 }} />
            </LinearGradient>
          </View>

          {/* Banner 2 */}
          <View style={{ width: 300, height: 140, borderRadius: 20, overflow: 'hidden' }}>
            <LinearGradient colors={['#a18cd1', '#fbc2eb']} start={{x:0, y:0}} end={{x:1, y:1}} style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'sans-serif', fontSize: 18, color: '#4A148C', fontWeight: 'bold' }}>Refer & Earn</Text>
              <Text style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#262D36', marginTop: 4, width: '60%' }}>Invite friends and earn free rides up to ₹500.</Text>
              <View style={{ backgroundColor: '#4A148C', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 12 }}>
                <Text style={{ color: '#FCFCFC', fontSize: 12, fontWeight: 'bold' }}>Invite Friends</Text>
              </View>
              <Feather name="users" size={64} color="rgba(74, 20, 140, 0.2)" style={{ position: 'absolute', right: -10, bottom: -10 }} />
            </LinearGradient>
          </View>
        </ScrollView>
      </View>

    </ScrollView>
  );
};

export default DashboardUI;
