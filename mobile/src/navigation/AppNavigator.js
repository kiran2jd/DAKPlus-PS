import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TestLibraryScreen from '../screens/TestLibraryScreen';
import TakeTestScreen from '../screens/TakeTestScreen';
import CreateTestScreen from '../screens/CreateTestScreen';
import EditTestScreen from '../screens/EditTestScreen';
import ResultScreen from '../screens/ResultScreen';
import PaymentScreen from '../screens/PaymentScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ManageTestsScreen from '../screens/ManageTestsScreen';
import TopicManagementScreen from '../screens/TopicManagementScreen';
import { authService } from '../services/auth';

import { createDrawerNavigator } from '@react-navigation/drawer';
import SideMenu from '../components/SideMenu';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function StudentDrawer() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <SideMenu {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: '80%',
                },
            }}
        >
            <Drawer.Screen name="Dashboard" component={DashboardScreen} />
            <Drawer.Screen name="TestLibrary" component={TestLibraryScreen} />
            <Drawer.Screen name="Analytics" component={AnalyticsScreen} />
        </Drawer.Navigator>
    );
}

export default function AppNavigator() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const authenticated = await authService.isAuthenticated();
            setIsAuthenticated(authenticated);
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#dc2626" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={isAuthenticated ? "Main" : "Welcome"}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />

                {/* Main Student App Flow */}
                <Stack.Screen name="Main" component={StudentDrawer} />

                {/* Other Screens */}
                <Stack.Screen name="TakeTest" component={TakeTestScreen} />
                <Stack.Screen name="Result" component={ResultScreen} />
                <Stack.Screen name="Payment" component={PaymentScreen} />
                <Stack.Screen name="ManageTests" component={ManageTestsScreen} />
                <Stack.Screen name="TopicManagement" component={TopicManagementScreen} />
                <Stack.Screen name="CreateTest" component={CreateTestScreen} />
                <Stack.Screen name="EditTest" component={EditTestScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
