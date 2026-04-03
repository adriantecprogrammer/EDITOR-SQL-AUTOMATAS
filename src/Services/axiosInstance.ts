import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: '/api',
	headers: {
		'Content-Type': 'text/plain'
	}
});

axiosInstance.interceptors.request.use((config) => {
	console.log('API Request:', config.method?.toUpperCase(), config.baseURL, config.url, config.data);
	return config;
});

export default axiosInstance;
