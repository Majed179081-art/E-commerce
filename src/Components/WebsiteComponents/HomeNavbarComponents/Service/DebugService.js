// services/debugService.js
import { Axios } from '../../../../API/axios';

export const DebugService = {
  // اختبار endpoint التحقق من المخزون مع معلمات مختلفة
  testCartCheck: async () => {
    const testCases = [
      { product_id: 1, quantity: 2 },
      { product_id: 1, count: 2 },
      { product_id: 1, qty: 2 },
      { product_id: 1, amount: 2 }
    ];
    
    for (const testCase of testCases) {
      try {
        console.log('Testing with:', testCase);
        const response = await Axios.post('/cart/check', testCase);
        console.log('Success with:', testCase, response.data);
        return { success: true, params: testCase, data: response.data };
      } catch (error) {
        console.log('Failed with:', testCase, error.response?.data);
      }
    }
    
    return { success: false, message: 'All test cases failed' };
  },
  
  // الحصول على هيكل الخطأ بالتفصيل
  getErrorDetails: (error) => {
    if (error.response) {
      return {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      };
    }
    return { message: error.message };
  }
};