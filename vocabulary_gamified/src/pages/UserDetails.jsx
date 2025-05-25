import React, { useState, useEffect } from 'react';
import { ref, get, set, update } from "firebase/database";
import { initializeRealtimeDB } from "../config/firebaseConfig";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';

const UserDetails = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const [selectedTopics, setSelectedTopics] = useState([]);
  const [grade, setGrade] = useState('');
  const [age, setAge] = useState('');

  const handleTopicSelect = (topicId) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const function1 = async () => {
    const email = user.validKey;
    const db = initializeRealtimeDB();
    const userRef = ref(db, `userdata/${email}`);
    const userData = {
      topics: selectedTopics,
      grade: grade,
      age: age
    };

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        await update(userRef, userData);
        console.log("User updated successfully");
      } else {
        await set(userRef, userData);
        console.log("New user created successfully");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
    navigate('/mcq2');
  };
  // Available interest topics
  const interestTopics = [
    { id: 'food-health', name: 'Food & Health', icon: '🍎' },
    { id: 'places-travel', name: 'Places & Travel', icon: '✈️' },
    { id: 'festivals-celebrations', name: 'Festivals & Celebrations', icon: '🎉' },
    { id: 'folktales', name: 'Folktales', icon: '📖' },
    { id: 'fiction', name: 'Fiction', icon: '📚' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'heroes', name: 'Heroes', icon: '🦸' },
    { id: 'cartoons', name: 'Cartoons', icon: '🎨' },
    { id: 'animals', name: 'Animals', icon: '🐾' },
    { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
    { id: 'fairytales', name: 'Fairytales', icon: '🧚' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'nature', name: 'Nature', icon: '🌿' }
  ];


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Details</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {interestTopics.map(topic => (
          <div
            key={topic.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedTopics.includes(topic.id) ? 'bg-blue-100 border-blue-500' : 'bg-white'
            }`}
            onClick={() => handleTopicSelect(topic.id)}
          >
            <span className="text-2xl mr-2">{topic.icon}</span>
            <span>{topic.name}</span>
          </div>
        ))}
      </div>
      <div className="mb-4">
        <label className="block mb-2">Grade:</label>
        <input
          type="text"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Age:</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <button
        onClick={function1}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mr-2"
      >
        Next
      </button>
      
    </div>
  );
};

export default UserDetails;
