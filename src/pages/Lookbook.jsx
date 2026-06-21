import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchLookbookItems } from '../api';
import Loader from '../components/Loader';

const LookbookItem = ({ item, index }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  
  const num = (index + 1).toString().padStart(2, '0');

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden snap-start flex items-center justify-center">
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 w-full h-[120%] -top-[10%] bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${item.image})`,
          y 
        }}
      />
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-accent font-playfair text-xl md:text-2xl mb-4 font-bold"
        >
          {num}
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-cormorant text-5xl md:text-7xl font-bold text-text-light mb-6 uppercase"
        >
          {item.title}
        </motion.h2>
        
        {item.description && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-text-light/80 text-sm md:text-base font-light max-w-lg mb-10"
          >
            {item.description}
          </motion.p>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {item.collection_slug ? (
            <Link 
              to={`/collections/${item.collection_slug}`} 
              className="inline-block border border-accent text-accent tracking-[3px] px-8 py-3 uppercase text-sm font-semibold hover:bg-accent hover:text-black transition-colors duration-300"
            >
              Shop This Look
            </Link>
          ) : (
            <Link 
              to="/collections" 
              className="inline-block border border-accent text-accent tracking-[3px] px-8 py-3 uppercase text-sm font-semibold hover:bg-accent hover:text-black transition-colors duration-300"
            >
              Shop This Look
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
};

const Lookbook = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLookbookItems()
      .then(res => {
        // Handle paginated or non-paginated arrays
        const results = Array.isArray(res.results) ? res.results : res;
        setItems(results);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="h-screen w-full bg-[#0B4D2B] flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-cormorant text-5xl md:text-7xl font-bold text-accent mb-4">Bientôt disponible</h1>
        <p className="font-playfair italic text-text-light/90 text-xl md:text-2xl">Notre lookbook arrive très bientôt</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-y-auto snap-y snap-mandatory hide-scrollbar">
      {items.map((item, idx) => (
        <LookbookItem key={item.id} item={item} index={idx} />
      ))}
    </div>
  );
};

export default Lookbook;
