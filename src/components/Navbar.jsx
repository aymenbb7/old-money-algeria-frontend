import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Logo from './Logo';

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-bg-dark/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <Logo />
          <span className="font-playfair text-xl font-bold tracking-wider hidden sm:block text-accent">OLD MONEY</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-semibold tracking-wide text-sm">
          <Link to="/" className={`hover:text-accent transition-colors ${location.pathname === '/' ? 'text-accent' : ''}`}>ACCUEIL</Link>
          <Link to="/produits" className={`hover:text-accent transition-colors ${location.pathname.startsWith('/produits') ? 'text-accent' : ''}`}>CATALOGUE</Link>
          <Link to="/suivi" className={`hover:text-accent transition-colors ${location.pathname.startsWith('/suivi') ? 'text-accent' : ''}`}>SUIVI</Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:text-accent transition-colors">
              <ShoppingBag size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-bg-dark text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
          <div className="md:hidden">
            <Link to="/panier" className="relative p-2 hover:text-accent transition-colors block">
              <ShoppingBag size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-bg-dark text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
