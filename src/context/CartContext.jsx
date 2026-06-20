import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('oma_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('oma_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size, color, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size === size && item.color === color);
      if (existing) {
        return prev.map(item =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, size, color, quantity }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (product, size, color, quantity) => {
    setCartItems(prev => {
      if (quantity <= 0) {
        return prev.filter(item => !(item.product.id === product.id && item.size === size && item.color === color));
      }
      return prev.map(item =>
        (item.product.id === product.id && item.size === size && item.color === color)
          ? { ...item, quantity }
          : item
      );
    });
  };

  const removeFromCart = (product, size, color) => {
    setCartItems(prev => prev.filter(item => !(item.product.id === product.id && item.size === size && item.color === color)));
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.discount_price || item.product.price;
    return sum + (parseFloat(price) * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, updateQuantity, removeFromCart, clearCart,
      totalItems, subtotal, isCartOpen, setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};
