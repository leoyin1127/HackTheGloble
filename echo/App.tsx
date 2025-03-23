import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { AuthProvider } from './app/context/AuthContext';
import { ThemeProvider } from './app/context/ThemeContext';
import { ProductProvider } from './app/context/ProductContext';
import AppNavigator from './app/navigation/AppNavigator';
import api from './app/utils/api';

const App = () => {
  useEffect(() => {
    // Configure API URL based on platform and environment
    const configureApiUrl = () => {
      const isDevice = !__DEV__ || Platform.OS === 'web';

      // Server is running on port 3000
      if (isDevice) {
        // For physical devices, use your computer's IP address instead of localhost
        // Replace this with your actual local IP address when testing on real devices
        api.setApiBaseUrl('http://192.168.1.X:3000'); // ← CHANGE THIS to your local IP
      } else {
        // For simulators/emulators, localhost works but use correct port
        api.setApiBaseUrl('http://localhost:3000');
      }

      console.log(`API configured to: ${api.baseUrl}`);
    };

    configureApiUrl();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ProductProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <AppNavigator />
            </NavigationContainer>
          </ProductProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
