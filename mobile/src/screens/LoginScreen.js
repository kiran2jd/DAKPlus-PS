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
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/auth';
import logo from '../../assets/logo.jpg';

export default function LoginScreen({ navigation }) {
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
    const [step, setStep] = useState('input'); // 'input' or 'otp-verify'

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [persistent, setPersistent] = useState(true); // Default to persistent

    // Clear state on mount (logout cleanup)
    React.useEffect(() => {
        setIdentifier('');
        setPassword('');
        setPhone('');
        setOtp('');
    }, []);

    const handlePasswordLogin = async () => {
        if (!identifier || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }
        setLoading(true);
        try {
            await authService.login(identifier, password, persistent);
            navigation.replace('Main');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Check your internet connection';
            const diagnosticInfo = `URL: ${err.config?.url || 'Unknown'}\nStatus: ${err.response?.status || 'No Response'}`;
            Alert.alert(
                'Login Failed',
                `${errorMsg}\n\nTechnical Details:\n${diagnosticInfo}`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!phone) {
            Alert.alert('Error', 'Please enter your phone number');
            return;
        }

        // Phone Regex: 10-15 digits
        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(phone)) {
            Alert.alert('Error', 'Please enter a valid 10-15 digit phone number');
            return;
        }

        setLoading(true);
        try {
            await authService.sendOtp(phone);
            setStep('otp-verify');
        } catch (err) {
            const errorMsg = err.message || 'Network Error';
            const diagnosticInfo = `URL: ${err.config?.url || 'Unknown'}\nStatus: ${err.response?.status || 'No Response'}`;
            Alert.alert(
                'Error',
                `Failed to send OTP: ${errorMsg}\n\nTechnical Details:\n${diagnosticInfo}`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }
        setLoading(true);
        try {
            const data = await authService.verifyOtp(phone, otp, persistent);
            if (data.is_new_user) {
                navigation.navigate('Register', { phoneNumber: phone });
            } else {
                navigation.replace('Main');
            }
        } catch (err) {
            Alert.alert('Error', 'Invalid OTP');
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
                    <Image source={logo} style={styles.logoImage} resizeMode="contain" />
                    <Text style={styles.title}>Dak Plus</Text>
                    <Text style={styles.subtitle}>Advanced Learning & Assessment</Text>
                </View>

                <View style={styles.card}>
                    {step === 'input' && (
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, loginMethod === 'password' ? styles.activeTab : null]}
                                onPress={() => setLoginMethod('password')}
                            >
                                <Text style={[styles.tabText, loginMethod === 'password' ? styles.activeTabText : null]}>Password</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, loginMethod === 'otp' ? styles.activeTab : null]}
                                onPress={() => setLoginMethod('otp')}
                            >
                                <Text style={[styles.tabText, loginMethod === 'otp' ? styles.activeTabText : null]}>OTP</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 'input' ? (
                        loginMethod === 'password' ? (
                            <View style={styles.form}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email or Phone"
                                    placeholderTextColor="#999"
                                    value={identifier}
                                    onChangeText={setIdentifier}
                                    autoCapitalize="none"
                                />
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Password"
                                        placeholderTextColor="#999"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#64748b" />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    style={styles.checkboxContainer}
                                    onPress={() => setPersistent(!persistent)}
                                >
                                    <View style={[styles.checkbox, persistent && styles.checkboxChecked]}>
                                        {persistent && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Keep me signed in</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={handlePasswordLogin} disabled={loading}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.form}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone Number (+1234567890)"
                                    placeholderTextColor="#999"
                                    value={phone}
                                    onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                                    keyboardType="phone-pad"
                                    maxLength={15}
                                />
                                <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
                                </TouchableOpacity>
                            </View>
                        )
                    ) : (
                        <View style={styles.form}>
                            <Text style={styles.label}>Enter 6-digit OTP sent to {phone}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="000000"
                                placeholderTextColor="#999"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setPersistent(!persistent)}
                            >
                                <View style={[styles.checkbox, persistent && styles.checkboxChecked]}>
                                    {persistent && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <Text style={styles.checkboxLabel}>Keep me signed in</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setStep('input')} style={styles.secondaryButton}>
                                <Text style={styles.secondaryButtonText}>Back to login</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register', {
                            identifier: loginMethod === 'password' ? identifier : phone
                        })}>
                            <Text style={styles.footerLink}>Sign Up</Text>
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
    logoImage: {
        width: 180,
        height: 60,
        marginBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#dc2626', // Postal Red
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 5,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        color: '#64748b',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#dc2626',
    },
    form: {
        gap: 16,
    },
    label: {
        color: '#475569',
        textAlign: 'center',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        padding: 16,
        color: '#1e293b',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        color: '#1e293b',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 12,
    },
    button: {
        backgroundColor: '#dc2626',
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    footerText: {
        color: '#64748b',
        fontSize: 14,
    },
    footerLink: {
        color: '#dc2626',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
