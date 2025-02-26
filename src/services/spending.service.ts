import { api } from './api';
import { API_CONFIG } from '@/config/api.config';

// Define interfaces based on the API specifications
export interface SpendingCategory {
  id: number;
  name: string;
  description?: string;
}

export interface Spending {
  id: number;
  categoryId: number;
  categoryName?: string;
  userId: number;
  issueDate: string;
  amount: number;
  description: string;
}

// Request interfaces
export interface CreateSpendingRequest {
  amount: number;
  issueDate: string;
  categoryId: number;
  description: string;
}

export interface UpdateSpendingRequest {
  id: number;
  amount?: number;
  issueDate?: string;
  categoryId?: number;
  description?: string;
}

/**
 * Request interface for filtering spending records
 * Note: API has been updated to make fromDate, toDate optional and add categoryId filtering
 */
export interface GetSpendingsRequest {
  /** Optional - Start date in format: yyyyMMdd */
  fromDate?: string;
  /** Optional - End date in format: yyyyMMdd */
  toDate?: string;
  /** Optional - Filter by specific category ID (deprecated, use categoryIds) */
  categoryId?: number;
  /** Optional - Filter by multiple category IDs */
  categoryIds?: number[];
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export const spendingService = {
  /**
   * Get spending records with optional filters
   * @param filters Object containing filter parameters
   * - fromDate: string - Optional - Format: yyyyMMdd
   * - toDate: string - Optional - Format: yyyyMMdd
   * - categoryId: number - Optional - For direct category filtering
   * @returns Promise with array of spending records
   */
  getRecords: async (filters: GetSpendingsRequest) => {
    try {
      console.log('Fetching spending records with filters:', filters);
      
      // Create request body - only include properties that have values
      const requestBody: Record<string, any> = {};
      
      if (filters.fromDate) {
        requestBody.fromDate = filters.fromDate;
      }
      
      if (filters.toDate) {
        requestBody.toDate = filters.toDate;
      }
      
      // Add categoryIds if present
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        requestBody.categoryIds = filters.categoryIds;
      } 
      // Fallback to single categoryId if needed (backward compatibility)
      else if (filters.categoryId) {
        requestBody.categoryId = filters.categoryId;
      }
      
      console.log('Request body:', requestBody);
      
      // Use POST with JSON body instead of GET with URL params
      const response = await api.post(API_CONFIG.endpoints.spending.list, requestBody);
      console.log('Spending records response:', response);
      return response || [];
    } catch (error) {
      console.error('Error fetching spending records:', error);
      throw new Error('Failed to load spending records. Please try again.');
    }
  },
  
  // Get all categories
  getCategories: async () => {
    try {
      console.log('Fetching spending categories');
      const response = await api.get('/rest/categories');
      console.log('Categories response:', response);
      return response || [];
    } catch (error) {
      console.error('Error fetching spending categories:', error);
      throw new Error('Failed to load spending categories. Please try again.');
    }
  },
  
  // Create a new category
  createCategory: async (data: CreateCategoryRequest) => {
    try {
      console.log('Creating new category:', data);
      const response = await api.post('/rest/categories', data);
      console.log('Create category response:', response);
      return response;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category. Please try again.');
    }
  },
  
  // Create new spending record
  create: async (data: CreateSpendingRequest) => {
    try {
      console.log('Creating spending record:', data);
      const response = await api.post(API_CONFIG.endpoints.spending.create, data);
      console.log('Create spending response:', response);
      return response;
    } catch (error) {
      console.error('Error creating spending record:', error);
      throw new Error('Failed to create spending record. Please try again.');
    }
  },
  
  // Update existing spending record
  update: async (data: UpdateSpendingRequest) => {
    try {
      console.log('Updating spending record:', data);
      const response = await api.post(API_CONFIG.endpoints.spending.update, data);
      console.log('Update spending response:', response);
      return response;
    } catch (error) {
      console.error('Error updating spending record:', error);
      throw new Error('Failed to update spending record. Please try again.');
    }
  },
  
  // Delete a spending record
  delete: async (id: number) => {
    try {
      console.log(`Deleting spending record with ID: ${id}`);
      const deleteUrl = `${API_CONFIG.endpoints.spending.delete}/${id}`;
      console.log(`Using endpoint: ${deleteUrl}`);
      const response = await api.delete(deleteUrl);
      console.log('Delete spending response:', response);
      return response;
    } catch (error) {
      console.error(`Error deleting spending record with ID ${id}:`, error);
      throw new Error('Failed to delete spending record. Please try again.');
    }
  },
  
  // Format dates from yyyy-MM-dd to yyyyMMdd for API requests
  formatDateForApi: (dateString: string): string => {
    if (!dateString) return '';
    // Remove hyphens from the date string
    return dateString.replace(/-/g, '');
  },
  
  // Format date from yyyyMMdd to yyyy-MM-dd for UI display
  formatDateForDisplay: (apiDateString: string): string => {
    if (!apiDateString || apiDateString.length !== 8) return '';
    // Add hyphens to create yyyy-MM-dd format
    return `${apiDateString.substring(0, 4)}-${apiDateString.substring(4, 6)}-${apiDateString.substring(6, 8)}`;
  }
};
