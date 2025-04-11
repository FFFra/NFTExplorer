import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/Home';
import DetailScreen from '../screens/Detail';

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

const MainTabs = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="Explore"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            {/* We'll implement these screens later */}
            <Tab.Screen
                name="Favorites"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Tab.Screen
                name="Settings"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
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
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
