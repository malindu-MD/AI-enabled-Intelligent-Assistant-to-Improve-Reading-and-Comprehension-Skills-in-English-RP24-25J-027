import React, { useState } from 'react';
import { useUser } from './UserContext';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { BookOpen, Users, Award, Target, Play, Star, ChevronRight, X, ArrowRight, Check, Zap, Crown, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';



const HomePageHeader = () => {


    const {user,setUser}=useUser();

    const handleSignOut = () => {
      firebase.auth().signOut();
      setUser(null);
    };
    const [student, setStudent] = useState({
      name: "Alex Chen",
      level: user.level,
      points: 780,
      streak: 5,
      preferences: {
        gameStyles: ["matching", "quiz", "flashcards"],
        categories: ["academic", "technology", "literature"],
        difficulty: "medium",
        learningStyle: "visual",
        dailyGoal: 10,
        reviewFrequency: "daily"
      }
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
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              {/* <Link to="/EnglishLearningAboutPage" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About US</Link>
              <Link to="/EnglishPricePlan" className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium">Pricing</Link>
              <Link to="/community" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Community</Link> */}
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>
  );
};

export default HomePageHeader;
