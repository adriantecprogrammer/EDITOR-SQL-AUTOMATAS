import axiosInstance from './axiosInstance';
import type { IGeneradorSQL } from '../Interfaces/IGeneradorSQL';

export const sqlApi = {
	async createSql(sql: string): Promise<IGeneradorSQL> {
		console.log('Sending raw SQL to parser:', sql);
		try {
			const response = await axiosInstance.post<IGeneradorSQL>('/parser/json', sql, {
				headers: {
					'Content-Type': 'text/plain'
				}
			});
			console.log('Response body:', response.data);
			return response.data;
		} catch (error) {
			console.error('API Error details:', error);
			throw error;
		}
	},
	async createBD(sql: string) {
		try {
			const response = await axiosInstance.post('/createBD', sql, {
				headers: {
					'Content-Type': 'text/plain'
				}
			});
			console.log('Response body:', response.data);
			return response.data;
		} catch (error) {
			console.error('API Error details:', error);
			throw error;
		}
	},
	async createCRUD(sql: string, tabla?: string) {
		try {
			const params = tabla ? { tabla } : {};
			const response = await axiosInstance.post('/generarCRUD', sql, {
				params,
				headers: {
					'Content-Type': 'text/plain'
				}
			});
			console.log('Response body:', response.data);
			return response.data;
		} catch (error) {
			console.error('API Error details:', error);
			throw error;
		}
	}
};
