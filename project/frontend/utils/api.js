import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get API URL from environment or use platform-specific defaults
const getApiUrl = () => {
    // Check for production environment variable first
    const envApiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
    if (envApiUrl) {
        return envApiUrl;
    }

    // Development fallbacks
    if (Platform.OS === 'web' || Platform.OS === 'ios') {
        return 'http://localhost:8000/api';
    }
    // Android emulator
    return 'http://10.0.2.2:8000/api';
};

const API_URL = getApiUrl();

// Create instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // We can optionally trigger a logout action here via an event emitter
            // or just let the UI handle the failure. 
            // For now, removing the token to force re-login on next app start/check.
            await AsyncStorage.removeItem('userToken');
        }
        return Promise.reject(error);
    }
);

export default api;
