
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-center py-6 mt-12 border-t border-white/10">
      <p className="text-gray-400 text-sm">
        © {new Date().getFullYear()} Lotería BoliCuba. Todos los derechos reservados.
      </p>
      <p className="text-amber-400 text-sm mt-2 font-semibold">
        ¡Que la suerte te acompañe!
      </p>
    </footer>
  );
};

export default Footer;