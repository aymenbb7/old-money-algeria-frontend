import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { fetchProducts, fetchCollections, fetchHomepageBanners } from '../api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Collections = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCol, setSelectedCol] = useState(searchParams.get('collection') || '');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
        const [prodRes, colRes, bannerRes] = await Promise.all([
          fetchProducts({ 
            status: 'PUBLISHED', 
            search: searchTerm, 
            collections__slug: selectedCol
          }),
          fetchCollections(),
          fetchHomepageBanners().catch(() => [])
        ]);
        setProducts(prodRes.results || []);
        setCollections(colRes.results || []);
        setBanners(bannerRes || []);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCol]);

  }, [searchTerm, selectedCol]);

  const updateParams = (key, value) => {
    if (value) searchParams.set(key, value);
    else searchParams.delete(key);
    setSearchParams(searchParams);
  };

  const banner = banners.length > 0 ? banners[0] : null;
  const bgImg = banner?.collections_hero_image || banner?.hero_image;
  const title = banner?.collections_hero_title || "Nos Collections";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ 
            backgroundImage: bgImg ? `url(${bgImg})` : undefined,
            backgroundColor: bgImg ? undefined : '#0B4D2B'
          }}
        >
          <div className="absolute inset-0 bg-black/45"></div>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-playfair text-4xl md:text-6xl font-bold text-text-light mb-4"
          >
            {title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-text-light/80 text-lg md:text-xl font-light"
          >
            L'élégance à l'état pur.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 md:py-20">
        <div className="flex flex-col gap-6 mb-10 pb-6 border-b border-white/10">
          {/* Search */}
          <div className="relative w-full md:max-w-md mx-auto">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              className="w-full bg-white/5 border border-white/10 rounded-md py-3 pl-10 pr-4 focus:outline-none focus:border-accent text-text-light"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); updateParams('search', e.target.value); }}
            />
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-2 -mx-4 px-4 md:mx-0 md:px-0 justify-start md:justify-center">
            <button
              onClick={() => { setSelectedCol(''); updateParams('collection', ''); }}
              className={`whitespace-nowrap pb-2 px-1 text-sm md:text-base font-medium transition-all ${!selectedCol ? 'text-accent border-b-2 border-accent' : 'text-text-light/60 hover:text-text-light'}`}
            >
              Tout
            </button>
            {collections.map(c => (
              <button
                key={c.slug}
                onClick={() => { setSelectedCol(c.slug); updateParams('collection', c.slug); }}
                className={`whitespace-nowrap pb-2 px-1 text-sm md:text-base font-medium transition-all ${selectedCol === c.slug ? 'text-accent border-b-2 border-accent' : 'text-text-light/60 hover:text-text-light'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <ErrorMessage />
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Loader key={i} type="card" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-text-light/50 border border-white/10 rounded-lg">
            <Filter size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Aucun produit disponible</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            <AnimatePresence>
              {products.map((prod, idx) => {
                const price = prod.discount_price || prod.price;
                const img = prod.images && prod.images.length > 0 ? prod.images[0].image : null;
                
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    key={prod.id} 
                    className="group cursor-pointer"
                  >
                    <Link to={`/collections/${prod.slug}`} className="block">
                      <div className="relative aspect-[3/4] bg-white/5 rounded-lg overflow-hidden mb-4 border border-white/5">
                        {img ? (
                          <img src={img} alt={prod.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">Sans Image</div>
                        )}
                        {prod.discount_price && (
                          <div className="absolute top-2 left-2 bg-error text-white text-xs font-bold px-2 py-1 rounded">PROMO</div>
                        )}
                      </div>
                      <h3 className="font-semibold md:text-lg line-clamp-1">{prod.name}</h3>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="font-bold text-accent">{parseFloat(price).toFixed(2)} DZD</span>
                        {prod.discount_price && (
                          <span className="text-text-light/40 line-through text-xs md:text-sm">{parseFloat(prod.price).toFixed(2)} DZD</span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Collections;
