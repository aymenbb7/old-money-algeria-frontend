import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { trackOrder, fetchSettings } from '../api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  if (error) return <ErrorMessage message="Commande introuvable." />;
  if (loading) return <div className="py-20"><Loader /></div>;
  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <CheckCircle size={64} className="text-accent mx-auto mb-6" />
      <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-4">Commande confirmée !</h1>
      <p className="text-text-light/80 mb-8">
        Merci pour votre confiance. Votre commande <strong className="text-accent">{order.order_number}</strong> a bien été enregistrée.
      </p>

      <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-left mb-8">
        <h3 className="font-bold border-b border-white/10 pb-3 mb-4">Résumé</h3>
        <p className="text-sm text-text-light/80 mb-2"><strong>Nom :</strong> {order.guest_name}</p>
        <p className="text-sm text-text-light/80 mb-2"><strong>Livraison :</strong> {order.wilaya_name} ({order.delivery_type === 'HOME' ? 'Domicile' : 'Bureau'})</p>
        <p className="text-sm text-text-light/80 mb-4"><strong>Total :</strong> {parseFloat(order.total_amount).toFixed(2)} DZD</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to={`/suivi?order=${order.order_number}`} className="btn-primary flex-1">
          Suivre ma Commande
        </Link>
        {settings?.whatsapp_number && (
          <a 
            href={`https://wa.me/${settings.whatsapp_number.replace(/\s+/g, '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-outline flex-1 flex items-center justify-center gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
          >
            <MessageCircle size={20} />
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;
