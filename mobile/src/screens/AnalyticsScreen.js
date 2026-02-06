import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { resultService } from '../services/result';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen({ navigation }) {
    // usePreventScreenCapture(); // Temporarily disabled for client demo
    const [stats, setStats] = useState({
        totalTests: 0,
        averageScore: 0,
        bestCategory: 'N/A',
        recentPerformance: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const results = await resultService.getMyResults();
            if (results && results.length > 0) {
                const total = results.length;
                const avg = results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / total;

                // Group by category to find best
                const categories = {};
                results.forEach(r => {
                    const cat = r.category || 'General';
                    categories[cat] = (categories[cat] || 0) + (r.percentage || 0);
                });
                let best = 'General';
                let maxAvg = 0;
                Object.keys(categories).forEach(cat => {
                    const count = results.filter(r => (r.category || 'General') === cat).length;
                    const catAvg = categories[cat] / count;
                    if (catAvg > maxAvg) {
                        maxAvg = catAvg;
                        best = cat;
                    }
                });

                setStats({
                    totalTests: total,
                    averageScore: Math.round(avg),
                    bestCategory: best,
                    recentPerformance: results.slice(0, 5)
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Performance Analytics</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <LinearGradient
                    colors={['#dc2626', '#1e3a8a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
                    <View style={styles.heroStat}>
                        <Text style={styles.heroLabel}>Average Score</Text>
                        <Text style={styles.heroValue}>{stats.averageScore}%</Text>
                    </View>
                    <View style={styles.heroDivider} />
                    <View style={styles.heroStat}>
                        <Text style={styles.heroLabel}>Total Tests</Text>
                        <Text style={styles.heroValue}>{stats.totalTests}</Text>
                    </View>
                </LinearGradient>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Key Insights</Text>
                    <View style={styles.insightGrid}>
                        <View style={styles.insightCard}>
                            <Ionicons name="trophy-outline" size={24} color="#f59e0b" />
                            <Text style={styles.insightLabel}>Best Topic</Text>
                            <Text style={styles.insightValue}>{stats.bestCategory}</Text>
                        </View>
                        <View style={styles.insightCard}>
                            <Ionicons name="time-outline" size={24} color="#3b82f6" />
                            <Text style={styles.insightLabel}>Focus Area</Text>
                            <Text style={styles.insightValue}>Speed</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Progress</Text>
                    {stats.recentPerformance.length > 0 ? (
                        stats.recentPerformance.map((res, i) => (
                            <View key={i} style={styles.historyRow}>
                                <View style={styles.historyInfo}>
                                    <Text style={styles.historyTitle} numberOfLines={1}>
                                        {res.testTitle || 'Mock Exam'}
                                    </Text>
                                    <Text style={styles.historyDate}>
                                        {new Date(res.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={[styles.scoreBadge, { backgroundColor: (res.percentage || 0) >= 40 ? '#dcfce7' : '#fee2e2' }]}>
                                    <Text style={[styles.scoreText, { color: (res.percentage || 0) >= 40 ? '#166534' : '#991b1b' }]}>
                                        {res.percentage}%
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>No recent tests found.</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginLeft: 16,
    },
    scrollContent: {
        padding: 20,
    },
    heroCard: {
        flexDirection: 'row',
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    heroStat: {
        flex: 1,
        alignItems: 'center',
    },
    heroLabel: {
        color: '#ffffffcc',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    heroValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 8,
    },
    heroDivider: {
        width: 1,
        height: '60%',
        backgroundColor: '#ffffff30',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    insightGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    insightCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    insightLabel: {
        color: '#64748b',
        fontSize: 12,
        marginTop: 8,
    },
    insightValue: {
        color: '#1e293b',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 4,
    },
    historyRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    historyInfo: {
        flex: 1,
        marginRight: 10,
    },
    historyTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    historyDate: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    scoreBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    scoreText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyBox: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#64748b',
        fontSize: 14,
    },
});
