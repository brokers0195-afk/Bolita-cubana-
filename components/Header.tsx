import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 md:mb-12">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-500 pb-2">
        Lotería BoliCuba
      </h1>
    </header>
  );
};

export default Header;