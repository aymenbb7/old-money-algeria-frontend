import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Clock } from 'lucide-react';
import { fetchHomepageBanners, fetchHomepageSections } from '../api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const getIcon = (iconName) => {
  switch (iconName) {
    case 'CROWN':
      return (
        <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
          <path d="M3 20h18v2H3z" />
        </svg>
      );
    case 'TRUCK':
      return (
        <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case 'DIAMOND':
      return (
        <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

const Home = () => {
  const [sections, setSections] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadedBgs, setLoadedBgs] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
        let secRes = [];
        try {
          secRes = await fetchHomepageSections();
        } catch (err) {
          console.error("fetchHomepageSections failed:", err);
        }

        let bannerRes = [];
        try {
          bannerRes = await fetchHomepageBanners();
        } catch (err) {
          console.error("fetchHomepageBanners failed:", err);
        }

        const activeSections = Array.isArray(secRes?.results) 
          ? secRes.results.filter(s => s.is_active) 
          : (Array.isArray(secRes) ? secRes.filter(s => s.is_active) : []);
        setSections(activeSections);
        setBanners(Array.isArray(bannerRes) ? bannerRes : []);
      } catch (err) {
        console.error("loadData main block failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (Array.isArray(banners)) {
      banners.forEach((b, idx) => {
        if (b && b.hero_image_url) {
          const img = new Image();
          img.src = b.hero_image_url;
          img.onload = () => {
            setLoadedBgs(prev => ({ ...prev, [idx]: true }));
          };
        }
      });
    }
  }, [banners]);

  useEffect(() => {
    if (!Array.isArray(banners) || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIdx(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const banner = (Array.isArray(banners) && banners.length > 0) ? banners[currentBannerIdx] : null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {Array.isArray(banners) && banners.map((b, idx) => {
          const isBgLoaded = loadedBgs[idx];
          return (
              <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: idx === currentBannerIdx ? 1 : 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: isBgLoaded && b.hero_image_url ? `url(${b.hero_image_url})` : undefined,
                backgroundColor: 'var(--color-primary)',
                backgroundSize: 'cover',
                transition: 'background-image 0s'
              }}
            >
              <div className="absolute inset-0 bg-black/45"></div>
            </motion.div>
          );
        })}
        {(!Array.isArray(banners) || banners.length === 0) && (
          <div className="absolute inset-0 bg-primary">
            <div className="absolute inset-0 bg-black/45"></div>
          </div>
        )}
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center w-full">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-cormorant text-5xl md:text-7xl font-bold mb-6 text-text"
          >
            {banner?.hero_title || "OLD MONEY IN ALGERIA"}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-cormorant italic text-3xl md:text-5xl text-accent mb-10"
          >
            {banner?.hero_subtitle || "Le Style qui parle avant vous"}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link to="/collections" className="inline-block text-accent border border-accent uppercase tracking-[3px] px-10 py-3.5 hover:bg-accent hover:text-bg transition-all duration-300">
              {banner?.hero_button_text || "Découvrir la Collection"}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-20 bg-bg border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-accent mb-4">L'art de l'élégance discrète</h2>
            <p className="text-text/60 max-w-2xl mx-auto">Découvrez pourquoi Old Money Algeria redéfinit le style classique.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-cards p-8 rounded-lg border border-border hover:border-accent/40 transition-all duration-300 group"
            >
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {getIcon(banner?.prop1_icon || 'CROWN')}
              </div>
              <h3 className="font-playfair text-xl font-bold text-text mb-4">{banner?.prop1_title || "Qualité Premium"}</h3>
              <p className="text-text/70 text-sm leading-relaxed">{banner?.prop1_text || "Des matières nobles sélectionnées pour durer et affirmer votre statut."}</p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-cards p-8 rounded-lg border border-border hover:border-accent/40 transition-all duration-300 group"
            >
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {getIcon(banner?.prop2_icon || 'TRUCK')}
              </div>
              <h3 className="font-playfair text-xl font-bold text-text mb-4">{banner?.prop2_title || "Livraison 58 Wilayas"}</h3>
              <p className="text-text/70 text-sm leading-relaxed">{banner?.prop2_text || "Payez en espèces à la livraison. Nous expédions partout en Algérie."}</p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-cards p-8 rounded-lg border border-border hover:border-accent/40 transition-all duration-300 group"
            >
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {getIcon(banner?.prop3_icon || 'DIAMOND')}
              </div>
              <h3 className="font-playfair text-xl font-bold text-text mb-4">{banner?.prop3_title || "Élégance Intemporelle"}</h3>
              <p className="text-text/70 text-sm leading-relaxed">{banner?.prop3_text || "Des coupes minimalistes inspirées par l'esthétique Old Money."}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dynamic Homepage Sections */}
      {error ? (
        <section className="py-20 container mx-auto px-4"><ErrorMessage /></section>
      ) : loading ? (
        <section className="py-20 container mx-auto px-4">
          <div className="flex gap-6 overflow-x-hidden">
            {[1, 2, 3, 4].map(i => <div key={i} className="min-w-[280px] md:w-1/4 flex-shrink-0"><Loader type="card" /></div>)}
          </div>
        </section>
      ) : (
        sections.map((section, sIdx) => {
          if (!section.products || section.products.length === 0) return null;
          
          return (
            <section key={section.id} className="py-16 container mx-auto px-4">
              <div className="flex justify-between items-end mb-8">
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-accent">{section.title}</h2>
                <Link to="/collections" className="text-text hover:text-accent transition-colors underline underline-offset-4">Tout voir</Link>
              </div>
              
              <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
                {section.products.map((prod, idx) => {
                  const price = prod.discount_price || prod.price;
                  const imageUrl = prod.images?.[0]?.image_url || prod.images?.[0]?.image || null;
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      key={prod.id} 
                      className="w-[70%] md:w-[30%] flex-shrink-0 snap-start group relative flex flex-col"
                    >
                      <Link to={`/produits/${prod.slug}`} className="block relative aspect-[3/4] bg-primary rounded-lg overflow-hidden mb-4 border border-border">
                        {imageUrl ? (
                          <img src={imageUrl} alt={prod.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-accent/50 group-hover:text-accent transition-colors duration-500">
                            <span className="font-playfair text-5xl font-bold tracking-widest opacity-30 group-hover:opacity-100 transition-opacity duration-500">OM</span>
                          </div>
                        )}
                        {prod.discount_price && (
                          <div className="absolute top-3 left-3 bg-error text-white text-xs font-bold px-2 py-1 rounded">PROMO</div>
                        )}
                      </Link>
                      
                      <div className="flex flex-col flex-grow">
                        <Link to={`/produits/${prod.slug}`}>
                          <h3 className="font-semibold text-lg line-clamp-1 hover:text-accent transition-colors">{prod.name}</h3>
                          <div className="flex gap-2 items-center mt-1 mb-3">
                            <span className="font-bold text-accent">{parseFloat(price).toFixed(2)} DZD</span>
                            {prod.discount_price && (
                              <span className="text-text/40 line-through text-sm">{parseFloat(prod.price).toFixed(2)} DZD</span>
                            )}
                          </div>
                        </Link>
                        
                        <Link to={`/produits/${prod.slug}`} className="mt-auto w-full block text-center py-2.5 border border-border hover:border-accent hover:text-accent transition-all rounded-md text-sm uppercase tracking-wider font-semibold">
                          Ajouter au Panier
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}

    </div>
  );
};

export default Home;
