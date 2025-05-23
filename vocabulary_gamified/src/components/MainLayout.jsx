// components/MainLayout.js
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import HeaderSample from './HeaderSample';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-indigo-50">
      <HeaderSample 
      />
      <main className="flex-grow p-4">
       



      





      </main>
      <Footer  text="Personalized vocabulary learning for students at all levels" />
    </div>
  );
};


export default MainLayout;
