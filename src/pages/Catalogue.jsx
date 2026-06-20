import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { fetchProducts, fetchCollections } from '../api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Catalogue = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCol, setSelectedCol] = useState(searchParams.get('collection') || '');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
        const [prodRes, colRes] = await Promise.all([
          fetchProducts({ 
            status: 'PUBLISHED', 
            search: searchTerm, 
            collections__slug: selectedCol,
            ordering: ordering 
          }),
          fetchCollections()
        ]);
        setProducts(prodRes.results || []);
        setCollections(colRes.results || []);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce search slightly
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCol, ordering]);

  const updateParams = (key, value) => {
    if (value) searchParams.set(key, value);
    else searchParams.delete(key);
    setSearchParams(searchParams);
  };

  return (
    <div className="container mx-auto px-4 py-10 md:py-20">
      <div className="mb-10 text-center">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-accent mb-4">Catalogue</h1>
        <p className="text-text-light/60">Toute notre collection pour l'homme raffiné.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10 pb-6 border-b border-white/10">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" />
          <input 
            type="text" 
            placeholder="Rechercher un produit..." 
            className="w-full bg-white/5 border border-white/10 rounded-md py-3 pl-10 pr-4 focus:outline-none focus:border-accent text-text-light"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); updateParams('search', e.target.value); }}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="bg-white/5 border border-white/10 rounded-md py-3 px-4 focus:outline-none focus:border-accent appearance-none"
            value={selectedCol}
            onChange={(e) => { setSelectedCol(e.target.value); updateParams('collection', e.target.value); }}
          >
            <option value="" className="bg-bg-dark">Toutes les catégories</option>
            {collections.map(c => <option key={c.slug} value={c.slug} className="bg-bg-dark">{c.name}</option>)}
          </select>
          <select 
            className="bg-white/5 border border-white/10 rounded-md py-3 px-4 focus:outline-none focus:border-accent appearance-none"
            value={ordering}
            onChange={(e) => { setOrdering(e.target.value); updateParams('ordering', e.target.value); }}
          >
            <option value="" className="bg-bg-dark">Trier par défaut</option>
            <option value="price" className="bg-bg-dark">Prix : Croissant</option>
            <option value="-price" className="bg-bg-dark">Prix : Décroissant</option>
            <option value="-created_at" className="bg-bg-dark">Plus récent</option>
          </select>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((prod, idx) => {
            const price = prod.discount_price || prod.price;
            const img = prod.images && prod.images.length > 0 ? prod.images[0].image : null;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 4) * 0.1 }}
                key={prod.id} 
                className="group cursor-pointer"
              >
                <Link to={`/produits/${prod.slug}`} className="block">
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
        </div>
      )}
    </div>
  );
};

export default Catalogue;
