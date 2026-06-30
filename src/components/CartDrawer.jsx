import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, subtotal } = useCart();
  const navigate = useNavigate();

  // Prevent background scrolling when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isCartOpen]);

  // Make sure to reset overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden md:block"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[400px] max-w-full bg-bg border-l border-border shadow-2xl z-50 flex flex-col hidden md:flex"
          >
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="font-playfair text-xl font-bold text-accent">Votre Panier</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-cards rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-text/50 space-y-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p>Votre panier est vide</p>
                  <button onClick={() => { setIsCartOpen(false); navigate('/produits'); }} className="btn-outline mt-4">
                    Découvrir la collection
                  </button>
                </div>
              ) : (
                cartItems.map((item, idx) => {
                  const price = item.product.discount_price || item.product.price;
                  const mainImgObj = item.product.images?.find(i => i.is_main) || item.product.images?.[0];
                  const img = mainImgObj ? (mainImgObj.image_url || mainImgObj.image) : null;
                  
                  return (
                    <div key={`${item.product.id}-${item.size}-${item.color}-${idx}`} className="flex gap-4 bg-cards p-3 rounded-lg border border-border">
                      {img ? (
                        <img src={img} alt={item.product.name} className="w-20 h-24 object-cover rounded" />
                      ) : (
                        <div className="w-20 h-24 bg-cards brightness-150 rounded flex items-center justify-center"><ShoppingBag size={20} className="text-muted" /></div>
                      )}
                      
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between">
                          <h4 className="font-semibold text-sm line-clamp-1">{item.product.name}</h4>
                          <button onClick={() => removeFromCart(item.product, item.size, item.color)} className="text-error/80 hover:text-error p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="text-xs text-text/60 mt-1 space-y-1">
                          <p>Taille: <span className="text-text">{item.size}</span></p>
                          <p>Couleur: <span className="text-text">{item.color}</span></p>
                        </div>
                        <div className="mt-auto flex justify-between items-end">
                          <span className="font-bold text-accent">{parseFloat(price).toFixed(2)} DZD</span>
                          <div className="flex items-center gap-3 bg-bg rounded px-2 py-1 border border-border">
                            <button onClick={() => updateQuantity(item.product, item.size, item.color, item.quantity - 1)} className="hover:text-accent"><Minus size={14} /></button>
                            <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product, item.size, item.color, item.quantity + 1)} className="hover:text-accent"><Plus size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border bg-[#050505]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-text/80">Sous-total</span>
                  <span className="font-bold text-xl text-accent">{subtotal.toFixed(2)} DZD</span>
                </div>
                <button onClick={() => { setIsCartOpen(false); navigate('/commander'); }} className="btn-primary w-full flex items-center justify-center gap-2">
                  <ShoppingBag size={20} />
                  Passer la Commande
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
