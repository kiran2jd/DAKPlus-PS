import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    RefreshControl,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { authService } from '../services/auth';
import { testService } from '../services/test';
import { resultService } from '../services/result';
import { topicService } from '../services/topic';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
    // usePreventScreenCapture(); // Temporarily disabled for client demo
    const [user, setUser] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    const banners = [
        { id: '1', title: 'Postal Assistant Exam 2026', subtitle: 'Targeted mock tests for high success', colors: ['#dc2626', '#991b1b'] },
        { id: '2', title: 'Postman & Mail Guard', subtitle: 'AI-generated precision assessments', colors: ['#1e3a8a', '#1e40af'] },
        { id: '3', title: 'MTS & Selection Post', subtitle: 'Master the basics with detailed analytics', colors: ['#1e293b', '#334155'] },
    ];

    const loadData = async () => {
        try {
            let userData;
            try {
                userData = await authService.getProfile();
            } catch (err) {
                userData = await authService.getUser();
            }
            setUser(userData);

            if (userData.role === 'STUDENT') {
                if (userData.id || userData._id) {
                    const userId = userData.id || userData._id;
                    const userResults = await resultService.getResultsByUser(userId);
                    setResults(userResults);
                }
            }
        } catch (err) {
            console.error("Dashboard load error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Auto-carousel timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        }, 2000); // 2 Seconds
        return () => clearInterval(timer);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleLogout = async () => {
        await authService.logout();
        navigation.replace('Welcome');
    };

    const isPro = user?.subscriptionTier === 'PREMIUM' || user?.role === 'ADMIN' || user?.role === 'TEACHER';
    const isStaff = user?.role === 'ADMIN' || user?.role === 'TEACHER';

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#dc2626" />
            </View>
        );
    }

    const renderHeader = () => (
        <LinearGradient
            colors={['#dc2626', '#1e3a8a']}
            style={styles.headerGradient}
        >
            <View style={styles.topRow}>
                <View>
                    <View style={styles.nameRow}>
                        <Text style={styles.greeting}>Hello, {user?.fullName?.split(' ')[0] || 'User'}</Text>
                        {(isPro || isStaff) && (
                            <View style={styles.proBadge}>
                                <Text style={styles.proText}>{user?.role === 'ADMIN' ? 'ADMIN' : user?.role === 'TEACHER' ? 'TEACHER' : 'PRO'}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.roleLabel}>
                        {user?.role === 'TEACHER' ? 'Instructor Portal' : user?.role === 'ADMIN' ? 'Admin Control' : 'Student Hub'}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Banner Carousel */}
            <View style={styles.carouselContainer}>
                <LinearGradient
                    colors={banners[currentBannerIndex].colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.bannerCard}
                >
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerSubtitle}>{banners[currentBannerIndex].subtitle}</Text>
                        <Text style={styles.bannerTitle}>{banners[currentBannerIndex].title}</Text>
                    </View>
                    <View style={styles.bannerPagination}>
                        {banners.map((_, i) => (
                            <View
                                key={i}
                                style={[styles.pagDot, i === currentBannerIndex && styles.pagDotActive]}
                            />
                        ))}
                    </View>
                </LinearGradient>
            </View>
        </LinearGradient>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#dc2626" />}
                showsVerticalScrollIndicator={false}
            >
                {renderHeader()}

                <View style={styles.content}>
                    {user?.role === 'STUDENT' && (
                        <View style={styles.statsOverview}>
                            <View style={styles.statCardSmall}>
                                <LinearGradient colors={['#3b82f6', '#1e3a8a']} style={styles.statCardGradient}>
                                    <Ionicons name="stats-chart" size={24} color="#fff" />
                                    <Text style={styles.statCardValue}>{Math.round(results.reduce((a, b) => a + (b.accuracy || 0), 0) / results.length) || 0}%</Text>
                                    <Text style={styles.statCardLabel}>Avg. Accuracy</Text>
                                </LinearGradient>
                            </View>
                            <View style={styles.statCardSmall}>
                                <LinearGradient colors={['#10b981', '#065f46']} style={styles.statCardGradient}>
                                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                    <Text style={styles.statCardValue}>{results.length}</Text>
                                    <Text style={styles.statCardLabel}>Tests Taken</Text>
                                </LinearGradient>
                            </View>
                        </View>
                    )}

                    {!isPro && !isStaff && user?.role === 'STUDENT' && (
                        <TouchableOpacity
                            style={styles.proBanner}
                            onPress={() => navigation.navigate('Payment')}
                        >
                            <LinearGradient
                                colors={['#f59e0b', '#dc2626']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.proBannerGradient}
                            >
                                <View>
                                    <Text style={styles.proBannerTitle}>Unlock Everything</Text>
                                    <Text style={styles.proBannerDesc}>Get unlimited tests & pro analytics</Text>
                                </View>
                                <Ionicons name="star" size={24} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    <Text style={styles.sectionTitle}>Main Menu</Text>

                    <View style={styles.gridContainer}>
                        <TouchableOpacity
                            style={styles.gridItem}
                            onPress={() => navigation.navigate('TestLibrary')}
                        >
                            <LinearGradient colors={['#fee2e2', '#fff']} style={styles.gridIconBg}>
                                <Ionicons name="document-text" size={32} color="#dc2626" />
                            </LinearGradient>
                            <Text style={styles.gridLabel}>Mock Tests</Text>
                            <Text style={styles.gridSub}>Topic-wise exams</Text>
                        </TouchableOpacity>

                        {isStaff && (
                            <TouchableOpacity
                                style={styles.gridItem}
                                onPress={() => navigation.navigate('CreateTest')}
                            >
                                <LinearGradient colors={['#ede9fe', '#fff']} style={styles.gridIconBg}>
                                    <Ionicons name="add-circle" size={32} color="#7c3aed" />
                                </LinearGradient>
                                <Text style={styles.gridLabel}>Create Test</Text>
                                <Text style={styles.gridSub}>Add new content</Text>
                            </TouchableOpacity>
                        )}

                        {!isStaff && (
                            <TouchableOpacity
                                style={styles.gridItem}
                                onPress={() => Alert.alert("Coming Soon", "The mobile version of the Syllabus is coming in the next update!")}
                            >
                                <LinearGradient colors={['#e0e7ff', '#fff']} style={styles.gridIconBg}>
                                    <Ionicons name="book" size={32} color="#1e3a8a" />
                                </LinearGradient>
                                <Text style={styles.gridLabel}>Syllabus</Text>
                                <Text style={styles.gridSub}>Track progress</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.gridItem}
                            onPress={() => isStaff ? navigation.navigate('ManageTests') : Alert.alert("Coming Soon", "Live classes are coming soon!")}>
                            <LinearGradient colors={['#fef3c7', '#fff']} style={styles.gridIconBg}>
                                <Ionicons name={isStaff ? "list" : "school"} size={32} color="#d97706" />
                            </LinearGradient>
                            <Text style={styles.gridLabel}>{isStaff ? "My Tests" : "Classes"}</Text>
                            <Text style={styles.gridSub}>{isStaff ? "Manage content" : "Live learning"}</Text>
                        </TouchableOpacity>

                        {isStaff && (
                            <TouchableOpacity
                                style={styles.gridItem}
                                onPress={() => navigation.navigate('TopicManagement')}>
                                <LinearGradient colors={['#dcfce7', '#fff']} style={styles.gridIconBg}>
                                    <Ionicons name="folder-open" size={32} color="#059669" />
                                </LinearGradient>
                                <Text style={styles.gridLabel}>Topics</Text>
                                <Text style={styles.gridSub}>Organize content</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.gridItem}
                            onPress={() => navigation.navigate('Analytics')}
                        >
                            <LinearGradient colors={['#f0fdf4', '#fff']} style={styles.gridIconBg}>
                                <Ionicons name="stats-chart" size={32} color="#166534" />
                            </LinearGradient>
                            <Text style={styles.gridLabel}>Analytics</Text>
                            <Text style={styles.gridSub}>Performance</Text>
                        </TouchableOpacity>
                    </View>

                    {user?.role === 'STUDENT' && Array.isArray(results) && results.length > 0 && (
                        <View style={styles.recentSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recent Progress</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
                                    <Text style={styles.viewAll}>View Details</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.statsCard}>
                                <View style={styles.statLine}>
                                    <Text style={styles.statName}>Tests Taken</Text>
                                    <Text style={styles.statValue}>{results.length}</Text>
                                </View>
                                <View style={styles.avgBarContainer}>
                                    <View style={[styles.avgBar, { width: `${Math.min(100, (results.reduce((a, b) => a + (b.accuracy || 0), 0) / results.length) || 0)}%` }]} />
                                </View>
                                <Text style={styles.statHint}>Average Accuracy: {Math.round(results.reduce((a, b) => a + (b.accuracy || 0), 0) / results.length) || 0}%</Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerGradient: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    proBadge: {
        backgroundColor: '#fbbf24',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    proText: {
        color: '#92400e',
        fontSize: 10,
        fontWeight: 'bold',
    },
    roleLabel: {
        fontSize: 14,
        color: '#ffffffcc',
        marginTop: 2,
    },
    logoutBtn: {
        padding: 8,
        backgroundColor: '#ffffff20',
        borderRadius: 12,
    },
    carouselContainer: {
        height: 180,
        width: '100%',
        marginTop: 10,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    bannerCard: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    bannerContent: {
        flex: 1,
        justifyContent: 'center',
    },
    bannerSubtitle: {
        color: '#ffffffcc',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        lineHeight: 32,
    },
    bannerPagination: {
        flexDirection: 'row',
        gap: 6,
    },
    pagDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ffffff40',
    },
    pagDotActive: {
        width: 20,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
        marginTop: -10, // Slight overlap with header
    },
    proBanner: {
        marginBottom: 30,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
    },
    proBannerGradient: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    proBannerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    proBannerDesc: {
        color: '#ffffffcc',
        fontSize: 12,
        marginTop: 4,
    },
    statsOverview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 30,
    },
    statCardSmall: {
        flex: 1,
        height: 120,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    statCardGradient: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statCardValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    statCardLabel: {
        color: '#ffffffcc',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 20,
        letterSpacing: 0.5,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    gridItem: {
        width: '47%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    gridIconBg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    gridLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    gridSub: {
        fontSize: 11,
        color: '#64748b',
        textAlign: 'center',
    },
    recentSection: {
        marginTop: 40,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAll: {
        color: '#dc2626',
        fontWeight: 'bold',
        fontSize: 14,
    },
    statsCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    statLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statName: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    avgBarContainer: {
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        marginBottom: 12,
        overflow: 'hidden',
    },
    avgBar: {
        height: '100%',
        backgroundColor: '#22c55e',
        borderRadius: 4,
    },
    statHint: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
});
