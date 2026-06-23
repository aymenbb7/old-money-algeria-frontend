import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { fetchSettings } from '../api';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/0000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/0000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/0000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/0000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
);

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings().then(res => {
      if (res) setSettings(res);
    }).catch(err => console.error("Error fetching settings:", err));
  }, []);

  return (
    <footer className="bg-[#050505] border-t border-border pt-16 pb-24 md:pb-8 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
            <span className="font-playfair text-xl font-bold text-accent">OLD MONEY</span>
          </Link>
          <p className="text-text/60 text-sm">
            Le Style qui parle avant vous. L'élégance intemporelle pour l'homme algérien moderne.
          </p>
        </div>
        
        <div>
          <h4 className="font-playfair font-bold text-lg mb-4 text-accent">Boutique</h4>
          <ul className="space-y-2 text-text/80 text-sm">
            <li><Link to="/collections" className="hover:text-accent">Nouveautés</Link></li>
            <li><Link to="/collections" className="hover:text-accent">Tous les produits</Link></li>
            <li><Link to="/suivi" className="hover:text-accent">Suivre ma commande</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-playfair font-bold text-lg mb-4 text-accent">Aide & Info</h4>
          <ul className="space-y-2 text-text/80 text-sm">
            <li><Link to="/suivi" className="hover:text-accent">Livraison & Retours / Suivi</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-playfair font-bold text-lg mb-4 text-accent">Suivez-nous</h4>
          <p className="text-text/80 text-sm mb-4">Rejoignez la communauté Old Money.</p>
          <div className="flex gap-4">
            {settings?.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-text/60 hover:text-accent transition-colors">
                <InstagramIcon />
              </a>
            )}
            {settings?.tiktok_url && (
              <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-text/60 hover:text-accent transition-colors">
                <TikTokIcon />
              </a>
            )}
            {settings?.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-text/60 hover:text-accent transition-colors">
                <FacebookIcon />
              </a>
            )}
            {settings?.whatsapp_number && (
              <a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-text/60 hover:text-accent transition-colors">
                <WhatsAppIcon />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border text-center text-text/40 text-xs">
        &copy; 2025 Old Money In Algeria. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;
