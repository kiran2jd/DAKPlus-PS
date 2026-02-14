import React, { useEffect, useState, useCallback } from 'react';
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
    Dimensions,
    Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { authService } from '../services/auth';
import { testService } from '../services/test';
import { resultService } from '../services/result';
import { topicService } from '../services/topic';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import logo from '../../assets/logo.jpg';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
    // usePreventScreenCapture(); // Temporarily disabled for client demo
    const [user, setUser] = useState(null);
    const [results, setResults] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
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
                    const [userResults, lbData] = await Promise.all([
                        resultService.getResultsByUser(userId),
                        resultService.getLeaderboard('weekly')
                    ]);
                    setResults(userResults);
                    setLeaderboard(lbData);
                }
            }
        } catch (err) {
            console.error("Dashboard load error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const isPro = user?.subscriptionTier === 'PREMIUM' || user?.role === 'ADMIN' || user?.role === 'TEACHER';
    const isStaff = user?.role === 'ADMIN' || user?.role === 'TEACHER';

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#dc2626" />
            </View>
        );
    }

    const renderHeader = () => (
        <View style={styles.headerWrapper}>
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.headerIconButton}
                    onPress={() => navigation.openDrawer()}
                >
                    <Ionicons name="menu-outline" size={28} color="#fff" />
                </TouchableOpacity>
                <Image source={logo} style={styles.logoMini} resizeMode="contain" />
                <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('Analytics')}>
                    <Ionicons name="notifications-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.welcomeTextSection}>
                <Text style={styles.greetingText}>Welcome back,</Text>
                <Text style={styles.nameHeader}>{user?.fullName || 'Dak Plus Aspirant'}</Text>
            </View>

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
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#0f172a']}
                style={StyleSheet.absoluteFillObject}
            />
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#dc2626" />}
                    showsVerticalScrollIndicator={false}
                >
                    {renderHeader()}

                    <View style={styles.content}>
                        {user?.role === 'STUDENT' && (
                            <View style={styles.progressSection}>
                                <Text style={styles.sectionTitle}>Course Progress</Text>
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressHeader}>
                                        <Text style={styles.progressLabel}>Mock Tests Completed</Text>
                                        <Text style={styles.progressValue}>{results.length}/10</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <LinearGradient
                                            colors={['#22c55e', '#16a34a']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={[styles.progressBarFill, { width: `${Math.min(100, (results.length / 10) * 100)}%` }]}
                                        />
                                    </View>
                                    <Text style={styles.progressGoal}>Goal: 10 Tests</Text>
                                </View>
                            </View>
                        )}

                        {user?.role === 'STUDENT' && (
                            <View style={styles.statsOverview}>
                                <View style={styles.statCardSmall}>
                                    <LinearGradient colors={['#3b82f6', '#1e3a8a']} style={styles.statCardGradient}>
                                        <Ionicons name="stats-chart" size={24} color="#fff" />
                                        <Text style={styles.statCardValue}>{Math.round(results.reduce((a, b) => a + (b.accuracy || 0), 0) / (results.length || 1))}%</Text>
                                        <Text style={styles.statCardLabel}>Accuracy</Text>
                                    </LinearGradient>
                                </View>
                                <View style={styles.statCardSmall}>
                                    <LinearGradient colors={['#ef4444', '#991b1b']} style={styles.statCardGradient}>
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
                                <LinearGradient colors={['rgba(220, 38, 38, 0.2)', 'rgba(249, 115, 22, 0.2)']} style={styles.gridIconBg}>
                                    <Ionicons name="document-text" size={28} color="#dc2626" />
                                </LinearGradient>
                                <Text style={styles.gridLabel}>Mock Tests</Text>
                                <Text style={styles.gridSub}>Topic-wise exams</Text>
                            </TouchableOpacity>

                            {isStaff && (
                                <TouchableOpacity
                                    style={styles.gridItem}
                                    onPress={() => navigation.navigate('CreateTest')}
                                >
                                    <LinearGradient colors={['rgba(124, 58, 237, 0.2)', 'rgba(139, 92, 246, 0.2)']} style={styles.gridIconBg}>
                                        <Ionicons name="add-circle" size={28} color="#7c3aed" />
                                    </LinearGradient>
                                    <Text style={styles.gridLabel}>Create Test</Text>
                                    <Text style={styles.gridSub}>Add new content</Text>
                                </TouchableOpacity>
                            )}

                            {!isStaff && (
                                <TouchableOpacity
                                    style={styles.gridItem}
                                    onPress={() => Alert.alert("Coming Soon", "Mobile Syllabus tracking is in development!")}
                                >
                                    <LinearGradient colors={['rgba(30, 58, 138, 0.2)', 'rgba(59, 130, 246, 0.2)']} style={styles.gridIconBg}>
                                        <Ionicons name="book" size={28} color="#3b82f6" />
                                    </LinearGradient>
                                    <Text style={styles.gridLabel}>Syllabus</Text>
                                    <Text style={styles.gridSub}>Track progress</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={styles.gridItem}
                                onPress={() => isStaff ? navigation.navigate('ManageTests') : Alert.alert("Coming Soon", "Live classes are starting soon!")}>
                                <LinearGradient colors={['rgba(217, 119, 6, 0.2)', 'rgba(245, 158, 11, 0.2)']} style={styles.gridIconBg}>
                                    <Ionicons name={isStaff ? "list" : "school"} size={28} color="#f59e0b" />
                                </LinearGradient>
                                <Text style={styles.gridLabel}>{isStaff ? "My Tests" : "Classes"}</Text>
                                <Text style={styles.gridSub}>{isStaff ? "Manage learning" : "Live learning"}</Text>
                            </TouchableOpacity>

                            {isStaff && (
                                <TouchableOpacity
                                    style={styles.gridItem}
                                    onPress={() => navigation.navigate('TopicManagement')}>
                                    <LinearGradient colors={['rgba(5, 150, 105, 0.2)', 'rgba(16, 185, 129, 0.2)']} style={styles.gridIconBg}>
                                        <Ionicons name="folder-open" size={28} color="#10b981" />
                                    </LinearGradient>
                                    <Text style={styles.gridLabel}>Topics</Text>
                                    <Text style={styles.gridSub}>Organize content</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={styles.gridItem}
                                onPress={() => navigation.navigate('Analytics')}
                            >
                                <LinearGradient colors={['rgba(22, 101, 52, 0.2)', 'rgba(34, 197, 94, 0.2)']} style={styles.gridIconBg}>
                                    <Ionicons name="stats-chart" size={28} color="#22c55e" />
                                </LinearGradient>
                                <Text style={styles.gridLabel}>Analytics</Text>
                                <Text style={styles.gridSub}>Performance</Text>
                            </TouchableOpacity>
                        </View>

                        {user?.role === 'STUDENT' && leaderboard?.length > 0 && (
                            <View style={styles.recentSection}>
                                <Text style={styles.sectionTitle}>Weekly Top Aspirants</Text>
                                <View style={styles.leaderboardCard}>
                                    {leaderboard.slice(0, 3).map((item, index) => (
                                        <View key={item.userId} style={styles.leaderboardRow}>
                                            <View style={styles.rankBadge}>
                                                <Text style={styles.rankText}>{index + 1}</Text>
                                            </View>
                                            <View style={styles.leaderboardInfo}>
                                                <Text style={styles.leaderboardName}>{item.name}</Text>
                                                <Text style={styles.leaderboardScore}>{item.totalScore} pts</Text>
                                            </View>
                                            {item.userId === (user?.id || user?._id) && (
                                                <View style={styles.youBadge}>
                                                    <Text style={styles.youText}>YOU</Text>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerWrapper: {
        paddingTop: 10,
        paddingHorizontal: 20,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerIconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    welcomeTextSection: {
        marginBottom: 24,
    },
    greetingText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
    },
    nameHeader: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        marginTop: 4,
    },
    logoMini: {
        width: 40,
        height: 40,
        borderRadius: 10,
    },
    carouselContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        height: 150,
    },
    bannerCard: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
    },
    bannerSubtitle: {
        color: '#ffffffcc',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 4,
    },
    pagDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    pagDotActive: {
        width: 20,
        backgroundColor: '#fff',
    },
    bannerPagination: {
        flexDirection: 'row',
        gap: 6,
    },
    content: {
        padding: 20,
    },
    progressSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    progressContainer: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    progressLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#94a3b8',
    },
    progressValue: {
        fontSize: 13,
        fontWeight: '900',
        color: '#ef4444',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressGoal: {
        fontSize: 10,
        color: '#475569',
        fontWeight: '600',
    },
    statsOverview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
    },
    statCardSmall: {
        flex: 1,
        height: 90,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statCardGradient: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statCardValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 2,
    },
    statCardLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    proBanner: {
        marginBottom: 24,
        borderRadius: 18,
        overflow: 'hidden',
    },
    proBannerGradient: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
    },
    proBannerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
    proBannerDesc: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        marginTop: 2,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    gridItem: {
        width: '48%',
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    gridIconBg: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    gridLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    gridSub: {
        fontSize: 9,
        color: '#64748b',
        textAlign: 'center',
    },
    recentSection: {
        marginTop: 10,
    },
    leaderboardCard: {
        backgroundColor: 'rgba(255,255,255,0.01)',
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    rankBadge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    rankText: {
        fontWeight: '900',
        color: '#ef4444',
        fontSize: 11,
    },
    leaderboardInfo: {
        flex: 1,
    },
    leaderboardName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
    leaderboardScore: {
        fontSize: 11,
        color: '#64748b',
    },
    youBadge: {
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    youText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#38bdf8',
    },
});
