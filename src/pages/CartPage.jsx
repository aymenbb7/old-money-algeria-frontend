import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      <h1 className="font-playfair text-3xl font-bold mb-8 text-accent">Votre Panier</h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-light/50 space-y-4 border border-white/10 rounded-lg">
          <ShoppingBag size={48} strokeWidth={1} />
          <p>Votre panier est vide</p>
          <button onClick={() => navigate('/produits')} className="btn-outline mt-4">
            Découvrir la collection
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item, idx) => {
            const price = item.product.discount_price || item.product.price;
            const img = item.product.images && item.product.images.length > 0 ? item.product.images[0].image : null;
            
            return (
              <div key={`${item.product.id}-${idx}`} className="flex gap-4 bg-white/5 p-4 rounded-lg border border-white/5">
                {img ? (
                  <img src={img} alt={item.product.name} className="w-24 h-32 object-cover rounded" />
                ) : (
                  <div className="w-24 h-32 bg-white/10 rounded flex items-center justify-center"><ShoppingBag size={20} className="text-white/30" /></div>
                )}
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between">
                    <h4 className="font-semibold">{item.product.name}</h4>
                    <button onClick={() => removeFromCart(item.product, item.size, item.color)} className="text-error/80 hover:text-error p-1">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="text-sm text-text-light/60 mt-1 space-y-1">
                    <p>Taille: <span className="text-text-light">{item.size}</span></p>
                    <p>Couleur: <span className="text-text-light">{item.color}</span></p>
                  </div>
                  <div className="mt-auto flex justify-between items-end">
                    <span className="font-bold text-accent text-lg">{parseFloat(price).toFixed(2)} DZD</span>
                    <div className="flex items-center gap-3 bg-bg-dark rounded px-3 py-1.5 border border-white/10">
                      <button onClick={() => updateQuantity(item.product, item.size, item.color, item.quantity - 1)} className="hover:text-accent"><Minus size={16} /></button>
                      <span className="font-semibold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product, item.size, item.color, item.quantity + 1)} className="hover:text-accent"><Plus size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="fixed md:static bottom-[4.5rem] md:bottom-auto left-0 w-full md:w-auto p-4 md:p-6 bg-bg-dark md:bg-white/5 border-t md:border border-white/10 md:rounded-lg mt-8 z-30">
            <div className="flex justify-between items-center mb-4">
              <span className="text-text-light/80 text-lg">Sous-total</span>
              <span className="font-bold text-2xl text-accent">{subtotal.toFixed(2)} DZD</span>
            </div>
            <button onClick={() => navigate('/commander')} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
              <ShoppingBag size={20} />
              Passer la Commande
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
