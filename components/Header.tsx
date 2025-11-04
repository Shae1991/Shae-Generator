import React from 'react';

interface HeaderProps {
  activePage: 'generate' | 'gallery' | 'models';
  onNavigate: (page: 'generate' | 'gallery' | 'models') => void;
}

const navItems = [
  { id: 'generate', label: 'Generator' },
  { id: 'gallery', label: 'My Gallery' },
  { id: 'models', label: 'My Models' },
];

export const Header: React.FC<HeaderProps> = ({ activePage, onNavigate }) => {
  return (
    <header className="bg-black/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-800">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Ultimate AI Generator
          </h1>
          <p className="text-gray-500 text-sm mt-1">Free, Fast, Unlimited AI Image Generation</p>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-2 rounded-lg bg-gray-900 p-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  activePage === item.id
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
