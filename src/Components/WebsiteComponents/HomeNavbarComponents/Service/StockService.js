// services/stockService.js
import { Axios } from '../../../../API/axios';

/**
 * Check stock availability for a product and optionally show alerts
 * @param {object} params
 * @param {number|string} params.productId - Product ID
 * @param {number} params.requestedQuantity - Quantity requested by user
 * @param {function} [params.showSuccess] - Optional alert success function
 * @param {function} [params.showError] - Optional alert error function
 * @returns {Promise<{success: boolean, available: boolean, availableQuantity: number, message: string}>}
 */
export const StockService = {
  checkStock: async ({ productId, requestedQuantity, showSuccess, showError }) => {
    try {
      const response = await Axios.post('/cart/check', {
        product_id: productId,
        count: requestedQuantity
      });

      const message = response.data.message || 'Stock is available';

      if (showSuccess) showSuccess(message);

      return {
        success: true,
        available: true,
        availableQuantity: requestedQuantity,
        message
      };
    } catch (error) {
      console.error('Error checking stock:', error);

      let errorMessage = 'Network error. Please check your connection.';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 422) {
          errorMessage = data.message || 'Validation error';
          if (data.errors) {
            const fieldErrors = Object.values(data.errors).flat();
            if (fieldErrors.length) errorMessage = fieldErrors.join(', ');
          }
        } else if (status === 400) {
          errorMessage = data.error || 'Requested quantity exceeds available stock';
        } else {
          errorMessage = data.message || 'Error checking product availability';
        }
      }

      if (showError) showError(errorMessage);

      return {
        success: false,
        available: false,
        availableQuantity: 0,
        message: errorMessage
      };
    }
  }
};
