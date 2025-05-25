import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderSample from '../components/HeaderSample';
import Footer from '../components/Footer';

const ReadifyWelcomePage = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [isVisible, setIsVisible] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Animate cards on mount
    const timer = setTimeout(() => {
      setIsVisible({ section1: true, section2: true, section3: true });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const startExperience = () => {
    alert('Ready to start your pronunciation journey! This would navigate to your main app.');
    // Add navigation logic here
  };

  const HeroIcon = ({ children, delay = 0 }) => (
    <div 
      className={`bg-blue-200 backdrop-blur-sm border-2 border-blue-400/10 rounded-full w-20 h-20 flex items-center justify-center text-3xl transition-all duration-300 hover:bg-blue-700 hover:-translate-y-3 hover:scale-110 animate-bounce`}
      style={{ 
        animationDelay: `${delay}s`,
        animationDuration: '3s',
        animationIterationCount: 'infinite'
      }}
    >
      {children}
    </div>
  );

  const FeatureItem = ({ icon, title }) => (
    <div className="bg-white p-5 rounded-2xl text-center border-2 border-blue-100 transition-all duration-300 hover:border-blue-400 hover:scale-105 hover:shadow-lg">
      <span className="text-4xl mb-3 block">{icon}</span>
      <div className="font-semibold text-gray-700">{title}</div>
    </div>
  );

  const StepItem = ({ number, icon, text }) => (
    <div className="flex items-center gap-5 p-5 bg-white rounded-2xl border-l-4 border-blue-500 shadow-lg transition-all duration-300 hover:translate-x-3 hover:shadow-xl">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
        {number}
      </div>
      <div className="font-semibold text-gray-700">
        <strong>{icon} {text.split(' ')[0]}</strong> {text.split(' ').slice(1).join(' ')}
      </div>
    </div>
  );

  const BenefitItem = ({ children }) => (
    <li className="flex items-center gap-3 py-2 text-lg text-gray-600">
      <span className="text-xl animate-pulse">✨</span>
      {children}
    </li>
  );

  const SectionCard = ({ sectionId, number, title, children, isExpanded }) => (
    <div 
      className={`bg-white rounded-3xl mx-auto mb-8 shadow-xl border border-blue-100 transition-all duration-700 overflow-hidden max-w-4xl transform ${
        isVisible[sectionId] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } hover:-translate-y-2 hover:shadow-2xl`}
    >
      <div 
        className="bg-gradient-to-r from-purple-800 to-blue-600 text-white p-3 cursor-pointer flex items-center gap-4 transition-all duration-300 relative overflow-hidden group"
        onClick={() => toggleSection(sectionId)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
        <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold relative z-10">
          {number}
        </div>
        <h2 className="text-xl font-semibold flex-1 relative z-10">{title}</h2>
        <span 
          className={`text-2xl transition-transform duration-300 relative z-10 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </div>
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-screen opacity-100 p-8' : 'max-h-0 opacity-0 p-0'
        } bg-gradient-to-br from-blue-50 to-blue-100`}
      >
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br   overflow-hidden">
    <HeaderSample/>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-100 text-white py-16 px-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/10 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white/15 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
        <h1 className="text-3xl md:text-xl font-extrabold  bg-gradient-to-r from-black to-black bg-clip-text text-transparent animate-pulse">
             
          </h1>
          <h1 className="text-6xl sm:text-4xl font-extrabold mb-4 text-blue-800">
          Welcome to Readify Pronunciation Coach
        </h1>

          <h1 className="text-6xl sm:text-2xl font-extrabold mb-12 bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent animate-pulse font-serif italic">
           This Is Your Time to Improve Pronunciation!
          </h1>
          {/* <p className="text-xl sm:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed from-blue-800 to-blue-950 font-serif italic tracking-wide">
  This Is Your Time to Improve Pronunciation!
</p> */}

          
          <div className="flex justify-center gap-8 mb-10 flex-wrap">
            <HeroIcon delay={0}>🎤</HeroIcon>
            <HeroIcon delay={0.5}>🗣️</HeroIcon>
            <HeroIcon delay={1}>📈</HeroIcon>
            <HeroIcon delay={1.5}>⭐</HeroIcon>
          </div>
          
          <p className="text-m mb-8 opacity-90 max-w-2xl mx-auto text-blue-800">
            Transform your pronunciation skills with interactive exercises, and personalized learning paths. 
            Join thousands of learners who've already improved their speaking confidence!
          </p>
          
          <button 
            onClick={() => navigate('/pronounce-coach')}
            className="bg-gradient-to-r from-blue-500 to-red-500 text-white border-none py-5 px-10 text-xl font-semibold rounded-full cursor-pointer transition-all duration-300 shadow-2xl hover:-translate-y-1 hover:shadow-3xl hover:from-blue-900 hover:to-red-900 uppercase tracking-wider transform hover:scale-105"
          >
            Get Experience
          </button>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white -mt-10 rounded-t-3xl relative z-30 py-16 px-5">
        <div className="max-w-6xl mx-auto">
          {/* Section 1 */}
          <SectionCard
            sectionId="section1"
            number="1️⃣"
            title="Why Is Correct Pronunciation Important   ?"
            isExpanded={expandedSections.section1}
          >
            <p className="text-lg leading-relaxed text-black mb-6 font-bold  ">
              Clear pronunciation isn't just about sounding good — it's about being understood, confident and connected{' '}
              {/* <span className="bg-gradient-to-r  px-2 py-1 rounded-lg font-semibold text-gray-800">understood</span>,{' '}
              <span className="bg-gradient-to-r  px-2 py-1 rounded-lg font-semibold text-gray-800">confident</span>, and{' '}
              <span className="bg-gradient-to-r  px-2 py-1 rounded-lg font-semibold text-gray-800">connected</span>. */}
            </p>
            
            <p className="text-lg font-bold text-blue-700 mb-4 text-left">🎯 With Correct Pronunciation, You Can:</p>
            <ul className="space-y-0 mb-2 ">
              <BenefitItem>Express your ideas more clearly</BenefitItem>
              <BenefitItem>Avoid misunderstandings in conversations</BenefitItem>
              <BenefitItem>Build confidence in public speaking or interviews</BenefitItem>
              <BenefitItem>Understand native speakers more easily</BenefitItem>
              <BenefitItem>Sound more fluent and natural</BenefitItem>
            </ul>
            
            <p className="text-lg text-blue-700 mb-6 font-bold text-left">
              🗣 Pronunciation is a skill — and like any skill, it can be learned with practice. That includes:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureItem icon="🔤" title="Phoneme Sounds" />
              <FeatureItem icon="📊" title="Word Stress & Intonation" />
              <FeatureItem icon="💬" title="Feedback & Improvement" />
            </div>
          </SectionCard>

          {/* Section 2 */}
          <SectionCard
            sectionId="section2"
            number="2️⃣"
            title="Why Use This App?"
            isExpanded={expandedSections.section2}
          >
            <p className="text-lg leading-relaxed text-black mb-6 font-bold">
              This app is your{' '}
              personal pronunciation coach ! 
              It's designed to help you:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <FeatureItem icon="🎯" title="Identify your weak spots" />
              <FeatureItem icon="🔁" title="Practice with smart tools" />
              <FeatureItem icon="✅" title="Track your progress" />
              <FeatureItem icon="💬" title="Speak with confidence" />
            </div>
            
            <p className="text-lg font-semibold text-gray-700 mb-4">You'll gain:</p>
            <ul className="space-y-2">
              <BenefitItem>🎤 Real-time feedback on your pronunciation</BenefitItem>
              <BenefitItem>👂 Listening skills through example audios</BenefitItem>
              <BenefitItem>🧠 Memory and speaking fluency with daily practice</BenefitItem>
              <BenefitItem>⭐ A sense of achievement as your accuracy improves</BenefitItem>
            </ul>
          </SectionCard>

          {/* Section 3 */}
          <SectionCard
            sectionId="section3"
            number="3️⃣"
            title="How to Use This App to Improve Your Skills"
            isExpanded={expandedSections.section3}
          >
            <p className="text-lg text-gray-700 mb-6">It's simple and powerful:</p>
            
            <div className="space-y-6 mb-8">
              <StepItem number="1" icon="🔍" text="Start with a quick test to discover your current level" />
              <StepItem number="2" icon="🎧" text="Listen to native pronunciations" />
              <StepItem number="3" icon="🗣" text="Record your own voice and get instant feedback" />
              <StepItem number="4" icon="📈" text="Check your progress with detailed reports" />
              <StepItem number="5" icon="🔄" text="Repeat and refine — every small step builds your skill" />
            </div>
            
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-2xl p-6 relative">
              <div className="absolute -top-4 left-6 bg-yellow-400 p-2 rounded-full text-xl">💡</div>
              <div className="ml-4">
                <strong className="text-yellow-800">Tip:</strong>
                <span className="text-yellow-700 ml-2">Practice a little every day. Just 10 minutes can lead to huge improvements over time!</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      <Footer text="Adaptive Pronunciation Coaching for Beginners to Advanced" />
    </div>
  );
};

export default ReadifyWelcomePage;