import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

const NearbyIssuesScreen = () => {
  const navigation = useNavigation();
  const [issues, setIssues] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    requestLocationPermission();
    fetchIssues();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Location permission is needed to show nearby issues'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Default location (Bhopal)
      setUserLocation({
        latitude: 23.2599,
        longitude: 77.4126,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await apiService.getIssues({ limit: 100 });
      const data = response.issues || response.data?.issues || [];
      setIssues(data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      Alert.alert('Error', 'Failed to load issues');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchIssues();
    requestLocationPermission();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return '#10b981';
      case 'in-progress':
        return '#3b82f6';
      case 'assigned':
        return '#f59e0b';
      case 'reported':
        return '#64748b';
      default:
        return '#64748b';
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (selectedStatus === 'all') return true;
    return issue.status === selectedStatus;
  });

  const issuesWithCoordinates = filteredIssues.filter(
    (issue) => issue.location?.coordinates?.latitude && issue.location?.coordinates?.longitude
  );

  if (loading && !userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e4359" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Issues</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#1e4359" />
        </TouchableOpacity>
      </View>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilters}
        contentContainerStyle={styles.statusFiltersContent}
      >
        {['all', 'reported', 'assigned', 'in-progress', 'resolved'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilter,
              selectedStatus === status && styles.statusFilterActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.statusFilterText,
                selectedStatus === status && styles.statusFilterTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map */}
      {userLocation && (
        <MapView
          style={styles.map}
          initialRegion={userLocation}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {issuesWithCoordinates.map((issue) => (
            <Marker
              key={issue._id}
              coordinate={{
                latitude: issue.location.coordinates.latitude,
                longitude: issue.location.coordinates.longitude,
              }}
              title={issue.title}
              description={issue.description?.substring(0, 100)}
              pinColor={getStatusColor(issue.status)}
              onPress={() =>
                navigation.navigate('IssueDetail', { issueId: issue._id })
              }
            />
          ))}
        </MapView>
      )}

      {/* Issues List */}
      <View style={styles.listContainer}>
        <ScrollView
          style={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredIssues.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="map-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyText}>No issues found</Text>
              <Text style={styles.emptySubtext}>
                {selectedStatus === 'all'
                  ? 'No issues reported yet'
                  : `No ${selectedStatus} issues`}
              </Text>
            </View>
          ) : (
            filteredIssues.map((issue) => (
              <TouchableOpacity
                key={issue._id}
                style={styles.issueCard}
                onPress={() => navigation.navigate('IssueDetail', { issueId: issue._id })}
              >
                <View style={styles.issueHeader}>
                  <Text style={styles.issueTitle} numberOfLines={2}>
                    {issue.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(issue.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: getStatusColor(issue.status) }]}
                    >
                      {issue.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.issueDescription} numberOfLines={2}>
                  {issue.description}
                </Text>
                <View style={styles.issueFooter}>
                  <View style={styles.footerItem}>
                    <Ionicons name="location" size={16} color="#64748b" />
                    <Text style={styles.footerText}>
                      {issue.location?.name || 'Location not specified'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  refreshButton: {
    padding: 5,
  },
  statusFilters: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statusFiltersContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 10,
  },
  statusFilterActive: {
    backgroundColor: '#1e4359',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusFilterTextActive: {
    color: '#fff',
  },
  map: {
    height: 300,
    width: '100%',
  },
  listContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 5,
  },
  issueCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  issueDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 10,
    lineHeight: 20,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 5,
  },
});

export default NearbyIssuesScreen;
