import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message = "Une erreur est survenue lors du chargement des données. Veuillez réessayer." }) => {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-6">
      <AlertCircle size={48} className="text-error mb-4 opacity-80" />
      <h3 className="font-playfair text-xl text-error font-bold mb-2">Erreur de connexion</h3>
      <p className="text-text-light/60 max-w-md">{message}</p>
      <button onClick={() => window.location.reload()} className="mt-6 btn-outline">
        Réessayer
      </button>
    </div>
  );
};

export default ErrorMessage;
