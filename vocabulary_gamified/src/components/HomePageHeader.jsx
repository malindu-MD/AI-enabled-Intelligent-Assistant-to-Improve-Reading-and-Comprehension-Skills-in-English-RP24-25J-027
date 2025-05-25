import React, {useEffect, useState,useRef } from 'react';
import { useUser } from './UserContext';
import firebase from 'firebase/compat/app';
import { BookOpen, Users, Award, Target, Play, Star, ChevronRight, X, ArrowRight, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Link ,useNavigate} from 'react-router-dom';


import 'firebase/compat/auth';


const HomePageHeader = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setUser(null);
      setShowProfileDropdown(false);
      alert('Logged out successfully!');
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSettings = () => {
    setShowProfileDropdown(false);
    alert('Navigate to Settings page');
  };

  const handleProfile = () => {
    setShowProfileDropdown(false);
    alert('Navigate to Profile page');
  };

  const handleLogin = () => {
  navigate('/login'); // Navigate to the login page
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Use optional chaining and default fallback to avoid errors if user is null
  const [student, setStudent] = useState({
    name: "Alex Chen",
    level: user?.level || 0,  // safe access with fallback
    points: 780,
    streak: 5,
    preferences: {
      gameStyles: ["matching", "quiz", "flashcards"],
      categories: ["academic", "technology", "literature"],
      difficulty: "medium",
      learningStyle: "visual",
      dailyGoal: 10,
      reviewFrequency: "daily",
    },
  });

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-blue-600">Readify</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
            <Link to="/EnglishLearningAboutPage" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About US</Link>
            <Link to="/EnglishPricePlan" className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium">Pricing</Link>
            <Link to="/community" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Community</Link>
          </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-full px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {getInitials(user.name)}
                    </div>
                    <span className="hidden sm:block text-gray-700 font-medium">{user.name}</span>
                    <ChevronDown 
                      size={16} 
                      className={`text-gray-500 transition-transform duration-200 ${
                        showProfileDropdown ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      
                      <button
                        onClick={handleProfile}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <User size={16} className="mr-3 text-gray-400" />
                        View Profile
                      </button>
                      
                      <button
                        onClick={handleSettings}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <Settings size={16} className="mr-3 text-gray-400" />
                        Settings
                      </button>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          <LogOut size={16} className="mr-3 text-red-500" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
  );
};

export default HomePageHeader;
