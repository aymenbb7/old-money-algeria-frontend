import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Clock } from 'lucide-react';
import { fetchProducts } from '../api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchProducts({ status: 'PUBLISHED', is_new_arrival: 'True' });
        setProducts(res.results || []);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-bg-dark">
          {/* Abstract background elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-bg-dark opacity-50"></div>
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px]"></div>
          <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-playfair text-5xl md:text-7xl font-bold mb-6 text-accent"
          >
            OLD MONEY
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-text-light/90 mb-10 font-light tracking-wide"
          >
            Le Style qui parle avant vous
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <Link to="/produits" className="btn-primary inline-block text-lg px-8 py-4 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              Découvrir la Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals (Horizontal Scroll on Mobile) */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-accent">Nouveautés</h2>
          <Link to="/produits" className="text-text-light hover:text-accent transition-colors underline underline-offset-4">Tout voir</Link>
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
                  <Link to={`/produits/${prod.slug}`} className="block">
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
