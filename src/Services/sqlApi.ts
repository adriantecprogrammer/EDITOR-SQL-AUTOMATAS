import axiosInstance from './axiosInstance';

export const sqlApi = {
	async createSql(sql: string) {
		console.log('Sending raw SQL to parser:', sql);
		try {
			const response = await axiosInstance.post('/parser', sql, {
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
	}
};
