import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MessageCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackOrder, fetchSettings } from '../api';

const STATUS_STAGES = [
  { key: 'PENDING', lines: ['EN', 'ATTENTE'] },
  { key: 'CONFIRMED', lines: ['CONFIRMÉE'] },
  { key: 'PREPARING', lines: ['PRÉP.'] },
  { key: 'SHIPPED', lines: ['EN', 'LIVRAISON'] },
  { key: 'DELIVERED', lines: ['LIVRÉE'] }
];

const OrderTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('oma_orders') || '[]');
    setRecentOrders(orders.reverse());
  }, []);

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

      {!order && !loading && (
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="font-playfair text-2xl font-bold mb-6 text-accent">Mes Commandes Récentes</h2>
          {recentOrders.length === 0 ? (
            <div className="text-center py-10 bg-white/5 border border-white/10 rounded-lg text-text-light/50">
              Aucune commande récente sur cet appareil
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentOrders.map((ro, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col gap-3 hover:border-accent/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-text-light">{ro.orderNumber}</span>
                    <span className="text-xs px-2 py-1 bg-white/10 rounded font-semibold text-text-light/80">
                      {ro.status}
                    </span>
                  </div>
                  <div className="text-sm text-text-light/60">
                    <p>{new Date(ro.date).toLocaleDateString('fr-FR')} • {ro.itemsCount} article(s)</p>
                  </div>
                  <button 
                    onClick={() => {
                      setOrderNumber(ro.orderNumber);
                      setSearchParams({ order: ro.orderNumber });
                    }} 
                    className="mt-2 text-accent text-sm font-semibold hover:underline text-left"
                  >
                    Voir le détail &rarr;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
            <style>{`
              @keyframes pulse-ring {
                0% {
                  box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7);
                }
                70% {
                  box-shadow: 0 0 0 10px rgba(212, 175, 55, 0);
                }
                100% {
                  box-shadow: 0 0 0 0 rgba(212, 175, 55, 0);
                }
              }
              .pulse-active {
                animation: pulse-ring 2s infinite;
              }
            `}</style>
            <div className="relative mb-16 px-4 md:px-0">
              {/* Horizontal connecting lines (Desktop) */}
              <div className="absolute top-5 left-[30px] right-[30px] h-[3px] bg-zinc-700 z-0 hidden md:block">
                <div 
                  className="h-full transition-all duration-500" 
                  style={{ width: `${(getStatusIndex(order.status) / 4) * 100}%`, backgroundColor: '#D4AF37' }}
                />
              </div>
              
              {/* Vertical connecting lines (Mobile) */}
              <div className="absolute left-[36px] top-5 bottom-5 w-[3px] bg-zinc-700 z-0 md:hidden">
                <div 
                  className="w-full transition-all duration-500" 
                  style={{ height: `${(getStatusIndex(order.status) / 4) * 100}%`, backgroundColor: '#D4AF37' }}
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
                {STATUS_STAGES.map((stage, idx) => {
                  const currentIndex = getStatusIndex(order.status);
                  const isCompleted = idx <= currentIndex;
                  const isActive = idx === currentIndex;
                  const isPast = isCompleted && !isActive;
                  
                  if (order.status === 'CANCELLED') {
                    return null;
                  }

                  return (
                    <div key={stage.key} className="flex md:flex-col items-center gap-6 md:gap-4 flex-1">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                          isPast ? 'text-zinc-950' :
                          isActive ? 'text-zinc-950 pulse-active' :
                          'text-zinc-500'
                        }`}
                        style={{
                          backgroundColor: isCompleted ? '#D4AF37' : '#111111',
                          borderColor: isCompleted ? '#D4AF37' : '#3f3f46',
                        }}
                      >
                        {isPast ? (
                          <Check size={18} className="stroke-[3]" />
                        ) : isActive ? (
                          <div className="w-2.5 h-2.5 bg-zinc-950 rounded-full" />
                        ) : null}
                      </motion.div>
                      <div className="text-left md:text-center">
                        <p className={`font-semibold text-xs tracking-wider md:mt-2 ${isActive ? 'text-accent' : isPast ? 'text-text-light' : 'text-zinc-500'}`}>
                          {stage.lines.map((line, lIdx) => (
                            <span key={lIdx} className="inline md:block md:w-full">{line}{lIdx < stage.lines.length - 1 ? ' ' : ''}</span>
                          ))}
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
