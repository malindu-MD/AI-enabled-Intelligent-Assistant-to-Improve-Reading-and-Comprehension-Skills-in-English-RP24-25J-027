// File: LoginForm.jsx
import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { useUser } from '../components/UserContext';

// Firebase configuration - Replace with your own config
const firebaseConfig = {

  apiKey: "AIzaSyDTkKVmntt5-ybspd5KKs8BA8hzPxSQwYo",

  authDomain: "vocabularystudent-a6eaf.firebaseapp.com",

  projectId: "vocabularystudent-a6eaf",

  storageBucket: "vocabularystudent-a6eaf.firebasestorage.app",

  messagingSenderId: "912862279337",

  appId: "1:912862279337:web:7af985558bd57f1b3d9bb8",

  measurementId: "G-5N2JJN2Y9C"

};
// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const LoginForm = () => {
  const { setUser } = useUser();
  const [isLoginActive, setIsLoginActive] = useState(true);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginStage, setLoginStage] = useState(0);
  
  // Sign Up state
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupStage, setSignupStage] = useState(0);
  const [xp, setXp] = useState(0);

  const toggleForm = () => {
    setIsLoginActive(!isLoginActive);
    // Reset errors when switching forms
    setLoginError('');
    setSignupError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      // Set login in progress stage
      setLoginStage(1);
      
      // Wait for firebase authentication
      const userCredential = await firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword);
      
      // Fetch user data from database
      const userRef = firebase.database().ref(`users/${userCredential.user.uid}`);
      userRef.once('value', (snapshot) => {
        const userData = snapshot.val();
        // Store user data in context
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          ...userData
        });
        console.log(userData);
      });
      
      // Set login success stage
      setLoginStage(2);
    } catch (error) {
      setLoginStage(0);
      setLoginError(error.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignupError('');
    
    if (signupPassword !== confirmPassword) {
      setSignupError('Passwords do not match!');
      return;
    }
    
    try {
      // Move to stage 1 (creating account)
      setSignupStage(1);
      setXp(25);
      
      // Create user in Firebase Auth
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(signupEmail, signupPassword);
      
      // Move to stage 2 (saving profile)
      setSignupStage(2);
      setXp(75);
      
      // Prepare user data with default values
      const userData = {
        name,
        email: signupEmail,
        level: 'level', // Default value
        preferences: 'any', // Default value
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        xp: 0,
        badgesEarned: ['new_adventurer']
      };
      
      // Save user data in Realtime Database
      await firebase.database().ref(`users/${userCredential.user.uid}`).set(userData);
      
      // Store user data in context
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        ...userData
      });
      
      // Move to stage 3 (completed)
      setSignupStage(3);
      setXp(100);
    } catch (error) {
      setSignupStage(0);
      setXp(0);
      setSignupError(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-700 to-blue-500 p-4">
      <div className={`bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-4xl h-[600px] relative ${isLoginActive ? '' : 'transform-active'}`}>
        
        {/* Sign Up Form */}
        <div className={`absolute top-0 h-full transition-all duration-600 ease-in-out w-1/2 ${isLoginActive ? 'opacity-0 translate-x-0 z-1' : 'opacity-100 translate-x-full z-5'}`}>
          <form className="flex flex-col justify-center items-center h-full px-10" onSubmit={handleSignUp}>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Create Account</h1>
            
            <div className="w-full mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-blue-600">{xp} XP</span>
              </div>
              
              <div className="w-full h-3 bg-gray-200 rounded-full mb-3">
                <div 
                  className="h-full bg-yellow-500 rounded-full transition-all duration-500" 
                  style={{ width: `${xp}%` }}>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <div className={`text-xs font-medium text-center ${signupStage >= 0 ? 'text-blue-600' : 'text-gray-400'}`}>Start</div>
                <div className={`text-xs font-medium text-center ${signupStage >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Account</div>
                <div className={`text-xs font-medium text-center ${signupStage >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Profile</div>
                <div className={`text-xs font-medium text-center ${signupStage >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Complete</div>
              </div>
            </div>
            
            {signupError && (
              <div className="w-full mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                {signupError}
              </div>
            )}
            
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
              className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-md shadow-md hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform transition hover:-translate-y-1"
            >
              {signupStage === 0 && 'Start Your Journey'}
              {signupStage === 1 && 'Creating Account...'}
              {signupStage === 2 && 'Saving Profile...'}
              {signupStage === 3 && ' Awaits!'}
            </button>
          </form>
        </div>
        
        {/* Sign In Form */}
        <div className={`absolute top-0 h-full transition-all duration-600 ease-in-out w-1/2 ${isLoginActive ? 'opacity-100 z-2' : 'opacity-0 -translate-x-full z-1'}`}>
          <form className="flex flex-col justify-center items-center h-full px-10" onSubmit={handleLogin}>
            <h1 className="text-3xl font-bold mb-6 text-gray-800"> Login</h1>
            
            <div className="w-full mb-6">
              <div className="flex justify-between mb-2">
                <div className={`text-sm font-medium text-center w-1/3 ${loginStage >= 0 ? 'text-blue-600' : 'text-gray-400'}`}>Start</div>
                <div className={`text-sm font-medium text-center w-1/3 ${loginStage >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Verifying</div>
                <div className={`text-sm font-medium text-center w-1/3 ${loginStage >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Success</div>
              </div>
              
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                  style={{ width: `${loginStage === 0 ? '33.3%' : loginStage === 1 ? '66.6%' : '100%'}` }}>
                </div>
              </div>
            </div>
            
            {loginError && (
              <div className="w-full mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                {loginError}
              </div>
            )}
            
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-md shadow-md hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform transition hover:-translate-y-1"
            >
              {loginStage === 1 ? 'Embarking...' : 'Begin '}
            </button>
          </form>
        </div>
        
        {/* Overlay Container */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-100 ${isLoginActive ? '' : '-translate-x-full'}`}>
          <div className={`bg-gradient-to-r from-purple-600 to-blue-500 text-white relative h-full w-[200%] -left-full transform transition-transform duration-600 ease-in-out ${isLoginActive ? '' : 'translate-x-1/2'}`}>
            <div className={`absolute flex flex-col justify-center items-center top-0 h-full w-1/2 px-10 text-center transition-transform duration-600 ease-in-out -translate-x-[20%] ${isLoginActive ? '' : 'translate-x-0'}`}>
              <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
              <p className="mb-6">Continue your learning  by logging in</p>
              <button 
                onClick={toggleForm} 
                className="border border-white bg-transparent rounded-full px-6 py-2 text-white font-medium hover:bg-white hover:text-purple-600 transition-colors"
              >
                Sign In
              </button>
            </div>
            <div className={`absolute flex flex-col justify-center items-center top-0 right-0 h-full w-1/2 px-10 text-center transition-transform duration-600 ease-in-out ${isLoginActive ? '' : 'translate-x-[20%]'}`}>
              <h1 className="text-3xl font-bold mb-2">Hello,!</h1>
              <p className="mb-6">Enter your details and begin your learning journey</p>
              <button 
                onClick={toggleForm} 
                className="border border-white bg-transparent rounded-full px-6 py-2 text-white font-medium hover:bg-white hover:text-purple-600 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;