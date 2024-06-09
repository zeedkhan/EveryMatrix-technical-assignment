import { backendURL } from '@/config';
import axios from 'axios';

export default axios.create({
    baseURL: backendURL
});

export const axiosPrivate = axios.create({
    baseURL: backendURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});