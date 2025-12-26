import { Outlet } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { FiSun, FiMoon, FiLogOut, FiList, FiUsers, FiPlusCircle, FiDownload } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const MainLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-82 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center h-20 px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Teknopark Zimmet</h1>
          </div>
          
          <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              {/* User menu */}
              <Link
                to="/app/my-assets"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiList className="w-5 h-5 mr-3" />
                Üzerime Zimmetliler
              </Link>

              {/* Admin menu */}
              {user?.role === 'admin' && (
                <div className="space-y-2">
                  <Link
                    to="/admin/users"
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiUsers className="w-5 h-5 mr-3" />
                    Kullanıcı Yönetimi
                  </Link>
                  <Link
                    to="/admin/assign"
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiPlusCircle className="w-5 h-5 mr-3" />
                    Zimmet Ekle
                  </Link>
                  <Link
                    to="/admin/assignments"
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiList className="w-5 h-5 mr-3" />
                    Bütün Zimmetler
                  </Link>
                  <Link
                    to="/admin/categories"
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiList className="w-5 h-5 mr-3" />
                    Kategoriler
                  </Link>
                </div>
              )}
            </nav>

            <div className="mt-auto space-y-2">
              <button
                onClick={toggleTheme}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'dark' ? (
                  <>
                    <FiSun className="w-5 h-5 mr-3" />
                    Aydınlık Tema
                  </>
                ) : (
                  <>
                    <FiMoon className="w-5 h-5 mr-3" />
                    Karanlık Tema
                  </>
                )}
              </button>
              
              <a
                href="/templates/zimmet-sablon.docx"
                download
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiDownload className="w-5 h-5 mr-3" />
                Şablonu İndir
              </a>
              
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <FiLogOut className="w-5 h-5 mr-3" />
                Çıkış Yap
              </button>
              
              {user && (
                <div className="flex items-center p-2 mt-4 text-sm text-gray-700 dark:text-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-bold text-primary-600 dark:text-primary-400"> Teknopark Zimmet</h1>
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
