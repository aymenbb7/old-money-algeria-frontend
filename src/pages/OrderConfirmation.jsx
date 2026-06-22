import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, MessageCircle, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackOrder, fetchSettings } from '../api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [orderRes, settingsRes] = await Promise.all([
          trackOrder(orderNumber),
          fetchSettings()
        ]);
        setOrder(orderRes);
        setSettings(settingsRes);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [orderNumber]);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) return <ErrorMessage message="Commande introuvable." />;
  if (loading) return <div className="py-20"><Loader /></div>;
  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <CheckCircle size={80} className="text-accent mx-auto mb-6" />
      </motion.div>
      
      <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-6 text-text-light">
        Commande Confirmée !
      </h1>
      
      <p className="text-text-light/80 mb-6 text-lg">
        Merci pour votre confiance. Votre commande a bien été enregistrée.
      </p>

      <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8 flex flex-col items-center justify-center">
        <span className="text-sm text-text-light/60 uppercase tracking-widest mb-2">Votre Numéro de Suivi</span>
        <div className="flex items-center gap-4 bg-bg-dark border border-white/10 rounded-full py-3 px-6">
          <span className="font-bold text-2xl text-accent tracking-widest">{order.order_number}</span>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm font-semibold border border-accent text-accent hover:bg-accent hover:text-black transition-colors rounded-full px-4 py-2"
          >
            {copied ? (
              <>
                <Check size={16} /> Copié!
              </>
            ) : (
              <>
                <Copy size={16} /> Copier
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-left mb-8 max-w-md mx-auto">
        <h3 className="font-bold border-b border-white/10 pb-3 mb-4 text-lg">Résumé de la commande</h3>
        <div className="space-y-3 text-text-light/80">
          <p className="flex justify-between">
            <strong>Nom :</strong> <span>{order.guest_name}</span>
          </p>
          <p className="flex justify-between">
            <strong>Articles :</strong> <span>{order.items?.length || 0}</span>
          </p>
          <p className="flex justify-between">
            <strong>Wilaya :</strong> <span>{order.wilaya_name}</span>
          </p>
          <p className="flex justify-between">
            <strong>Livraison :</strong> <span>{order.delivery_type === 'HOME' ? 'Domicile' : 'Point Relais'}</span>
          </p>
          <p className="flex justify-between border-t border-white/10 pt-3 mt-3">
            <strong className="text-lg text-text-light">Total :</strong> <span className="font-bold text-lg text-accent">{parseFloat(order.total_amount).toFixed(2)} DZD</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
        <Link to={`/suivi?order=${order.order_number}`} className="btn-primary flex-1 text-center py-3">
          Suivre ma commande
        </Link>
        <Link to="/collections" className="btn-outline flex-1 text-center py-3">
          Continuer mes achats
        </Link>
      </div>

      {settings?.whatsapp_number && (
        <div className="mt-6 flex justify-center">
          <a 
            href={`https://wa.me/${settings.whatsapp_number.replace(/\s+/g, '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-[#25D366] hover:text-[#1da851] transition-colors font-medium"
          >
            <MessageCircle size={20} />
            Besoin d'aide ? Contactez-nous sur WhatsApp
          </a>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmation;
