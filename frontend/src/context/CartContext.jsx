import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const CartContext = createContext({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  subtractFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  total: 0
});

// Create the CartProvider component
function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // Load cart from localStorage on initial load
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    // Debug: Log the cart items whenever they change
    console.log("Cart updated:", items);
  }, [items]);

  const addToCart = (item) => {
    // Ensure item has a valid ID that's converted to string
    const itemId = item.id?.toString() || item._id?.toString();
    
    if (!itemId) {
      console.error("Cannot add item without ID to cart:", item);
      return;
    }
    
    // Get the quantity from the item or default to 1
    const itemQuantity = item.quantity || 1;
    
    setItems(prevItems => {
      // Log the incoming item for debugging
      console.log("Adding to cart:", { ...item, id: itemId, quantity: itemQuantity });
      
      const existingItem = prevItems.find(i => i.id?.toString() === itemId);
      if (existingItem) {
        return prevItems.map(i => 
          i.id?.toString() === itemId ? 
            { ...i, quantity: i.quantity + itemQuantity } : i
        );
      } 
      return [...prevItems, { ...item, id: itemId, quantity: itemQuantity }];
    });
  };

  const subtractFromCart = (id) => {
    const itemId = id?.toString();
    
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id?.toString() === itemId);
      if (!existingItem) return prevItems;
      
      if (existingItem.quantity === 1) {
        return prevItems.filter(i => i.id?.toString() !== itemId);
      } else {
        return prevItems.map(i => 
          i.id?.toString() === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
    });
  };

  const removeFromCart = (id) => {
    const itemId = id?.toString();
    setItems(prevItems => prevItems.filter(item => item.id?.toString() !== itemId));
  };

  const updateQuantity = (id, quantity) => {
    const itemId = id?.toString();
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id?.toString() === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, subtractFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;