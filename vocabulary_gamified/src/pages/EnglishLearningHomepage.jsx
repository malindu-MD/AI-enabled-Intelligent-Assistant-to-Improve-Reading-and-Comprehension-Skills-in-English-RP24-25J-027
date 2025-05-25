import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Users, Award, Target, Play, Star, ChevronRight, X, ArrowRight, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import firebase from 'firebase/compat/app';
import HomePageHeader from '../components/HomePageHeader';
import 'firebase/compat/auth';
import { Link,useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
const EnglishLearningHomepage = () => {
  const navigate = useNavigate();
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const { user,setUser } = useUser();
  // Mock user data for demonstration

  const dropdownRef = useRef(null);

  console.log('user', user);

  // Close dropdown when clicking outside
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

  useEffect(() => {
    // Check if user is new (simulate with setTimeout for demo)
    const timer = setTimeout(() => {
      setShowTour(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const tourSteps = [
    {
      target: 'hero',
      title: 'Welcome to EnglishMaster!',
      content: 'Your journey to English fluency starts here. Let us show you around!'
    },
    {
      target: 'vocabulary',
      title: 'Vocabulary Improvement',
      content: 'Build your word power with interactive games and daily challenges.'
    },
    {
      target: 'grammar',
      title: 'Grammar Mastery',
      content: 'Master English grammar with step-by-step lessons and practice exercises.'
    },
    {
      target: 'speaking',
      title: 'Speaking Practice',
      content: 'Improve your pronunciation and confidence with AI-powered speaking exercises.'
    },
    {
      target: 'listening',
      title: 'Listening Skills',
      content: 'Enhance your listening comprehension with engaging audio content.'
    }
  ];

  const nextTourStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setShowTour(false);
    }
  };

  const skipTour = () => {
    setShowTour(false);
    console.log('sss', user);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setUser(null);
      setShowProfileDropdown(false);
      alert('Logged out successfully!');
    }
  };

  const handleSettings = () => {
    setShowProfileDropdown(false);
    alert('Navigate to Settings page');
  };

  const handleProfile = () => {
    setShowProfileDropdown(false);
    alert('Navigate to Profile page');
  };

  const handleLogin = () => {
   window.location.href = '/login';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const TourOverlay = () => {
    if (!showTour) return null;

    const currentStep = tourSteps[tourStep];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-blue-600">{currentStep.title}</h3>
            <button onClick={skipTour} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-700 mb-6">{currentStep.content}</p>
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= tourStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={skipTour}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Skip
              </button>
              <button
                onClick={nextTourStep}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
              >
                {tourStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <HomePageHeader/>
      {/* Hero Section */}
      <section id="hero" className={`relative py-20 px-4 sm:px-6 lg:px-8 ${showTour && tourSteps[tourStep].target === 'hero' ? 'ring-4 ring-blue-400' : ''}`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Master English with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Confidence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join millions of students worldwide in their English learning journey. Interactive lessons, 
            personalized practice, and real-time feedback to help you achieve fluency faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
              Start Learning Free
            </button>
            <button className="flex items-center justify-center border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all">
              <Play className="mr-2" size={20} />
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Learning Sections */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Four Pillars of English Mastery
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive approach covers all aspects of English learning to ensure your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vocabulary Section */}
            <div id="vocabulary" className={`bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 ${showTour && tourSteps[tourStep].target === 'vocabulary' ? 'ring-4 ring-blue-400' : ''}`}>
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">Vocabulary Improvement</h3>
              </div>
              <p className="text-gray-600 mb-6">
               Enhance your English vocabulary with our intelligent, personalized learning module. This AI-powered tool adapts to your skill level using CEFR classification and offers gamified activities that make learning fun and effective.
              </p>

    
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Real-time Your Vocabulary proficiency assessment</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Personalized vocabulary games based on your level</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>7000+ CEFR-aligned words across diverse topics</span>
                </div>
              </div>
              <button className="flex items-center text-blue-600 hover:text-blue-800 font-semibold">
                Explore Vocabulary <ChevronRight size={16} className="ml-1" />
              </button>
            </div>

            {/* Grammar Section */}
            <div id="grammar" className={`bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 ${showTour && tourSteps[tourStep].target === 'grammar' ? 'ring-4 ring-blue-400' : ''}`}>
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-full">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">Comprehension Practice</h3>
              </div>
              <p className="text-gray-600 mb-6">
              Develop fundamental reading skills with leveled passages, comprehension questions, and vocabulary in context.    </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Personalize Content</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Literacy Development</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Comprehension Skills</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  console.log('Grammar button clicked', user);
                  console.log('user', user);
                  if (user?.isNew) {
                    navigate('/user-details')
                  } else {
                   navigate('/paragraph')
                  }
                }} 
                className="flex items-center text-blue-600 hover:text-blue-800 font-semibold"
              >
                Practice Quiz <ChevronRight size={16} className="ml-1" />
              </button>
            </div>

            {/* Speaking Section */}
            <div id="speaking" className={`bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 ${showTour && tourSteps[tourStep].target === 'speaking' ? 'ring-4 ring-blue-400' : ''}`}>
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">Speaking Practice</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Build confidence in speaking English with our AI-powered conversation practice. 
                Get real-time pronunciation feedback and practice real-world scenarios.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>AI conversation partner</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Pronunciation analysis</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Real-world conversations</span>
                </div>
              </div>
              <button onClick={() => navigate('/pronounce-startup')} className="flex items-center text-blue-600 hover:text-blue-800 font-semibold">
                Practice Pronunciation <ChevronRight size={16} className="ml-1" />
              </button>
            </div>

            {/* Listening Section */}
            <div id="listening" className={`bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 ${showTour && tourSteps[tourStep].target === 'listening' ? 'ring-4 ring-blue-400' : ''}`}>
              <div className="flex items-center mb-6">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">Listening Skills</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Improve your listening comprehension with diverse audio content. From beginner-friendly 
                stories to advanced podcasts and news articles.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Diverse audio content</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Multiple accents & speeds</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Interactive comprehension tests</span>
                </div>
              </div>
              <button className="flex items-center text-blue-600 hover:text-blue-800 font-semibold">
                Improve Listening <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">2M+</div>
              <div className="text-blue-200">Active Students</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-200">Lessons Completed Daily</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-200">Success Rate</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Learning Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your English Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have transformed their English skills with our proven method.
          </p>
          <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
            Get Started Today - It's Free!
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">EnglishMaster</span>
              </div>
              <p className="text-gray-400">
                Empowering students worldwide to achieve English fluency through innovative learning methods.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Learning</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Vocabulary</a></li>
                <li><a href="#" className="hover:text-white">Grammar</a></li>
                <li><a href="#" className="hover:text-white">Speaking</a></li>
                <li><a href="#" className="hover:text-white">Listening</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EnglishMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <TourOverlay />
    </div>
  );
};

export default EnglishLearningHomepage;