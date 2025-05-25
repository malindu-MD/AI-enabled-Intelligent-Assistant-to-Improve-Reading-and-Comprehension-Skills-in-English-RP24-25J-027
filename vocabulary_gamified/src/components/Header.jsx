// components/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Link } from 'react-router-dom';

const Header = ({ student, setShowPreferences, setShowAddWord, handleSignOut }) => {
  const navigate = useNavigate();

  const exitGame1 = () => navigate('/DashboardOne');
  const exitGame2 = () => navigate('/paragraph');




  
  return (
   <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <Link to="/" className="bg-indigo-500 hover:bg-indigo-500 transition-colors duration-200 px-4 py-2 rounded-full flex items-center shadow-md mr-4">
            <span className="mr-2">🏠</span><span>Home</span>
          </Link>

          
        
          <div className="flex ml-6 space-x-2">
      
      </div>
          <div className="flex items-center space-x-4">

     
            <div className="bg-indigo-500 px-3 py-1 rounded-full flex items-center">
              <span className="mr-2">⭐</span>
              <span>{student.points} pts</span>
            </div>
            <div className="bg-indigo-500 px-3 py-1 rounded-full flex items-center">
              <span className="mr-2">🔥</span>
              <span>{student.streak} days</span>
            </div>
            
            <button 
              onClick={() => {
                setShowPreferences(true);
                setShowAddWord(false);
              }}
              className="bg-indigo-500 px-3 py-1 rounded-full flex items-center hover:bg-indigo-400"
            >
              <span className="mr-2">⚙</span>
              <span>Preferences</span>
            </button>
            <div className={`${
  student.level === 'level' ? 'bg-gray-600' :
  student.level === 'Beginner' ? 'bg-blue-600' :
  student.level === 'Elementary' ? 'bg-green-600' :
  student.level === 'Intermediate' ? 'bg-yellow-600' :
  student.level === 'Upper Intermediate' ? 'bg-orange-600' :
  student.level === 'Advanced' ? 'bg-red-600' :
  student.level === 'Proficient' ? 'bg-purple-600' : 'bg-gray-600'
} ml-4 px-3 py-1 rounded-full flex items-center`}>
 
  <span>Your Level: <strong>{student.level}</strong> </span>
  <span className="mr-2">{
    student.level === 'Beginner' ? '🌱' :
    student.level === 'Elementary' ? '🌿' :
    student.level === 'Intermediate' ? '🌾' :
    student.level === 'Upper Intermediate' ? '🌲' :
    student.level === 'Advanced' ? '🌳' :
    student.level === 'Proficient' ? '🌟' : '👤'
  }</span>
</div>
          </div>
         
        </div>
      </header>
  );
};

export default Header;




 