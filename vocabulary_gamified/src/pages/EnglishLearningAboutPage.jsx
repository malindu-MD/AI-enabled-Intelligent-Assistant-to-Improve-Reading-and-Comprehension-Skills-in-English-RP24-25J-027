import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Award, Target, Play, Star, ChevronRight, X, ArrowRight, Globe, Heart, Lightbulb, Zap, Shield, Trophy, MapPin, Mail, Linkedin } from 'lucide-react';
import HomePageHeader from '../components/HomePageHeader';

const EnglishLearningAboutPage = () => {
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [activeTab, setActiveTab] = useState('mission');

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
      title: 'Welcome to Our Story!',
      content: 'Learn about our mission to make English learning accessible to everyone worldwide.'
    },
    {
      target: 'mission',
      title: 'Our Mission',
      content: 'Discover what drives us to create the best English learning experience.'
    },
    {
      target: 'team',
      title: 'Meet Our Team',
      content: 'Get to know the passionate people behind Readify.'
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

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      image: '/api/placeholder/150/150',
      bio: 'Former English teacher with 15+ years of experience. Passionate about making language learning accessible to everyone.',
      location: 'San Francisco, CA',
      linkedin: '#'
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      image: '/api/placeholder/150/150',
      bio: 'Tech veteran with expertise in AI and machine learning. Believes technology can revolutionize education.',
      location: 'Seattle, WA',
      linkedin: '#'
    },
    {
      name: 'Dr. Emma Rodriguez',
      role: 'Head of Curriculum',
      image: '/api/placeholder/150/150',
      bio: 'PhD in Applied Linguistics. Designs our learning methodologies based on latest research in language acquisition.',
      location: 'Austin, TX',
      linkedin: '#'
    },
    {
      name: 'David Park',
      role: 'Head of Product',
      image: '/api/placeholder/150/150',
      bio: 'UX designer turned product leader. Focuses on creating intuitive and engaging learning experiences.',
      location: 'New York, NY',
      linkedin: '#'
    },
    {
      name: 'Lisa Wang',
      role: 'Head of Marketing',
      image: '/api/placeholder/150/150',
      bio: 'Marketing strategist with a passion for education. Helps spread our mission to learners worldwide.',
      location: 'Los Angeles, CA',
      linkedin: '#'
    },
    {
      name: 'James Thompson',
      role: 'Head of Customer Success',
      image: '/api/placeholder/150/150',
      bio: 'Dedicated to ensuring every student achieves their learning goals. Former customer support specialist.',
      location: 'Chicago, IL',
      linkedin: '#'
    }
  ];

  const values = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Global Accessibility',
      description: 'We believe quality English education should be accessible to everyone, regardless of location or economic background.'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Student-Centered',
      description: 'Every decision we make is guided by what\'s best for our students and their learning journey.'
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'Innovation',
      description: 'We continuously innovate using the latest technology and research to improve learning outcomes.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Trust & Safety',
      description: 'We maintain the highest standards of privacy, security, and ethical practices in everything we do.'
    }
  ];

  const milestones = [
    {
      year: '2018',
      title: 'The Beginning',
      description: 'Founded by Sarah and Michael with a simple mission: make English learning accessible to everyone.'
    },
    {
      year: '2019',
      title: 'First 10K Users',
      description: 'Reached our first major milestone with 10,000 active users and launched our mobile app.'
    },
    {
      year: '2020',
      title: 'AI Integration',
      description: 'Introduced AI-powered pronunciation feedback and personalized learning paths.'
    },
    {
      year: '2021',
      title: 'Global Expansion',
      description: 'Expanded to 50+ countries and launched multi-language support for our platform.'
    },
    {
      year: '2022',
      title: '1M+ Students',
      description: 'Celebrated reaching over 1 million students worldwide and launched live conversation sessions.'
    },
    {
      year: '2023',
      title: 'Premium Features',
      description: 'Launched our premium tier with advanced features and expanded our curriculum significantly.'
    },
    {
      year: '2024',
      title: 'Today',
      description: 'Serving 2M+ students globally with cutting-edge learning technology and exceptional outcomes.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      {/* <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-blue-600">Readify</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Courses</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                <a href="#" className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium">About Us</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav> */}

      <HomePageHeader/>

      {/* Hero Section */}
      <section id="hero" className={`relative py-20 px-4 sm:px-6 lg:px-8 ${showTour && tourSteps[tourStep].target === 'hero' ? 'ring-4 ring-blue-400' : ''}`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Empowering
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Global Communication</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            We're on a mission to break down language barriers and connect people worldwide through effective English learning. 
            Since 2018, we've helped over 2 million students achieve their language goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">2M+</div>
              <div className="text-gray-600">Students Worldwide</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">50+</div>
              <div className="text-gray-600">Countries Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values Tabs */}
      <section id="mission" className={`py-20 px-4 sm:px-6 lg:px-8 bg-white ${showTour && tourSteps[tourStep].target === 'mission' ? 'ring-4 ring-blue-400' : ''}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Foundation</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 p-1 rounded-lg">
              {['mission', 'vision', 'values'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            {activeTab === 'mission' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  To democratize English language learning by providing high-quality, accessible, and effective educational tools 
                  that empower individuals worldwide to achieve their personal and professional goals through improved communication skills.
                </p>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  A world where language is no longer a barrier to opportunity, education, or connection. We envision a global 
                  community where everyone has the confidence and skills to communicate effectively in English, opening doors 
                  to endless possibilities.
                </p>
              </div>
            )}

            {activeTab === 'values' && (
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {values.map((value, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 text-blue-600">
                        {value.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h4>
                        <p className="text-gray-600">{value.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Our Story Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">From a simple idea to transforming millions of lives</p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-blue-200"></div>

            {milestones.map((milestone, index) => (
              <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'} mb-12`}>
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                  <div className="bg-white rounded-lg p-6 shadow-lg">
                    <div className="text-sm font-semibold text-blue-600 mb-2">{milestone.year}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
                
                {/* Timeline dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className={`py-20 px-4 sm:px-6 lg:px-8 bg-white ${showTour && tourSteps[tourStep].target === 'team' ? 'ring-4 ring-blue-400' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The passionate people behind your learning experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 font-medium">{member.role}</p>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.bio}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{member.location}</span>
                  </div>
                  <a href={member.linkedin} className="text-blue-600 hover:text-blue-800">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Want to Learn More?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            We'd love to hear from you. Whether you have questions, feedback, or just want to say hello, 
            we're here to help you on your English learning journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center">
              <Mail className="w-5 h-5 mr-2" />
              Contact Us
            </button>
            <button className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg border-2 border-blue-300">
              Join Our Community
            </button>
          </div>
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
            <p>&copy; 2025 Readify. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <TourOverlay />
    </div>
  );
};

export default EnglishLearningAboutPage;