import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Award, Target, Play, Star, ChevronRight, X, ArrowRight, Check, Zap, Crown, Gift } from 'lucide-react';
import HomePageHeader from '../components/HomePageHeader';

const EnglishPricePlan = () => {
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [billingCycle, setBillingCycle] = useState('monthly');

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
      title: 'Welcome to Our Pricing!',
      content: 'Choose the perfect plan for your English learning journey!'
    },
    {
      target: 'free-plan',
      title: 'Free Plan',
      content: 'Start your learning journey at no cost with essential features.'
    },
    {
      target: 'premium-plan',
      title: 'Premium Plan',
      content: 'Unlock advanced features and accelerate your learning progress.'
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
                <a href="#" className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Community</a>
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
            Choose Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Learning Path</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Whether you're just starting or looking to accelerate your progress, we have the perfect plan for your English learning journey.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <span className={`text-sm font-medium mr-3 ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ml-3 ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Free Plan */}
            <div id="free-plan" className={`bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 relative ${showTour && tourSteps[tourStep].target === 'free-plan' ? 'ring-4 ring-blue-400' : ''}`}>
              <div className="absolute -top-4 left-8">
                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <Gift className="w-4 h-4 mr-1" />
                  Free Forever
                </span>
              </div>
              
              <div className="text-center mb-8 pt-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
                <p className="text-gray-600 mb-6">Perfect for getting started with English learning</p>
                
                <div className="text-center">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 ml-2">forever</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Access to 500+ vocabulary words</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Basic grammar lessons</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">5 speaking exercises per day</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">10 listening exercises per day</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Progress tracking</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Community forum access</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Mobile app access</span>
                </div>
              </div>

              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                Get Started Free
              </button>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                No credit card required • Start learning immediately
              </p>
            </div>

            {/* Premium Plan */}
            <div id="premium-plan" className={`bg-white rounded-3xl p-8 shadow-2xl border-2 border-blue-200 relative transform scale-105 ${showTour && tourSteps[tourStep].target === 'premium-plan' ? 'ring-4 ring-blue-400' : ''}`}>
              <div className="absolute -top-4 left-8">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <Crown className="w-4 h-4 mr-1" />
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-8 pt-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4">
                  <Crown className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>
                <p className="text-gray-600 mb-6">Accelerate your learning with advanced features</p>
                
                <div className="text-center">
                  {billingCycle === 'monthly' ? (
                    <>
                      <span className="text-5xl font-bold text-gray-900">$19</span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </>
                  ) : (
                    <div>
                      <span className="text-2xl text-gray-400 line-through">$228</span>
                      <span className="text-5xl font-bold text-gray-900 ml-2">$179</span>
                      <span className="text-gray-600 ml-2">/year</span>
                      <div className="text-green-600 text-sm font-semibold mt-1">Save $49 annually</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="text-sm font-semibold text-blue-600 mb-2">Everything in Free, plus:</div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited vocabulary (10,000+ words)</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Advanced grammar & writing courses</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited speaking & listening practice</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">AI-powered pronunciation feedback</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Personalized learning path</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Live conversation sessions</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Offline mode</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Priority customer support</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Certificates & achievements</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                Start Premium Trial
              </button>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                7-day free trial • Cancel anytime • No commitment
              </p>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-full px-6 py-3">
              <Award className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">30-day money-back guarantee on all premium plans</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I upgrade or downgrade my plan anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade to Premium anytime to unlock all features. You can also downgrade from Premium to Free, though you'll lose access to premium features at the end of your billing cycle.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is the free plan really free forever?
              </h3>
              <p className="text-gray-600">
                Absolutely! Our free plan gives you access to essential learning features with no time limits. You can learn English effectively without ever paying a dime.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What's included in the 7-day free trial?
              </h3>
              <p className="text-gray-600">
                The free trial gives you full access to all Premium features for 7 days. No credit card required to start, and you can cancel anytime during the trial period.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer student discounts?
              </h3>
              <p className="text-gray-600">
                Yes! We offer a 50% student discount on all premium plans. Contact our support team with your student ID to apply for the discount.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Your English Learning Journey Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join millions of students who are improving their English skills with our proven methods.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
              Start Free Forever
            </button>
            <button className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg border-2 border-blue-300">
              Try Premium Free
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

    
    </div>
  );
};

export default EnglishPricePlan;