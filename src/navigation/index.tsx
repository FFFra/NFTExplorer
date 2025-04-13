import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import HomeScreen from '../screens/Home';
import DetailScreen from '../screens/Detail';
import { useFeatureAlert } from '../hooks/useFeatureAlert';
import { styles } from './styles';

// Create placeholder screens for tabs that use feature alerts
const PlaceholderScreen = ({ title, alertFn }: { title: string, alertFn: () => void }) => {
    // Track whether we've shown the alert before to prevent duplicate alerts
    const hasShownAlert = React.useRef(false);

    // Use a short timeout to make sure the alert doesn't block navigation
    const showAlertWithDelay = React.useCallback(() => {
        if (!hasShownAlert.current) {
            // Small delay to ensure the screen is fully in focus before showing alert
            const timer = setTimeout(() => {
                alertFn();
                hasShownAlert.current = true;
            }, 300); // Small delay to prevent navigation issues

            return () => clearTimeout(timer);
        }
    }, [alertFn]);

    // Use this effect when the screen comes into focus
    useFocusEffect(showAlertWithDelay);

    return (
        <View style={styles.placeholderContainer}>
            <Ionicons
                name={title === 'Favorites' ? 'heart' : 'settings'}
                size={60}
                color="#3498db"
                style={styles.placeholderIcon}
            />
            <Text style={styles.placeholderTitle}>
                {title} feature coming soon!
            </Text>
            <Text style={styles.placeholderText}>
                This feature is currently under development and will be available in a future update.
            </Text>
        </View>
    );
};

export type RootStackParamList = {
    Main: undefined;
    Detail: { nftId: string };
};

export type MainTabParamList = {
    Explore: undefined;
    Favorites: undefined;
    Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// FavoritesScreen and SettingsScreen components with their respective alerts
const FavoritesScreen = () => {
    const { showFavoritesAlert } = useFeatureAlert();
    return <PlaceholderScreen title="Favorites" alertFn={showFavoritesAlert} />;
};

const SettingsScreen = () => {
    const { showSettingsAlert } = useFeatureAlert();
    return <PlaceholderScreen title="Settings" alertFn={showSettingsAlert} />;
};

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'help-outline';

                    if (route.name === 'Explore') {
                        iconName = focused ? 'compass' : 'compass-outline';
                    } else if (route.name === 'Favorites') {
                        iconName = focused ? 'heart' : 'heart-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={24} color={color} />;
                },
                tabBarActiveTintColor: '#3498db',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: styles.tabBar,
            })}
        >
            <Tab.Screen name="Explore" component={HomeScreen} />
            <Tab.Screen name="Favorites" component={FavoritesScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

const RootNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Main">
                <Stack.Screen
                    name="Main"
                    component={MainTabs}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Detail"
                    component={DetailScreen}
                    options={{
                        headerTransparent: true,
                        headerTitle: '',
                        headerBackTitle: 'Back',
                        animation: Platform.OS === 'android' ? 'slide_from_bottom' : undefined,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
