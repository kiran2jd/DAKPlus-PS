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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { testService } from '../services/test';
import { topicService } from '../services/topic';
import { authService } from '../services/auth';

export default function TestLibraryScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [tests, setTests] = useState([]);
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [subtopics, setSubtopics] = useState([]);
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const userData = await authService.getUser();
            setUser(userData);

            const [topicsData, testsData] = await Promise.all([
                topicService.getAllTopics(),
                testService.getAvailableTests()
            ]);

            setTopics(topicsData);
            setTests(testsData);
        } catch (err) {
            console.error("Load Library error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTopicSelect = async (topicId) => {
        if (selectedTopic === topicId) {
            setSelectedTopic(null);
            setSubtopics([]);
            setSelectedSubtopic(null);
        } else {
            setSelectedTopic(topicId);
            const sub = await topicService.getSubtopics(topicId);
            setSubtopics(sub);
            setSelectedSubtopic(null);
        }
    };

    const isPro = user?.subscriptionTier === 'PREMIUM' || user?.role === 'ADMIN' || user?.role === 'TEACHER';

    const renderTestItem = ({ item }) => {
        const isPremium = item.premium || item.isPremium;
        const isLocked = isPremium && !isPro;

        return (
            <TouchableOpacity
                style={[styles.testCard, isLocked && styles.lockedCard]}
                onPress={() => isLocked ? navigation.navigate('Payment') : navigation.navigate('TakeTest', { testId: item.id })}
            >
                <View style={styles.testHeader}>
                    <View style={[styles.badge, { backgroundColor: item.difficulty === 'Hard' ? '#ef444420' : '#22c55e20' }]}>
                        <Text style={[styles.badgeText, { color: item.difficulty === 'Hard' ? '#ef4444' : '#22c55e' }]}>
                            {item.difficulty || 'Medium'}
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        {isLocked && <Ionicons name="lock-closed" size={16} color="#64748b" style={{ marginRight: 8 }} />}
                        <Text style={styles.durationText}>{item.durationMinutes || item.duration_minutes} mins</Text>
                    </View>
                </View>

                <Text style={styles.testTitle}>
                    {isPremium && <Text style={{ color: '#f59e0b' }}>[PRO] </Text>}
                    {item.title}
                </Text>

                <Text style={styles.testDesc} numberOfLines={2}>{item.description}</Text>

                <View style={styles.testFooter}>
                    <Text style={styles.categoryText}>{item.category || 'General'}</Text>
                    <View style={[styles.startButton, isLocked ? { backgroundColor: '#94a3b8' } : null]}>
                        <Text style={styles.startButtonText}>{isLocked ? 'Unlock PRO' : 'Start Test'}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#dc2626" />
            </View>
        );
    }

    const filteredTests = tests.filter(test => {
        const matchesTopic = !selectedTopic || test.topicId === selectedTopic;
        const matchesSubtopic = !selectedSubtopic || test.subtopicId === selectedSubtopic;
        return matchesTopic && matchesSubtopic;
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Test Library</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.filterSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicScroll}>
                    {topics.map(topic => (
                        <TouchableOpacity
                            key={topic.id}
                            style={[styles.topicChip, selectedTopic === topic.id && styles.topicChipActive]}
                            onPress={() => handleTopicSelect(topic.id)}
                        >
                            <Text style={[styles.topicChipText, selectedTopic === topic.id && styles.topicChipTextActive]}>
                                {topic.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {selectedTopic && subtopics.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subtopicScroll}>
                        {subtopics.map(sub => (
                            <TouchableOpacity
                                key={sub.id}
                                style={[styles.subChip, selectedSubtopic === sub.id && styles.subChipActive]}
                                onPress={() => setSelectedSubtopic(selectedSubtopic === sub.id ? null : sub.id)}
                            >
                                <Text style={[styles.subChipText, selectedSubtopic === sub.id && styles.subChipTextActive]}>
                                    {sub.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            <FlatList
                data={filteredTests}
                keyExtractor={(item) => item.id}
                renderItem={renderTestItem}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={
                    !isPro && user?.role === 'STUDENT' ? (
                        <TouchableOpacity
                            style={styles.libraryProBanner}
                            onPress={() => navigation.navigate('Payment')}
                        >
                            <LinearGradient
                                colors={['#dc2626', '#b91c1c']}
                                style={styles.proBannerGradient}
                            >
                                <Ionicons name="sparkles" size={24} color="#fff" />
                                <View style={styles.proBannerTextContainer}>
                                    <Text style={styles.proBannerTitle}>Unlock Everything!</Text>
                                    <Text style={styles.proBannerSub}>Get unlimited access to specialized tests & premium content.</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No tests found for this selection.</Text>
                    </View>
                }
            />
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    filterSection: {
        backgroundColor: '#fff',
        paddingBottom: 8,
    },
    topicScroll: {
        paddingHorizontal: 16,
        marginVertical: 12,
    },
    topicChip: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    topicChipActive: {
        backgroundColor: '#dc2626',
        borderColor: '#dc2626',
    },
    topicChipText: {
        color: '#64748b',
        fontWeight: 'bold',
    },
    topicChipTextActive: {
        color: '#fff',
    },
    subtopicScroll: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    subChip: {
        backgroundColor: '#f8fafc',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 15,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    subChipActive: {
        backgroundColor: '#1E3A8A',
        borderColor: '#1E3A8A',
    },
    subChipText: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '600',
    },
    subChipTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 16,
    },
    testCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    lockedCard: {
        opacity: 0.8,
        backgroundColor: '#f8fafc',
    },
    testHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    durationText: {
        color: '#64748b',
        fontSize: 12,
    },
    testTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    testDesc: {
        color: '#64748b',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    testFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
    },
    categoryText: {
        color: '#dc2626',
        fontSize: 12,
        fontWeight: '600',
    },
    startButton: {
        backgroundColor: '#dc2626',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    startButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
    },
    libraryProBanner: {
        marginTop: 10,
        marginBottom: 30,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    proBannerGradient: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    proBannerTextContainer: {
        flex: 1,
        marginHorizontal: 15,
    },
    proBannerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    proBannerSub: {
        color: '#fffa',
        fontSize: 12,
        lineHeight: 16,
    },
});
