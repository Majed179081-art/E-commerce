import { Axios } from '../../../../API/axios';

export const CartService = {
  // جلب محتويات العربة من الخادم
  getCart: async () => {
    try {
      const response = await Axios.get('/cart');
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching cart from server:', error);
      return [];
    }
  },

  // إضافة منتج إلى العربة في الخادم
  addToCart: async (product, quantity = 1) => {
    try {
      const response = await Axios.post('/cart', {
        product_id: product.id,
        count: quantity
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to add to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // ✅ الدالة الجديدة - إضافة مع التحقق من المخزون
  addToCartWithStockCheck: async (product, quantity = 1) => {
    try {
      // أولاً: التحقق من المخزون
      const stockCheck = await CartService.checkStock(product.id, quantity);
      
      if (!stockCheck.available) {
        throw new Error(stockCheck.message || 'Product is not available in the requested quantity');
      }
      
      // ثانياً: إضافة المنتج إلى العربة
      return await CartService.addToCart(product, quantity);
    } catch (error) {
      console.error('Error adding to cart with stock check:', error);
      throw error;
    }
  },

  // تحديث كمية منتج في العربة
  updateQuantity: async (productId, quantity) => {
    try {
      const response = await Axios.put(`/cart/${productId}`, {
        count: quantity
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to update quantity');
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  },

  // ✅ الدالة الجديدة - تحديث مع التحقق من المخزون
  updateQuantityWithStockCheck: async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        return await CartService.removeFromCart(productId);
      }
      
      // التحقق من المخزون
      const stockCheck = await CartService.checkStock(productId, quantity);
      
      if (!stockCheck.available) {
        throw new Error(stockCheck.message || 'Product is not available in the requested quantity');
      }
      
      return await CartService.updateQuantity(productId, quantity);
    } catch (error) {
      console.error('Error updating quantity with stock check:', error);
      throw error;
    }
  },

  // إزالة منتج من العربة
  removeFromCart: async (productId) => {
    try {
      const response = await Axios.delete(`/cart/${productId}`);
      
      if (response.data.success) {
        return true;
      }
      throw new Error('Failed to remove from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // تفريغ العربة بالكامل
  clearCart: async () => {
    try {
      const response = await Axios.delete('/cart');
      
      if (response.data.success) {
        return true;
      }
      throw new Error('Failed to clear cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // التحقق من المخزون
  checkStock: async (productId, quantity) => {
    try {
      const response = await Axios.post('/cart/check', {
        product_id: productId,
        count: quantity
      });
      
      return {
        success: response.data.success,
        available: response.data.success,
        message: response.data.message || 'Stock is available'
      };
    } catch (error) {
      console.error('Error checking stock:', error);
      return {
        success: false,
        available: false,
        message: error.response?.data?.error || 'Error checking product availability'
      };
    }
  },

  // ✅ الدالة الجديدة - حساب إجمالي العناصر
  getTotalItems: async () => {
    try {
      const cart = await CartService.getCart();
      return cart.reduce((total, item) => total + item.count, 0);
    } catch (error) {
      console.error('Error getting total items:', error);
      return 0;
    }
  },

  // ✅ الدالة الجديدة - حساب السعر الإجمالي
  getTotalPrice: async () => {
    try {
      const cart = await CartService.getCart();
      return cart.reduce((total, item) => {
        const price = Number(item.product.price) || 0;
        const discount = Number(item.product.discount) || 0;
        const discountedPrice = discount > 0 ? price - (price * discount) / 100 : price;
        return total + (discountedPrice * item.count);
      }, 0);
    } catch (error) {
      console.error('Error getting total price:', error);
      return 0;
    }
  },
    proceedToCheckout: () => {
    // يمكنك التحقق هنا إذا كانت العربة فارغة
    return window.location.href = '/checkout';
  }
};