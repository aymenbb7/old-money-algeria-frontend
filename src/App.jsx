import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
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
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-bg-dark text-text-light pb-16 md:pb-0">
          <Navbar />
          <CartDrawer />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/produits" element={<Catalogue />} />
              <Route path="/produits/:slug" element={<ProductDetail />} />
              <Route path="/panier" element={<CartPage />} />
              <Route path="/commander" element={<Checkout />} />
              <Route path="/commande/:orderNumber" element={<OrderConfirmation />} />
              <Route path="/suivi" element={<OrderTracking />} />
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
