import axios from 'axios';
import { Platform } from 'react-native';

// Lấy URL từ biến môi trường (Configured in root .env)
const BASE_URL = Platform.OS === 'android' 
  ? (process.env.EXPO_PUBLIC_API_URL_ANDROID || 'http://192.168.100.54:3000/api')
  : (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.54:3000/api');

console.log('Mobile API BaseURL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
