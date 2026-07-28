import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { getDriverAchievements } from '../services/api';

interface DriverAchievementsScreenProps {
  onNavigateHome: () => void;
  onNavigateWallet?: () => void;
  onNavigateHistory?: () => void;
}

const DriverAchievementsScreen: React.FC<DriverAchievementsScreenProps> = ({ 
  onNavigateHome,
  onNavigateWallet,
  onNavigateHistory
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await getDriverAchievements();
      if (res && res.success) {
        setAchievements(res.achievements || []);
        setStats(res.stats || null);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      Alert.alert('Error', 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (iconName: string, unlocked: boolean) => {
    const color = unlocked ? '#FFD700' : '#DEE0E3'; // Gold for unlocked, gray for locked
    
    if (iconName === 'star') return <FontAwesome5 name="star" solid={unlocked} size={28} color={color} />;
    if (iconName === 'star-on') return <FontAwesome5 name="star" solid={unlocked} size={28} color={color} />;
    if (iconName === 'map') return <Feather name="map" size={28} color={color} />;
    if (iconName === 'award') return <FontAwesome5 name="award" size={28} color={color} />;
    if (iconName === 'thumbs-up') return <FontAwesome5 name="thumbs-up" solid={unlocked} size={28} color={color} />;
    if (iconName === 'dollar-sign') return <FontAwesome5 name="dollar-sign" size={28} color={color} />;
    
    return <FontAwesome5 name="medal" size={28} color={color} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateHome} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Achievements</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* Stats Overview */}
            {stats && (
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.completedRides || 0}</Text>
                  <Text style={styles.statLabel}>Rides</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.rating ? stats.rating.toFixed(1) : '0.0'}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>₹{stats.totalEarnings || 0}</Text>
                  <Text style={styles.statLabel}>Earned</Text>
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>Badges & Milestones</Text>

            {achievements.length > 0 ? achievements.map((ach) => {
              const progressPercent = Math.min((ach.currentProgress / ach.target) * 100, 100);
              
              return (
                <View key={ach.id} style={[styles.achievementCard, !ach.unlocked && styles.lockedCard]}>
                  <View style={styles.iconContainer}>
                    {renderIcon(ach.icon, ach.unlocked)}
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{ach.title}</Text>
                    <Text style={styles.achievementDesc}>{ach.description}</Text>
                    
                    {!ach.unlocked && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBarBg}>
                          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                        </View>
                        <Text style={styles.progressText}>
                          {typeof ach.currentProgress === 'number' && ach.currentProgress % 1 !== 0 
                            ? ach.currentProgress.toFixed(1) 
                            : ach.currentProgress} / {ach.target}
                        </Text>
                      </View>
                    )}
                  </View>
                  {ach.unlocked && (
                    <View style={styles.unlockedBadge}>
                      <Feather name="check-circle" size={20} color="#10B981" />
                    </View>
                  )}
                </View>
              );
            }) : (
              <Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 40 }}>No achievements available.</Text>
            )}
            
            <View style={{ height: 100 }} />
          </ScrollView>
        )}

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateHome}>
            <Feather name="home" size={24} color="#9098A2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItemActive}>
            <Feather name="award" size={18} color="#FCFCFC" />
            <Text style={styles.navTextActive}>Awards</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateWallet}>
            <Feather name="credit-card" size={24} color="#9098A2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={onNavigateHistory}>
            <Feather name="clock" size={24} color="#9098A2" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  lockedCard: {
    backgroundColor: '#FAFAFA',
    opacity: 0.7,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  unlockedBadge: {
    marginLeft: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    width: 45,
    textAlign: 'right',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  navItem: {
    padding: 8,
  },
  navItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    gap: 8,
  },
  navTextActive: {
    color: '#FCFCFC',
    fontSize: 14,
    fontWeight: '600',
  }
});

export default DriverAchievementsScreen;
