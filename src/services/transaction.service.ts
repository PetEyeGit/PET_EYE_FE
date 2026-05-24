import apiClient from './apiClient';
import type { ApiResponse, TransactionResponse } from '../types/api';

export const transactionService = {
  getMyTransactions: async (): Promise<TransactionResponse[]> => {
    const { data } = await apiClient.get<ApiResponse<TransactionResponse[]>>('/transactions/my');
    return data.result;
  }
};
