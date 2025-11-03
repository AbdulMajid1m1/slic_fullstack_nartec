import React from 'react';
import { 
  Home,
  X,
  LogOut,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Images } from '../../../utils/imageConfig';

const Sidebar = ({ sidebarOpen, setSidebarOpen, collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navSections = [
    {
      title: null,
      items: [
        { icon: Home, label: 'Dashboard', path: '/dashboard' }
      ]
    },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavClick = (item) => {
    navigate(item.path);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <>
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen bg-primary z-50 transform transition-all duration-300 ease-in-out flex flex-col
        lg:relative lg:translate-x-0 lg:z-10
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64
        border-r border-white/10
        ${collapsed ? 'lg:overflow-visible' : ''}
        shadow-2xl
      `}>
        
        {/* Close button for mobile */}
        <div className="lg:hidden flex justify-end px-4 py-4 flex-shrink-0">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-primary transition-colors duration-200"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Logo Section */}
        <div className={`px-6 flex-shrink-0 transition-all duration-300 ${
          collapsed ? 'lg:px-2' : ''
        } bg-primary`}>
          <div className="flex items-center justify-center sm:pt-3 pt-0">
            <img 
              src={Images?.slicLogo} 
              alt="Saudi Leather Industries"
              className="h-16 w-auto object-contain cursor-pointer"
              onClick={() => navigate('/dashboard')}
            />
          </div>
        </div>
        
        {/* Navigation - Scrollable area */}
        <div className={`flex-grow ${
          collapsed 
            ? 'lg:overflow-visible' 
            : 'overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent'
        }`}>
          <div className="px-4 py-4">
            {navSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-4">
                {section.title && (
                  <div className="px-5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    {section.icon && <section.icon size={12} />}
                    {!collapsed && (
                      <>
                        <span>{section.title}</span>
                        {section.badge && (
                          <span className="ml-auto bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold shadow-md animate-pulse">
                            {section.badge}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
                {section.items.map((item, itemIndex) => {
                  const IconComponent = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <div 
                      key={itemIndex}
                      onClick={() => handleNavClick(item)}
                      className={`flex items-center px-4 py-3 mb-1 rounded-lg cursor-pointer transition-all duration-300 relative group ${
                        active 
                          ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-white shadow-lg' 
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      } ${collapsed ? 'lg:justify-center' : ''}`}
                    >
                      {active && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r" />
                      )}
                      <IconComponent className={`${collapsed ? '' : 'mr-4'} flex-shrink-0`} size={18} />
                      {!collapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] hidden lg:block pointer-events-none shadow-xl">
                          {item.label}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button - Fixed at bottom */}
        <div className="px-4 pb-4 border-t border-white/10 pt-4 flex-shrink-0 bg-primary">
          <div 
            onClick={handleLogout}
            className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 relative group text-gray-400 hover:bg-red-900/30 hover:text-red-400 ${
              collapsed ? 'lg:justify-center' : ''
            }`}
          >
            <LogOut className={`${collapsed ? '' : 'mr-4'} flex-shrink-0`} size={18} />
            {!collapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] hidden lg:block pointer-events-none shadow-xl">
                Logout
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;