import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/auth';

export default function RegisterScreen({ navigation, route }) {
    const { phoneNumber, identifier } = route.params || {};
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState(phoneNumber || (identifier && !identifier.includes('@') ? identifier : ''));
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [postalCircle, setPostalCircle] = useState('');
    const [division, setDivision] = useState('');
    const [office, setOffice] = useState('');
    const [cadre, setCadre] = useState('');
    const [examType, setExamType] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Clear state on mount (but keep pre-filled data)
    React.useEffect(() => {
        setFullName('');
        if (identifier && identifier.includes('@')) {
            setEmail(identifier);
        } else {
            setEmail('');
        }
        setPassword('');
    }, []);

    const handleRegister = async () => {
        if (!fullName || !email || !password || !phone) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (fullName.trim().length < 3) {
            Alert.alert('Error', 'Full Name must be at least 3 characters long');
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        const phoneRegex = /^\d{10,15}$/;
        const cleanPhone = phone.replace(/[\s-]/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            Alert.alert('Error', 'Phone number must be between 10 and 15 digits');
            return;
        }

        setLoading(true);
        try {
            await authService.register({
                fullName,
                email,
                phoneNumber: phone.replace(/[^0-9]/g, ''),
                role: 'STUDENT',
                password,
                notificationsEnabled,
                postalCircle,
                division,
                office,
                cadre,
                examType
            });
            navigation.replace('Main');
        } catch (err) {
            console.error("Registration UI error:", err);
            Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome to DAKPlus</Text>
                    <Text style={styles.subtitle}>Complete your profile to get started</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor="#999"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="email@example.com"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+91 00000 00000"
                                placeholderTextColor="#999"
                                value={phone}
                                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                                keyboardType="phone-pad"
                                maxLength={15}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Create Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Minimum 6 characters"
                                    placeholderTextColor="#999"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                        >
                            <View style={[styles.checkbox, notificationsEnabled && styles.checkboxChecked]}>
                                {notificationsEnabled && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkboxLabel}>I want to receive exam updates and study tips</Text>
                        </TouchableOpacity>

                        {/* Professional Details Section */}
                        <View style={styles.divider} />
                        <Text style={styles.sectionTitle}>Professional Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Postal Circle</Text>
                            <View style={styles.pickerContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Others'].map(circle => (
                                        <TouchableOpacity
                                            key={circle}
                                            style={[styles.chip, postalCircle === circle ? styles.chipSelected : null]}
                                            onPress={() => setPostalCircle(circle)}
                                        >
                                            <Text style={[styles.chipText, postalCircle === circle ? styles.chipTextSelected : null]}>{circle}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Division</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Division"
                                placeholderTextColor="#999"
                                value={division}
                                onChangeText={setDivision}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Office</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Office Name"
                                placeholderTextColor="#999"
                                value={office}
                                onChangeText={setOffice}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Cadre</Text>
                            <View style={styles.pickerContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {['GDS', 'MTS', 'Postman', 'Mail Guard', 'PA/SA', 'Others'].map(item => (
                                        <TouchableOpacity
                                            key={item}
                                            style={[styles.chip, cadre === item ? styles.chipSelected : null]}
                                            onPress={() => setCadre(item)}
                                        >
                                            <Text style={[styles.chipText, cadre === item ? styles.chipTextSelected : null]}>{item}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Target Exam</Text>
                            <View style={styles.pickerContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {[
                                        'GDS to MTS',
                                        'GDS to Postman',
                                        'MTS to Postman',
                                        'GDS/MTS/Postman to PA/SA',
                                        'IP Exam',
                                        'Others'
                                    ].map(type => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[styles.chip, examType === type ? styles.chipSelected : null]}
                                            onPress={() => setExamType(type)}
                                        >
                                            <Text style={[styles.chipText, examType === type ? styles.chipTextSelected : null]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Start Learning Now</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.secondaryButton}>
                            <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#dc2626',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 5,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    form: {
        gap: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: '#475569',
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 14,
        color: '#1e293b',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    disabledInput: {
        opacity: 0.6,
        backgroundColor: '#f1f5f9',
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },
    activeRole: {
        borderColor: '#dc2626',
        backgroundColor: '#dc262610',
    },
    roleText: {
        color: '#64748b',
        fontWeight: '600',
    },
    activeRoleText: {
        color: '#dc2626',
    },
    button: {
        backgroundColor: '#dc2626',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        alignItems: 'center',
        marginTop: 12,
    },
    secondaryButtonText: {
        color: '#64748b',
        fontSize: 14,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        gap: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#dc2626',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#dc2626',
    },
    checkmark: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
    },
    pickerContainer: {
        marginBottom: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    chipSelected: {
        backgroundColor: '#dc2626',
        borderColor: '#dc2626',
    },
    chipText: {
        fontSize: 13,
        color: '#64748b',
    },
    chipTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
