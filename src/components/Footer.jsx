import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/10 pt-16 pb-24 md:pb-8 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
            <span className="font-playfair text-xl font-bold text-accent">OLD MONEY</span>
          </Link>
          <p className="text-text-light/60 text-sm">
            Le Style qui parle avant vous. L'élégance intemporelle pour l'homme algérien moderne.
          </p>
        </div>
        
        <div>
          <h4 className="font-playfair font-bold text-lg mb-4 text-accent">Boutique</h4>
          <ul className="space-y-2 text-text-light/80 text-sm">
            <li><Link to="/produits" className="hover:text-accent">Nouveautés</Link></li>
            <li><Link to="/produits" className="hover:text-accent">Tous les produits</Link></li>
            <li><Link to="/suivi" className="hover:text-accent">Suivre ma commande</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-playfair font-bold text-lg mb-4 text-accent">Aide & Info</h4>
          <ul className="space-y-2 text-text-light/80 text-sm">
            <li><a href="#" className="hover:text-accent">Livraison & Retours</a></li>
            <li><a href="#" className="hover:text-accent">Guide des tailles</a></li>
            <li><a href="#" className="hover:text-accent">Conditions Générales</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-playfair font-bold text-lg mb-4 text-accent">Nous contacter</h4>
          <p className="text-text-light/80 text-sm mb-2">Service client disponible 7j/7</p>
          <a href="#" className="text-accent text-sm hover:underline border border-accent px-4 py-2 rounded inline-block mt-2">
            Contacter sur WhatsApp
          </a>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-text-light/40 text-xs">
        &copy; {new Date().getFullYear()} Old Money Algeria. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;
