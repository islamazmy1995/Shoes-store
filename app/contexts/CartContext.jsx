'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load cart from localStorage or server when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCartFromServer();
    } else {
      loadCartFromLocalStorage();
    }
  }, [isAuthenticated, user]);

  // Save to localStorage whenever cart changes (for guest users)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const loadCartFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('خطأ في تحميل السلة من التخزين المحلي:', error);
    }
  };

  const loadCartFromServer = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
        
        // Merge with local cart if exists
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          const localItems = JSON.parse(localCart);
          if (localItems.length > 0) {
            await mergeLocalCartWithServer(localItems);
            localStorage.removeItem('cart');
          }
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل السلة من الخادم:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mergeLocalCartWithServer = async (localItems) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: localItems })
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('خطأ في دمج السلة:', error);
    }
  };

  const addToCart = async (product, quantity = 1, size = null, color = null) => {
    try {
      const newItem = {
        productId: product.id || product._id,
        product: product,
        quantity,
        size,
        color,
        price: product.price
      };

      // Check if item already exists
      const existingItemIndex = cartItems.findIndex(
        item => 
          item.productId === newItem.productId && 
          item.size === newItem.size && 
          item.color === newItem.color
      );

      let updatedItems;
      if (existingItemIndex > -1) {
        // Update quantity of existing item
        updatedItems = [...cartItems];
        updatedItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        updatedItems = [...cartItems, newItem];
      }

      setCartItems(updatedItems);

      // Sync with server if authenticated
      if (isAuthenticated) {
        await syncCartWithServer(updatedItems);
      }

      return true;
    } catch (error) {
      console.error('خطأ في إضافة المنتج للسلة:', error);
      return false;
    }
  };

  const removeFromCart = async (productId, size = null, color = null) => {
    try {
      const updatedItems = cartItems.filter(
        item => !(
          item.productId === productId && 
          item.size === size && 
          item.color === color
        )
      );

      setCartItems(updatedItems);

      // Sync with server if authenticated
      if (isAuthenticated) {
        await syncCartWithServer(updatedItems);
      }

      return true;
    } catch (error) {
      console.error('خطأ في حذف المنتج من السلة:', error);
      return false;
    }
  };

  const updateQuantity = async (productId, quantity, size = null, color = null) => {
    try {
      if (quantity <= 0) {
        return removeFromCart(productId, size, color);
      }

      const updatedItems = cartItems.map(item => {
        if (item.productId === productId && item.size === size && item.color === color) {
          return { ...item, quantity };
        }
        return item;
      });

      setCartItems(updatedItems);

      // Sync with server if authenticated
      if (isAuthenticated) {
        await syncCartWithServer(updatedItems);
      }

      return true;
    } catch (error) {
      console.error('خطأ في تحديث كمية المنتج:', error);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      setCartItems([]);

      // Clear from server if authenticated
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        await fetch('/api/cart/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // Clear from localStorage
        localStorage.removeItem('cart');
      }

      return true;
    } catch (error) {
      console.error('خطأ في تفريغ السلة:', error);
      return false;
    }
  };

  const syncCartWithServer = async (items) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });
    } catch (error) {
      console.error('خطأ في مزامنة السلة:', error);
    }
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getCartItem = (productId, size = null, color = null) => {
    return cartItems.find(
      item => 
        item.productId === productId && 
        item.size === size && 
        item.color === color
    );
  };

  const isInCart = (productId, size = null, color = null) => {
    return !!getCartItem(productId, size, color);
  };

  const value = {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemsCount,
    getCartTotal,
    getCartItem,
    isInCart,
    loadCartFromServer
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};