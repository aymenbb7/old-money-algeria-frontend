import { Home, Search, ShoppingBag, Truck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const BottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/collections', icon: Search, label: 'Collections' },
    { path: '/panier', icon: ShoppingBag, label: 'Panier', badge: totalItems },
    { path: '/suivi', icon: Truck, label: 'Suivi' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#050505]/95 backdrop-blur-md border-t border-white/10 z-50 px-2 py-2 safe-area-pb">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full py-1 ${isActive ? 'text-accent' : 'text-text-light/60 hover:text-text-light'}`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-accent text-bg-dark text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
