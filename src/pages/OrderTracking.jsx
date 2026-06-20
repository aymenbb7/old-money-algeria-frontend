import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MessageCircle, Package, Truck, CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackOrder, fetchSettings } from '../api';

const STATUS_STAGES = [
  { key: 'PENDING', label: 'En attente', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmé', icon: CheckCircle },
  { key: 'PREPARING', label: 'En préparation', icon: Package },
  { key: 'SHIPPED', label: 'Expédié', icon: Truck },
  { key: 'DELIVERED', label: 'Livré', icon: ShoppingBag }
];

const OrderTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!orderNumber) return;
    
    setLoading(true);
    setError('');
    setOrder(null);
    setSearchParams({ order: orderNumber });

    try {
      const res = await trackOrder(orderNumber);
      setOrder(res);
    } catch (err) {
      console.error(err);
      setError('Commande introuvable. Veuillez vérifier le numéro OMA-XXXX.');
    } finally {
      setLoading(false);
    }
  }, [orderNumber, setSearchParams]);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(console.error);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (orderNumber) handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusIndex = (status) => {
    return STATUS_STAGES.findIndex(s => s.key === status);
  };

  return (
    <div className="container mx-auto px-4 py-10 md:py-20 min-h-[70vh]">
      <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-8 text-accent text-center">Suivre une Commande</h1>

      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2 mb-12">
        <input 
          type="text" 
          placeholder="Numéro de commande (ex: OMA-1001)" 
          className="flex-1 bg-white/5 border border-white/10 rounded-md p-4 focus:outline-none focus:border-accent text-center font-bold tracking-widest uppercase"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
          required
        />
        <button type="submit" disabled={loading} className="btn-primary">
          <Search size={20} />
        </button>
      </form>

      {loading && <div className="text-center text-text-light/60">Recherche en cours...</div>}
      
      {error && (
        <div className="max-w-xl mx-auto bg-error/10 border border-error/20 text-error p-4 rounded-lg text-center">
          {error}
        </div>
      )}

      {order && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 md:p-10">
            <div className="flex justify-between items-start mb-10 border-b border-white/10 pb-6">
              <div>
                <h3 className="font-playfair text-2xl font-bold text-accent mb-2">{order.order_number}</h3>
                <p className="text-text-light/60 text-sm">Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl">{parseFloat(order.total_amount).toFixed(2)} DZD</p>
                <p className="text-text-light/60 text-sm">{order.items?.length || 0} article(s)</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative mb-12">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 z-0 hidden md:block"></div>
              <div className="flex flex-col md:flex-row justify-between relative z-10 gap-6 md:gap-0">
                {STATUS_STAGES.map((stage, idx) => {
                  const currentIndex = getStatusIndex(order.status);
                  const isCompleted = idx <= currentIndex;
                  const isActive = idx === currentIndex;
                  const Icon = stage.icon;
                  
                  // For cancelled orders
                  if (order.status === 'CANCELLED') {
                    return null;
                  }

                  return (
                    <div key={stage.key} className="flex md:flex-col items-center gap-4 md:gap-2">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                          isActive ? 'bg-accent border-accent text-bg-dark shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 
                          isCompleted ? 'bg-success border-success text-white' : 
                          'bg-bg-dark border-white/20 text-white/40'
                        }`}
                      >
                        <Icon size={20} />
                      </motion.div>
                      <div className="md:text-center">
                        <p className={`font-semibold text-sm ${isActive ? 'text-accent' : isCompleted ? 'text-text-light' : 'text-white/40'}`}>
                          {stage.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.status === 'CANCELLED' && (
              <div className="text-center bg-error/20 text-error p-4 rounded mb-10 font-bold">
                Cette commande a été annulée.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <h4 className="font-playfair font-bold text-lg mb-4">Informations de Livraison</h4>
                <div className="text-text-light/80 text-sm space-y-2">
                  <p><span className="text-text-light/50">Client :</span> {order.guest_name}</p>
                  <p><span className="text-text-light/50">Téléphone :</span> {order.guest_phone}</p>
                  <p><span className="text-text-light/50">Wilaya :</span> {order.wilaya_name}</p>
                  <p><span className="text-text-light/50">Type :</span> {order.delivery_type === 'HOME' ? 'À Domicile' : 'Point Relais'}</p>
                  <p><span className="text-text-light/50">Adresse :</span> {order.delivery_address}, {order.commune}</p>
                </div>
              </div>
              
              <div className="flex flex-col justify-end">
                {settings?.whatsapp_number && (
                  <a 
                    href={`https://wa.me/${settings.whatsapp_number.replace(/\s+/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-outline flex items-center justify-center gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                  >
                    <MessageCircle size={20} />
                    Contacter le support WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
