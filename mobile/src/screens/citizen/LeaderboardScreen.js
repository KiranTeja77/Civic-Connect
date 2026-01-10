import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

const LeaderboardScreen = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await apiService.getLeaderboard();
      setLeaderboard(response.topUsers || []);
      setCurrentUserRank(response.currentUserRank || null);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#94a3b8';
    if (rank === 3) return '#f97316';
    return '#64748b';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        {currentUserRank && (
          <View style={styles.userRankContainer}>
            <Text style={styles.userRankText}>
              Your Rank: #{currentUserRank.rank} • {currentUserRank.points || 0}{' '}
              points
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="trophy-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyText}>No leaderboard data yet</Text>
            <Text style={styles.emptySubtext}>
              Start reporting issues to earn points!
            </Text>
          </View>
        ) : (
          <>
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.userId === user?.id;
              return (
                <View
                  key={entry.userId || index}
                  style={[
                    styles.leaderboardItem,
                    isCurrentUser && styles.currentUserItem,
                  ]}
                >
                  <View style={styles.rankContainer}>
                    <Text
                      style={[
                        styles.rankText,
                        { color: getRankColor(rank) },
                      ]}
                    >
                      {getRankIcon(rank)}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text
                      style={[
                        styles.userName,
                        isCurrentUser && styles.currentUserName,
                      ]}
                    >
                      {entry.name || 'Anonymous'}
                    </Text>
                    <Text style={styles.userEmail}>{entry.email || ''}</Text>
                  </View>

                  <View style={styles.pointsContainer}>
                    <Ionicons name="star" size={20} color="#fbbf24" />
                    <Text style={styles.pointsText}>
                      {entry.points || 0} pts
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  userRankContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e4359',
  },
  userRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e4359',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserItem: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: '#1e4359',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  currentUserName: {
    color: '#1e4359',
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 5,
  },
});

export default LeaderboardScreen;
