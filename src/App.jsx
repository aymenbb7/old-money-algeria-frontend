import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { fetchSettings } from './api';

import Home from './pages/Home';
import Collections from './pages/Collections';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import BottomNav from './components/BottomNav';

function App() {
  useEffect(() => {
    const initTheme = async () => {
      try {
        const settings = await fetchSettings();
        if (settings && settings.theme_colors) {
          const t = settings.theme_colors;
          document.documentElement.style.setProperty('--color-bg', t.bg);
          document.documentElement.style.setProperty('--color-text', t.text);
          document.documentElement.style.setProperty('--color-accent', t.accent);
          document.documentElement.style.setProperty('--color-cards', t.cards);
          document.documentElement.style.setProperty('--color-primary', t.primary);
        }
      } catch (err) {
        console.error("Failed to load theme settings", err);
      }
    };
    initTheme();
  }, []);

  return (
    <CartProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-bg text-text pb-16 md:pb-0">
          <Navbar />
          <CartDrawer />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/produits/:slug" element={<ProductDetail />} />
              <Route path="/panier" element={<CartPage />} />
              <Route path="/commander" element={<Checkout />} />
              <Route path="/confirmation/:orderNumber" element={<OrderConfirmation />} />
              <Route path="/suivi" element={<OrderTracking />} />
              <Route path="/lookbook" element={<Navigate to="/" replace />} />
              <Route path="/produits" element={<Navigate to="/collections" replace />} />
            </Routes>
          </main>
          <Footer />
          <BottomNav />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
