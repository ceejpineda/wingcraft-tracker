import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-white border-b border-gray-200 mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-0">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold sm:py-4">
          Wingcraft Models Order Tracker
        </h1>
        <nav className="flex flex-wrap gap-2 sm:ml-auto">
          <Link
            to="/"
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              isActive('/')
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📋 Kanban
          </Link>
          <Link
            to="/analytics"
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              isActive('/analytics')
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Analytics
          </Link>
          <Link
            to="/done"
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              isActive('/done')
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✓ Done
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Navigation;

