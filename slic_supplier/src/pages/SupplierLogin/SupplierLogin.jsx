import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Images } from '../../utils/imageConfig';

const SupplierLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Login successful!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-secondary to-secondary p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 inline-block mb-8 border border-white/20">
            <img 
              src={Images?.slicLogo} 
              alt="LIC Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>

          <h1 className="text-white text-5xl font-bold mb-4 leading-tight">
            Suppliers Portal
          </h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">
            Welcome back! Manage your supplies, track orders, and collaborate seamlessly.
          </p>
        </div>

        <div className="relative z-10 text-blue-100 text-sm">
          <p>© 2025 SLIC. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="rounded-2xl p-6 inline-block mb-4 shadow-lg">
              <img 
                src={Images?.slicLogo} 
                alt="LIC Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Suppliers Portal</h2>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Suppliers Login</h2>
              <p className="text-gray-500">Enter your credentials to access your account</p>
            </div>

            <form className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@licapp.online"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 hover:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••"
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 hover:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                // type="submit"
                onClick={() => navigate('/dashboard')}
                className="w-full bg-secondary text-white py-4 px-6 rounded-xl font-semibold hover:from-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
              >
                LOG IN
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Create Account Link */}
            <div className="mt-8 text-center">
              <span 
                onClick={() => navigate('/create-account')}
                className="text-secondary hover:cursor-pointer font-medium text-sm inline-flex items-center gap-1 group"
              >
                Create your Account
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierLogin;