'use client';

import Link from 'next/link';

const Sidebar = () => {
  const navItems = [
    { label: 'Home', icon: '🏠', href: '/dashboard' }, // home links to dashboard
    { label: 'Analytics', icon: '📊', href: '/analytics' },
    { label: 'Activities', icon: '🚴', href: '/activities' },
    { label: 'Comparison', icon: '🏃🏻‍♂️🏃🏻', href: '/comparison' },
    { label: 'Segments', icon: '🚀', href: '/segments' },
    { label: 'Mapping', icon: '🗺️', href: '/maps' },
    { label: 'Settings', icon: '⚙️', href: '/settings' },
    { label: 'Profile', icon: '👤', href: '/profile' },
    { label: 'Help', icon: '❓', href: '/help' },
  ];

  return (
    <aside className="w-20 bg-black h-full flex flex-col items-center py-4 space-y-4 fixed">
      {navItems.map((item, index) => (
        <Link href={item.href} key={index}>
          <button
            className="w-12 h-12 flex items-center justify-center bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition duration-300"
            title={item.label}
          >
            {item.icon}
          </button>
        </Link>
      ))}
    </aside>
  );
};

export default Sidebar;