import axiosInstance from './axiosInstance';

export const sqlApi = {
	async createSql(sql: string) {
		const response = await axiosInstance.post('/sql', { sql });
		return response.data;
	}
};
