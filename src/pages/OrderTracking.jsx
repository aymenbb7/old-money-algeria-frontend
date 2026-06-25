import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MessageCircle, Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackOrder, fetchSettings, fetchWilayas } from '../api';

const STATUS_STAGES = [
  { key: 'PENDING', lines: ['EN', 'ATTENTE'] },
  { key: 'CONFIRMED', lines: ['CONFIRMÉE'] },
  { key: 'PREPARING', lines: ['PRÉP.'] },
  { key: 'SHIPPED', lines: ['EN', 'LIVRAISON'] },
  { key: 'DELIVERED', lines: ['LIVRÉE'] }
];

const getStatusIndex = (status) => {
  return STATUS_STAGES.findIndex(s => s.key === status);
};

const StatusBadge = ({ status }) => {
  const badgeConfig = {
    'PENDING': { color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', label: 'EN ATTENTE' },
    'CONFIRMED': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'CONFIRMÉE' },
    'PREPARING': { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'EN PRÉPARATION' },
    'SHIPPED': { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'EN LIVRAISON' },
    'DELIVERED': { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'LIVRÉE' },
    'CANCELLED': { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'ANNULÉE' }
  };
  
  const config = badgeConfig[status] || badgeConfig['PENDING'];
  
  return (
    <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
};

const Timeline = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="text-center bg-error/20 text-error p-4 rounded font-bold mt-4">
        Cette commande a été annulée.
      </div>
    );
  }

  return (
    <div className="relative mt-8 mb-6 px-2">
      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
        .pulse-active { animation: pulse-ring 2s infinite; }
      `}</style>
      
      {/* Horizontal connecting lines */}
      <div className="absolute top-4 left-[20px] right-[20px] h-[2px] bg-zinc-800 z-0">
        <div 
          className="h-full transition-all duration-700 ease-in-out" 
          style={{ width: `${(getStatusIndex(status) / 4) * 100}%`, backgroundColor: 'var(--color-accent)' }}
        />
      </div>

      <div className="flex justify-between relative z-10">
        {STATUS_STAGES.map((stage, idx) => {
          const currentIndex = getStatusIndex(status);
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;
          const isPast = isCompleted && !isActive;

          return (
            <div key={stage.key} className="flex flex-col items-center gap-2 flex-1">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                  isPast ? 'text-zinc-950' : isActive ? 'text-zinc-950 pulse-active' : 'text-zinc-500'
                }`}
                style={{
                  backgroundColor: isCompleted ? 'var(--color-accent)' : '#111111',
                  borderColor: isCompleted ? 'var(--color-accent)' : '#3f3f46',
                }}
              >
                {isPast ? (
                  <Check size={14} className="stroke-[3]" />
                ) : isActive ? (
                  <div className="w-2 h-2 bg-zinc-950 rounded-full" />
                ) : null}
              </motion.div>
              <div className="text-center">
                <p className={`font-semibold text-[10px] sm:text-xs tracking-wider ${isActive ? 'text-accent' : isPast ? 'text-text' : 'text-zinc-500'}`}>
                  <span className="block">{stage.lines[0]}</span>
                  {stage.lines[1] && <span className="block">{stage.lines[1]}</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderCard = ({ orderData, initiallyExpanded = false, wilayasMap, onDelete }) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [copied, setCopied] = useState(false);
  const [fullOrderDetails, setFullOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  // orderData from local storage usually just has orderNumber, date, itemsCount, wilaya, status
  // but if it's fetched directly via search, it has the full object
  const isFullData = !!orderData.items;
  
  useEffect(() => {
    if (isFullData) {
      setFullOrderDetails(orderData);
    }
  }, [isFullData, orderData]);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderData.order_number || orderData.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpand = async () => {
    if (!expanded && !fullOrderDetails) {
      setLoadingDetails(true);
      try {
        const details = await trackOrder(orderData.orderNumber);
        setFullOrderDetails(details);
        setFetchError(null);
        
        // Update local storage with fresh status
        if (orderData.orderNumber) {
          const orders = JSON.parse(localStorage.getItem('oma_orders') || '[]');
          const idx = orders.findIndex(o => o.orderNumber === orderData.orderNumber);
          if (idx !== -1) {
            orders[idx].status = details.status;
            localStorage.setItem('oma_orders', JSON.stringify(orders));
          }
        }
      } catch (err) {
        console.error("Could not fetch details", err);
        setFetchError(err.response?.status === 404 ? "Cette commande n'existe plus dans notre système" : err.message);
      } finally {
        setLoadingDetails(false);
      }
    }
    setExpanded(!expanded);
  };

  const displayOrderNumber = orderData.order_number || orderData.orderNumber;
  const displayDate = orderData.created_at || orderData.date;
  const displayItemsCount = orderData.items?.length || orderData.itemsCount;
  const displayStatus = fullOrderDetails?.status || orderData.status;
  
  let displayWilaya = fullOrderDetails?.wilaya_name || orderData.wilaya;
  // Convert wilaya code to name if it's just a number
  if (displayWilaya && /^\d+$/.test(displayWilaya) && wilayasMap && wilayasMap[displayWilaya]) {
    displayWilaya = `${wilayasMap[displayWilaya]}`;
  }

  return (
    <div className="bg-cards border border-border rounded-lg p-5 flex flex-col gap-3 hover:border-accent/40 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl text-accent tracking-widest">{displayOrderNumber}</span>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs px-2 py-1 border border-accent/50 text-accent rounded hover:bg-accent hover:text-bg transition-colors"
          >
            {copied ? <><Check size={12}/> Copié!</> : 'Copier'}
          </button>
        </div>
      </div>
      
      <div className="text-sm text-text/60 flex items-center gap-2">
        <span>{new Date(displayDate).toLocaleDateString('fr-FR')}</span>
        <span>•</span>
        <span>{displayItemsCount} article(s)</span>
      </div>
      
      <div className="flex items-center gap-3 mt-1">
        <StatusBadge status={displayStatus} />
        {displayWilaya && (
          <span className="text-sm text-text/70">Wilaya: {displayWilaya}</span>
        )}
      </div>

      <div className="mt-2 text-right">
        <button 
          onClick={toggleExpand}
          className="text-accent text-sm font-semibold hover:underline inline-flex items-center gap-1"
        >
          {expanded ? 'Fermer' : 'Voir le détail'} 
          {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border pt-4 mt-2">
              {loadingDetails ? (
                <div className="text-center py-4 text-sm text-text/50">Chargement des détails...</div>
              ) : fullOrderDetails ? (
                <>
                  <Timeline status={fullOrderDetails.status} />
                  
                  {fullOrderDetails.items && fullOrderDetails.items.length > 0 && (
                    <div className="mt-6 bg-black/20 rounded p-4">
                      <h4 className="font-semibold mb-3 text-sm border-b border-border pb-2">Articles commandés</h4>
                      <div className="space-y-3">
                        {fullOrderDetails.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-center">
                            {item.product_image && (
                              <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-cover rounded" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.product_name}</p>
                              <p className="text-xs text-text/60">
                                {item.variant_color && item.variant_size ? `${item.variant_color} - ${item.variant_size}` : ''} 
                                {item.variant_color || item.variant_size ? ' • ' : ''}
                                Qté: {item.quantity}
                              </p>
                            </div>
                            <div className="text-sm font-semibold text-accent">
                              {parseFloat(item.price).toFixed(2)} DZD
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-border flex justify-between font-bold">
                        <span>Total:</span>
                        <span className="text-accent">{parseFloat(fullOrderDetails.total_amount).toFixed(2)} DZD</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 text-right">
                    <button 
                      onClick={() => setExpanded(false)}
                      className="text-xs bg-cards brightness-150 hover:bg-cards brightness-200 px-3 py-1.5 rounded transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-error text-sm font-semibold mb-3">
                    {fetchError || "Impossible de charger les détails"}
                  </div>
                  {fetchError === "Cette commande n'existe plus dans notre système" && onDelete && (
                    <button 
                      onClick={() => onDelete(orderData.orderNumber)}
                      className="text-xs border border-error text-error hover:bg-error hover:text-white px-4 py-2 rounded transition-colors"
                    >
                      Supprimer de l'historique
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const OrderTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [wilayasMap, setWilayasMap] = useState({});

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('oma_orders') || '[]');
    // Sort by date descending (newest first)
    const sorted = orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    setRecentOrders(sorted);
  }, []);

  const handleDeleteFromHistory = (orderNumberToRemove) => {
    const orders = JSON.parse(localStorage.getItem('oma_orders') || '[]');
    const filtered = orders.filter(o => o.orderNumber !== orderNumberToRemove);
    localStorage.setItem('oma_orders', JSON.stringify(filtered));
    setRecentOrders(filtered);
  };

  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!orderNumber) return;
    
    setLoading(true);
    setError('');
    setSearchedOrder(null);
    setSearchParams({ order: orderNumber });

    try {
      const res = await trackOrder(orderNumber);
      setSearchedOrder(res);
    } catch (err) {
      console.error(err);
      setError('Commande introuvable. Veuillez vérifier le numéro OMA-XXXX.');
    } finally {
      setLoading(false);
    }
  }, [orderNumber, setSearchParams]);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(console.error);
    fetchWilayas().then(data => {
      const wList = data.results || data || [];
      const wMap = {};
      wList.forEach(w => { wMap[w.code] = w.name; });
      setWilayasMap(wMap);
    }).catch(console.error);
    if (orderNumber) handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 md:py-16 min-h-[70vh]">
      <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-8 text-accent text-center">Suivre une Commande</h1>

      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2 mb-12">
        <input 
          type="text" 
          placeholder="Numéro de commande (ex: OMA-1001)" 
          className="flex-1 bg-cards border border-border rounded-md p-4 focus:outline-none focus:border-accent text-center font-bold tracking-widest uppercase"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
          required
        />
        <button type="submit" disabled={loading} className="btn-primary">
          <Search size={20} />
        </button>
      </form>

      {loading && <div className="text-center text-text/60 my-8">Recherche en cours...</div>}
      
      {error && (
        <div className="max-w-xl mx-auto bg-error/10 border border-error/20 text-error p-4 rounded-lg text-center my-8">
          {error}
        </div>
      )}

      {/* Show searched order result if available */}
      {searchedOrder && (
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="font-playfair text-2xl font-bold mb-6 text-accent">Résultat de la recherche</h2>
          <OrderCard orderData={searchedOrder} initiallyExpanded={true} wilayasMap={wilayasMap} />
        </div>
      )}

      {/* Recent Orders Section */}
      {!searchedOrder && !loading && (
        <div className="max-w-3xl mx-auto">
          <h2 className="font-playfair text-2xl font-bold mb-6 text-accent">Mes Commandes Récentes</h2>
          {recentOrders.length === 0 ? (
            <div className="text-center py-10 bg-cards border border-border rounded-lg text-text/50">
              Aucune commande récente sur cet appareil
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recentOrders.map((ro, idx) => (
                <OrderCard 
                  key={`${ro.orderNumber}-${idx}`} 
                  orderData={ro} 
                  wilayasMap={wilayasMap} 
                  onDelete={handleDeleteFromHistory} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      {settings?.whatsapp_number && (
        <div className="mt-16 text-center">
          <a 
            href={`https://wa.me/${settings.whatsapp_number.replace(/\s+/g, '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-sm text-text/60 hover:text-[#25D366] transition-colors"
          >
            <MessageCircle size={18} />
            Un problème avec votre commande ? Contactez le support WhatsApp
          </a>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
