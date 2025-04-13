import 'react-native-reanimated';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation';
import { NFTProvider } from './src/context';
import { styles } from './App.styles';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <NFTProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </NFTProvider>
    </GestureHandlerRootView>
  );
}
