import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { fetchProductBySlug, fetchProducts } from '../api';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Selections
  const [activeImage, setActiveImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
        const prod = await fetchProductBySlug(slug);
        setProduct(prod);
        if (prod.images?.length > 0) {
          setActiveImage(prod.images[0].image_url || prod.images[0].image);
        }
        
        // Auto select first variant if exists
        if (prod.variants?.length > 0) {
          setSelectedSize(prod.variants[0].size || '');
          setSelectedColor(prod.variants[0].color || '');
        }

        // Fetch related products (same category)
        if (prod.collections?.length > 0) {
          const relRes = await fetchProducts({ collections__slug: prod.collections[0].slug });
          setRelated(relRes.results?.filter(p => p.id !== prod.id).slice(0, 4) || []);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug]);

  if (error) return <ErrorMessage message="Produit introuvable." />;
  if (loading) return <div className="container mx-auto px-4 py-10"><Loader /></div>;
  if (!product) return null;

  const price = product.discount_price || product.price;

  // Derive unique sizes and colors
  const uniqueSizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))];
  const variantsForSize = selectedSize ? product.variants.filter(v => v.size === selectedSize) : product.variants;
  const uniqueColors = [...new Set(variantsForSize.map(v => v.color).filter(Boolean))];
  
  const currentVariant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
  const isOutOfStock = currentVariant ? currentVariant.stock <= 0 : product.status === 'OUT_OF_STOCK';

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert("Veuillez sélectionner la taille et la couleur.");
      return;
    }
    addToCart(product, selectedSize, selectedColor, 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-text-light/60 mb-6 md:mb-10">
        <Link to="/" className="hover:text-accent">Accueil</Link>
        <ChevronRight size={14} />
        <Link to="/collections" className="hover:text-accent">Collections</Link>
        <ChevronRight size={14} />
        <span className="text-text-light truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-[#0B4D2B] rounded-lg overflow-hidden border border-white/5">
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-accent/50">
                <span className="font-playfair text-6xl font-bold tracking-widest opacity-30">OM</span>
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x">
              {product.images.map(img => {
                const imgUrl = img.image_url || img.image;
                return (
                  <button 
                    key={img.id} 
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-20 h-24 flex-shrink-0 rounded overflow-hidden border-2 transition-colors snap-center ${activeImage === imgUrl ? 'border-accent' : 'border-transparent'}`}
                  >
                    <img src={imgUrl} className="w-full h-full object-cover" alt="Thumb" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="font-bold text-2xl text-accent">{parseFloat(price).toFixed(2)} DZD</span>
            {product.discount_price && (
              <span className="text-text-light/40 line-through text-lg">{parseFloat(product.price).toFixed(2)} DZD</span>
            )}
            {isOutOfStock && <span className="bg-error/20 text-error text-xs font-bold px-2 py-1 rounded">Rupture de stock</span>}
          </div>

          <p className="text-text-light/80 mb-8 leading-relaxed">
            {product.description}
          </p>

          {/* Selectors */}
          {uniqueSizes.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-sm">Taille</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {uniqueSizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] px-4 py-2 rounded border font-semibold transition-all ${selectedSize === size ? 'border-accent bg-accent text-bg-dark' : 'border-white/20 hover:border-white/50'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {uniqueColors.length > 0 && (
            <div className="mb-8">
              <span className="font-semibold text-sm block mb-2">Couleur</span>
              <div className="flex flex-wrap gap-3">
                {uniqueColors.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded border font-semibold transition-all ${selectedColor === color ? 'border-accent text-accent' : 'border-white/20 hover:border-white/50'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto">
            {/* Desktop Button */}
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="hidden md:flex btn-primary w-full items-center justify-center gap-2 text-lg py-4"
            >
              <ShoppingBag size={20} />
              {isOutOfStock ? 'Indisponible' : 'Ajouter au Panier'}
            </button>

            {/* Mobile Sticky Button */}
            <div className="md:hidden fixed bottom-16 left-0 w-full p-4 bg-bg-dark/95 backdrop-blur border-t border-white/10 z-40">
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                <ShoppingBag size={20} />
                {isOutOfStock ? 'Indisponible' : 'Ajouter au Panier'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-24 pt-12 border-t border-white/10">
          <h2 className="font-playfair text-2xl font-bold mb-8">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {related.map(prod => {
              const pPrice = prod.discount_price || prod.price;
              const imgUrl = prod.images?.[0]?.image_url || prod.images?.[0]?.image || null;
              return (
                <Link to={`/produits/${prod.slug}`} key={prod.id} className="group block">
                  <div className="aspect-[3/4] bg-[#0B4D2B] rounded-lg overflow-hidden mb-3">
                    {imgUrl ? (
                      <img src={imgUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={prod.name} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-accent/50 group-hover:text-accent transition-colors duration-500">
                        <span className="font-playfair text-3xl font-bold tracking-widest opacity-30 group-hover:opacity-100 transition-opacity duration-500">OM</span>
                      </div>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm line-clamp-1">{prod.name}</h4>
                  <span className="font-bold text-accent text-sm">{parseFloat(pPrice).toFixed(2)} DZD</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
