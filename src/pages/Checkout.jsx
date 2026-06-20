import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWilayas, submitOrder } from '../api';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';

const Checkout = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [wilayas, setWilayas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_phone: '',
    wilaya: '',
    commune: '',
    delivery_address: '',
    delivery_type: 'HOME',
    coupon_code: ''
  });


  useEffect(() => {
    if (cartItems.length === 0) navigate('/panier');
    
    const loadWilayas = async () => {
      try {
        const res = await fetchWilayas();
        setWilayas(res.results || res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadWilayas();
  }, [cartItems, navigate]);

  useEffect(() => {
    // Delivery price calculated dynamically below
  }, [formData.wilaya, formData.delivery_type, wilayas]);

  // Calculate delivery price dynamically instead of effect
  const selectedWilaya = wilayas.find(w => w.code === formData.wilaya);
  const deliveryPrice = selectedWilaya 
    ? (formData.delivery_type === 'HOME' ? parseFloat(selectedWilaya.home_delivery_price) : parseFloat(selectedWilaya.bureau_delivery_price))
    : 0;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate Algerian Phone (05, 06, 07 followed by 8 digits)
    const phoneRegex = /^(05|06|07)\d{8}$/;
    if (!phoneRegex.test(formData.guest_phone.replace(/\s+/g, ''))) {
      alert("Numéro de téléphone invalide. Il doit commencer par 05, 06, ou 07.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        items: cartItems.map(item => ({
          product: item.product.id,
          size: item.size,
          color: item.color,
          quantity: item.quantity
        }))
      };

      const res = await submitOrder(payload);
      clearCart();
      navigate(`/commande/${res.order_number}`);
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la commande. Veuillez vérifier vos informations.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20"><Loader /></div>;

  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-10 text-accent">Finaliser votre commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form id="checkoutForm" onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="font-playfair text-xl font-bold border-b border-white/10 pb-4 mb-4">Informations de livraison</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-light/60 mb-2">Prénom & Nom *</label>
                <input required name="guest_name" value={formData.guest_name} onChange={handleInputChange} type="text" className="w-full bg-bg-dark border border-white/20 rounded p-3 focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm text-text-light/60 mb-2">Téléphone * (05/06/07...)</label>
                <input required name="guest_phone" value={formData.guest_phone} onChange={handleInputChange} type="tel" className="w-full bg-bg-dark border border-white/20 rounded p-3 focus:outline-none focus:border-accent" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-light/60 mb-2">Wilaya *</label>
                <select required name="wilaya" value={formData.wilaya} onChange={handleInputChange} className="w-full bg-bg-dark border border-white/20 rounded p-3 focus:outline-none focus:border-accent appearance-none">
                  <option value="">Sélectionner une wilaya</option>
                  {wilayas.map(w => <option key={w.code} value={w.code}>{w.code} - {w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-light/60 mb-2">Commune *</label>
                <input required name="commune" value={formData.commune} onChange={handleInputChange} type="text" className="w-full bg-bg-dark border border-white/20 rounded p-3 focus:outline-none focus:border-accent" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-light/60 mb-2">Adresse détaillée *</label>
              <textarea required name="delivery_address" value={formData.delivery_address} onChange={handleInputChange} rows="2" className="w-full bg-bg-dark border border-white/20 rounded p-3 focus:outline-none focus:border-accent"></textarea>
            </div>

            <div className="pt-4">
              <label className="block text-sm text-text-light/60 mb-3">Type de livraison *</label>
              <div className="flex gap-4">
                <label className={`flex-1 border p-4 rounded cursor-pointer transition-colors ${formData.delivery_type === 'HOME' ? 'border-accent bg-accent/10 text-accent' : 'border-white/20 hover:border-white/40'}`}>
                  <input type="radio" name="delivery_type" value="HOME" checked={formData.delivery_type === 'HOME'} onChange={handleInputChange} className="hidden" />
                  <div className="font-semibold text-center">À Domicile</div>
                </label>
                <label className={`flex-1 border p-4 rounded cursor-pointer transition-colors ${formData.delivery_type === 'BUREAU' ? 'border-accent bg-accent/10 text-accent' : 'border-white/20 hover:border-white/40'}`}>
                  <input type="radio" name="delivery_type" value="BUREAU" checked={formData.delivery_type === 'BUREAU'} onChange={handleInputChange} className="hidden" />
                  <div className="font-semibold text-center">Point Relais (Bureau)</div>
                </label>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <label className="block text-sm text-text-light/60 mb-2">Code Promo (Optionnel)</label>
              <input name="coupon_code" value={formData.coupon_code} onChange={handleInputChange} type="text" className="w-full md:w-1/2 bg-bg-dark border border-white/20 rounded p-3 focus:outline-none focus:border-accent uppercase" placeholder="EX: OMA2026" />
            </div>

          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-[#111] p-6 rounded-lg border border-white/10 sticky top-24">
            <h3 className="font-playfair text-xl font-bold border-b border-white/10 pb-4 mb-4">Résumé</h3>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div className="flex gap-2">
                    <span className="text-text-light/60">{item.quantity}x</span>
                    <span className="truncate max-w-[150px]">{item.product.name}</span>
                  </div>
                  <span className="font-semibold">{((item.product.discount_price || item.product.price) * item.quantity).toFixed(2)} DZD</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-light/60">Sous-total</span>
                <span>{subtotal.toFixed(2)} DZD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light/60">Livraison</span>
                <span>{deliveryPrice === 0 ? '--' : `${deliveryPrice.toFixed(2)} DZD`}</span>
              </div>
            </div>

            <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center mb-6">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-2xl text-accent">{(subtotal + deliveryPrice).toFixed(2)} DZD</span>
            </div>

            <div className="bg-bg-dark p-3 rounded text-center text-xs text-text-light/60 border border-white/10 mb-6">
              Paiement à la livraison (Cash Only)
            </div>

            <button 
              form="checkoutForm" 
              type="submit" 
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? 'Traitement...' : 'Confirmer la Commande'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
