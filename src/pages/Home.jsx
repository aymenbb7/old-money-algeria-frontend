import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Clock } from 'lucide-react';
import { fetchProducts, fetchHomepageBanners } from '../api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, bannerRes] = await Promise.all([
          fetchProducts({ status: 'PUBLISHED', is_new_arrival: 'True' }),
          fetchHomepageBanners().catch(() => [])
        ]);
        setProducts(prodRes.results || []);
        setBanners(bannerRes || []);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIdx(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const banner = banners.length > 0 ? banners[currentBannerIdx] : null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {banners.map((b, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: idx === currentBannerIdx ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: b.hero_image ? `url(${b.hero_image})` : undefined,
              backgroundColor: b.hero_image ? undefined : '#0B4D2B'
            }}
          >
            <div className="absolute inset-0 bg-black/45"></div>
          </motion.div>
        ))}
        {banners.length === 0 && (
          <div className="absolute inset-0 bg-[#0B4D2B]">
            <div className="absolute inset-0 bg-black/45"></div>
          </div>
        )}
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center w-full">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-cormorant text-5xl md:text-7xl font-bold mb-6 text-text-light"
          >
            {banner?.hero_title || "OLD MONEY IN ALGERIA"}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="font-cormorant italic text-3xl md:text-5xl text-accent mb-10"
          >
            {banner?.hero_subtitle || "Le Style qui parle avant vous"}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <Link to="/collections" className="inline-block text-accent border border-accent uppercase tracking-[3px] px-10 py-3.5 hover:bg-accent hover:text-black transition-all duration-300">
              {banner?.hero_button_text || "Découvrir la Collection"}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals (Horizontal Scroll on Mobile) */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-accent">Nouveautés</h2>
          <Link to="/collections" className="text-text-light hover:text-accent transition-colors underline underline-offset-4">Tout voir</Link>
        </div>

        {error ? (
          <ErrorMessage />
        ) : loading ? (
          <div className="flex gap-6 overflow-x-hidden">
            {[1, 2, 3, 4].map(i => <div key={i} className="min-w-[280px] md:w-1/4 flex-shrink-0"><Loader type="card" /></div>)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-text-light/50 border border-white/10 rounded-lg">Aucun produit disponible</div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x hide-scrollbar">
            {products.slice(0, 5).map((prod, idx) => {
              const price = prod.discount_price || prod.price;
              const img = prod.images && prod.images.length > 0 ? prod.images[0].image : null;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={prod.id} 
                  className="min-w-[280px] md:w-1/4 flex-shrink-0 snap-start group cursor-pointer"
                >
                  <Link to={`/collections/${prod.slug}`} className="block">
                    <div className="relative aspect-[3/4] bg-white/5 rounded-lg overflow-hidden mb-4 border border-white/5">
                      {img ? (
                        <img src={img} alt={prod.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">Sans Image</div>
                      )}
                      {prod.discount_price && (
                        <div className="absolute top-3 left-3 bg-error text-white text-xs font-bold px-2 py-1 rounded">PROMO</div>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg line-clamp-1">{prod.name}</h3>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="font-bold text-accent">{parseFloat(price).toFixed(2)} DZD</span>
                      {prod.discount_price && (
                        <span className="text-text-light/40 line-through text-sm">{parseFloat(prod.price).toFixed(2)} DZD</span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Brand Values */}
      <section className="py-20 bg-[#050505] border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-accent mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-playfair text-xl font-bold mb-3">Qualité Premium</h3>
              <p className="text-text-light/60">Des matières nobles sélectionnées pour durer et affirmer votre statut.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-accent mb-6">
                <Truck size={32} />
              </div>
              <h3 className="font-playfair text-xl font-bold mb-3">Livraison 58 Wilayas</h3>
              <p className="text-text-light/60">Payez en espèces à la livraison. Nous expédions partout en Algérie.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-accent mb-6">
                <Clock size={32} />
              </div>
              <h3 className="font-playfair text-xl font-bold mb-3">Élégance Intemporelle</h3>
              <p className="text-text-light/60">Des coupes minimalistes inspirées par l'esthétique 'Old Money'.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
