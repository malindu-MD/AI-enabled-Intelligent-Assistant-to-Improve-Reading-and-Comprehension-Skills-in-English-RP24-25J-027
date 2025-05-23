import React, { useState } from 'react';
import { useUser } from './UserContext';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const HeaderSample = () => {


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
    <header className="bg-indigo-600 text-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {/* Left side intentionally left minimal – no buttons or level info */}
        </div>

        <div className="flex items-center space-x-4">
          <button
            // onClick={() => {
            //   setShowPreferences(true);
            //   setShowAddWord(false);
            // }}
            className="bg-indigo-500 px-3 py-1 rounded-full flex items-center hover:bg-indigo-400"
          >
            <span className="mr-2">⚙️</span>
            <span>Preferences</span>
          </button>
          <div
            className="bg-indigo-800 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
            onClick={handleSignOut}
            title="Sign Out"
          >
            {student.name?.charAt(0).toUpperCase() || '👤'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderSample;
