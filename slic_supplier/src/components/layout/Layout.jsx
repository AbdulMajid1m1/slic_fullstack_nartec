import { useState } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import Sidebar from './sidebar/sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) { 
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="h-screen bg-primary flex">
      {/* Sidebar Component - Your existing sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        collapsed={sidebarCollapsed}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Fixed at top */}
        <div className="bg-primary px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-200 flex justify-between items-center flex-shrink-0 z-30 sticky top-0">
          {/* Left side - Menu button (mobile) */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Menu className="text-gray-600" size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent text-lg font-semibold">
                <span className="hidden sm:inline">Saudi Leather Industries</span>
                <span className="sm:hidden">SLIC</span>
              </div>
            </div>
          </div>
          
          {/* Right side - Actions */}            
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              SLIC
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-gray-700">Saudi Leather Industries</div>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
        
        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;