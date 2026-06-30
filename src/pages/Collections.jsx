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

  const [bgLoaded, setBgLoaded] = useState(false);
  const [activeBg, setActiveBg] = useState('');

  // Dynamic category hero background and title based on selected tab
  const activeColObj = collections.find(c => c.slug === selectedCol);
  
  const banner = banners.length > 0 ? banners[0] : null;
  const bannerImg = banner?.collections_hero_image_url || banner?.hero_image_url || null;
  
  const bgImg = activeColObj?.hero_image_url || activeColObj?.image_url || activeColObj?.image || bannerImg;
  const title = activeColObj?.name || banner?.collections_hero_title || "Nos Collections";

  useEffect(() => {
    if (!bgImg) {
      setActiveBg('');
      setBgLoaded(false);
      return;
    }
    setBgLoaded(false);
    const img = new Image();
    img.src = bgImg;
    img.onload = () => {
      setActiveBg(bgImg);
      setBgLoaded(true);
    };
  }, [bgImg]);

  const updateParams = (key, value) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
        <div
          className={`absolute inset-0 bg-cover bg-center ${bgLoaded ? '' : 'animate-pulse'}`}
          style={{ 
            backgroundImage: bgLoaded && activeBg ? `url(${activeBg})` : undefined,
            backgroundColor: bgLoaded ? undefined : '#161616',
            backgroundSize: 'cover',
            transition: 'background-image 0s'
          }}
        >
          <div className="absolute inset-0 bg-black/45"></div>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-playfair text-4xl md:text-6xl font-bold text-text mb-4"
          >
            {title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-text/80 text-lg md:text-xl font-light"
          >
            L'élégance à l'état pur.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 md:py-20">
        <div className="flex flex-col gap-6 mb-10 pb-6 border-b border-border">
          {/* Search */}
          <div className="relative w-full md:max-w-md mx-auto">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40" />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              className="w-full bg-cards border border-border rounded-md py-3 pl-10 pr-4 focus:outline-none focus:border-accent text-text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); updateParams('search', e.target.value); }}
            />
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-2 -mx-4 px-4 md:mx-0 md:px-0 justify-start md:justify-center">
            <button
              onClick={() => { setSelectedCol(''); updateParams('collection', ''); }}
              className={`whitespace-nowrap pb-2 px-1 text-sm md:text-base font-medium transition-all ${!selectedCol ? 'text-accent border-b-2 border-accent' : 'text-text/60 hover:text-text'}`}
            >
              Tout
            </button>
            {collections.map(c => (
              <button
                key={c.slug}
                onClick={() => { setSelectedCol(c.slug); updateParams('collection', c.slug); }}
                className={`whitespace-nowrap pb-2 px-1 text-sm md:text-base font-medium transition-all ${selectedCol === c.slug ? 'text-accent border-b-2 border-accent' : 'text-text/60 hover:text-text'}`}
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
          <div className="text-center py-20 text-text/50 border border-border rounded-lg">
            <Filter size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Aucun produit disponible</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            <AnimatePresence>
              {products.map((prod, idx) => {
                const price = prod.discount_price || prod.price;
                const mainImgObj = prod.images?.find(i => i.is_main) || prod.images?.[0];
                const imageUrl = mainImgObj ? (mainImgObj.image_url || mainImgObj.image) : null;
                
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
                    <Link to={`/produits/${prod.slug}`} className="block">
                      <div className="relative aspect-[3/4] bg-primary rounded-lg overflow-hidden mb-4 border border-border">
                        {imageUrl ? (
                          <img src={imageUrl} alt={prod.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-accent/50 group-hover:text-accent transition-colors duration-500">
                            <span className="font-playfair text-4xl md:text-5xl font-bold tracking-widest opacity-30 group-hover:opacity-100 transition-opacity duration-500">OM</span>
                          </div>
                        )}
                        {prod.discount_price && (
                          <div className="absolute top-2 left-2 bg-error text-white text-xs font-bold px-2 py-1 rounded">PROMO</div>
                        )}
                      </div>
                      <h3 className="font-semibold md:text-lg line-clamp-1">{prod.name}</h3>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="font-bold text-accent">{parseFloat(price).toFixed(2)} DZD</span>
                        {prod.discount_price && (
                          <span className="text-text/40 line-through text-xs md:text-sm">{parseFloat(prod.price).toFixed(2)} DZD</span>
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
