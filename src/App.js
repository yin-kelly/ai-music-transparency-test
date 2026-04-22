import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Play, Pause, RotateCcw, ChevronRight, Disc3, Sparkles, Users, AlertCircle, CheckCircle2, XCircle, Headphones, Music2, BrainCircuit, Eye } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// MOCK DATA
const SONGS = [
  { 
    id: 1, 
    title: "Song 1",  // Generic for Phase 1 & 2
    actualTitle: "A Little Thing Like Love",  // Real title for reveal
    artist: "Kayla Kross",  // Real artist for reveal
    genre: "Pop", 
    actualType: "ai", 
    audioUrl: "https://github.com/yin-kelly/ai-music-transparency-test/raw/main/public/audio/ai-1.mp3", 
    color: "#FF6B9D",
    coverArt: "/ai-1-cover.jpeg"
  },
  { 
    id: 2, 
    title: "Song 2", 
    actualTitle: "Cross My Mind",
    artist: "Olivia Dean",
    genre: "Indie", 
    actualType: "human", 
    audioUrl: "https://github.com/yin-kelly/ai-music-transparency-test/raw/main/public/audio/human-2.mp3", 
    color: "#4ECDC4",
    coverArt: "/human-2-cover.jpeg"
  },
  { 
    id: 3, 
    title: "Song 3", 
    actualTitle: "Into the Blue",
    artist: "Sienna Rose",
    genre: "Lo-fi", 
    actualType: "ai", 
    audioUrl: "https://github.com/yin-kelly/ai-music-transparency-test/raw/main/public/audio/ai-3.mp3", 
    color: "#95E1D3",
    coverArt: "/ai-3-cover.jpeg"
  },
  { 
    id: 4, 
    title: "Song 4", 
    actualTitle: "A Million Colors",
    artist: "Vinih Pray",
    genre: "Country", 
    actualType: "ai", 
    audioUrl: "https://github.com/yin-kelly/ai-music-transparency-test/raw/main/public/audio/ai-4.mp3", 
    color: "#F38181",
    coverArt: "/ai-4-cover.jpeg"
  },
  { 
    id: 5, 
    title: "Song 5", 
    actualTitle: "My Darling Forever",
    artist: "Rosie & The Originals",
    genre: "Ambient", 
    actualType: "human", 
    audioUrl: "https://github.com/yin-kelly/ai-music-transparency-test/raw/main/public/audio/human-5.mp3", 
    color: "#AA96DA",
    coverArt: "/human-5-cover.jpeg"
  },
  { 
    id: 6, 
    title: "Song 6", 
    actualTitle: "Influence",
    artist: "Aries Ivory (feat. Eric Bellinger)",
    genre: "Indie", 
    actualType: "hybrid", 
    audioUrl: "https://github.com/yin-kelly/ai-music-transparency-test/raw/main/public/audio/hybrid-6.mp3", 
    color: "#FCBAD3",
    coverArt: "/hybrid-6-cover.jpeg"
  }
];

const AGGREGATE_DATA = {
  accuracy: {
    overall: 58,
    byGenre: [
      { genre: 'Pop', accuracy: 62, fill: '#FF6B9D' },
      { genre: 'Indie', accuracy: 54, fill: '#4ECDC4' },
      { genre: 'Lo-fi', accuracy: 48, fill: '#95E1D3' },
      { genre: 'Country', accuracy: 65, fill: '#F38181' },
      { genre: 'Ambient', accuracy: 52, fill: '#AA96DA' }
    ]
  },
  preferenceShift: [
    { category: 'AI Music', before: 6.8, after: 5.2 },
    { category: 'Human Music', before: 7.1, after: 7.9 },
    { category: 'Hybrid', before: 6.5, after: 6.8 }
  ],
  labelingSupport: [
    { name: 'Strongly Support', value: 68, fill: '#FF6B9D' },
    { name: 'Somewhat Support', value: 23, fill: '#4ECDC4' },
    { name: 'Neutral', value: 6, fill: '#95E1D3' },
    { name: 'Oppose', value: 3, fill: '#F38181' }
  ],
  radarData: [
    { dimension: 'Enjoyment', ai: 68, human: 79 },
    { dimension: 'Creativity', ai: 52, human: 85 }
  ]
};

// Animated waveform component
function Waveform({ isPlaying, color = "#FF6B9D" }) {
  return (
    <div className="flex items-center gap-1 h-12">
      {[...Array(32)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`}
          style={{
            height: `${isPlaying ? Math.random() * 100 : 20}%`,
            backgroundColor: color,
            animationDelay: `${i * 50}ms`,
            opacity: 0.7 + Math.random() * 0.3
          }}
        />
      ))}
    </div>
  );
}

// Spinning vinyl record
function VinylRecord({ isPlaying, color = "#FF6B9D", size = "large" }) {
  const sizeClasses = size === "large" ? "w-64 h-64" : size === "medium" ? "w-32 h-32" : "w-16 h-16";
  
  return (
    <div className={`${sizeClasses} relative`}>
      <div className={`w-full h-full rounded-full border-8 border-black relative overflow-hidden ${isPlaying ? 'animate-spin' : ''}`}
           style={{ 
             background: `radial-gradient(circle at center, #1a1a1a 0%, ${color}40 30%, #1a1a1a 50%, ${color}60 70%, #1a1a1a 100%)`,
             animationDuration: '3s'
           }}>
        {/* Grooves */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-black/20"
            style={{
              top: `${5 + i * 4}%`,
              left: `${5 + i * 4}%`,
              right: `${5 + i * 4}%`,
              bottom: `${5 + i * 4}%`,
            }}
          />
        ))}
        {/* Center label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-black border-4 border-white flex items-center justify-center">
          <Disc3 className="text-white" size={size === "large" ? 32 : 20} />
        </div>
      </div>
    </div>
  );
}

// Navigation Bar
function NavigationBar({ currentSection, onNavigate }) {
  const sections = [
  { id: 'results', label: 'Your Results', icon: Sparkles },
  { id: 'overview', label: 'The Problem', icon: Eye },
  { id: 'recommendations', label: 'Take Action', icon: AlertCircle },
  { id: 'citations', label: 'Sources', icon: BrainCircuit }
];

  return (
    <nav className="border-b-2 border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center gap-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
className={`px-6 py-4 font-bold uppercase text-sm tracking-wider transition-all border-b-4 ${
  currentSection === id || (currentSection === 'quiz' && id === 'quiz')
    ? 'border-pink-500 text-pink-500'
    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
}`}
            >
              <Icon size={16} className="inline mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [section, setSection] = useState('intro');
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [ratings, setRatings] = useState({});
  const [revealedRatings, setRevealedRatings] = useState({});
  const [labelingSupport, setLabelingSupport] = useState(null);
  const [continueListening, setContinueListening] = useState({});
  const [quizPhase, setQuizPhase] = useState('identify');
  const [isPlaying, setIsPlaying] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
const [aggregateData, setAggregateData] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const audioRef = useRef(null);

  const currentSong = SONGS[currentSongIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [currentSongIndex]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
  if (section === 'results' && !aggregateData) {
    loadAggregateData();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [section]);

useEffect(() => {
  // Load participant count when component mounts
  loadAggregateData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleIdentification = (type) => {
    setResponses({ ...responses, [currentSong.id]: type });
    if (currentSongIndex < SONGS.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setQuizPhase('rate');
      setCurrentSongIndex(0);
    }
  };

  const handleRating = (dimension, value) => {
    const songRatings = ratings[currentSong.id] || {};
    setRatings({
      ...ratings,
      [currentSong.id]: { ...songRatings, [dimension]: value }
    });
  };

  const handleNextRating = () => {
    if (currentSongIndex < SONGS.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setQuizPhase('reveal');
      setCurrentSongIndex(0);
    }
  };

  const handleRevealRating = (dimension, value) => {
    const songRatings = revealedRatings[currentSong.id] || {};
    setRevealedRatings({
      ...revealedRatings,
      [currentSong.id]: { ...songRatings, [dimension]: value }
    });
  };

  const handleNextReveal = async () => {
  if (currentSongIndex < SONGS.length - 1) {
    setCurrentSongIndex(currentSongIndex + 1);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  } else {
    setQuizPhase('survey');  // Change to survey instead of results
    setCurrentSongIndex(0);
  }
};

const handleSurveySubmit = async () => {
  // Save to Firebase
  await saveResponseToFirebase();
  
  // Load aggregate data
  await loadAggregateData();
  
  setQuizPhase('complete');
  setSection('results');
};

  const calculateAccuracy = () => {
    let correct = 0;
    Object.entries(responses).forEach(([songId, response]) => {
      const song = SONGS.find(s => s.id === parseInt(songId));
      if (song && song.actualType === response) correct++;
    });
    return Math.round((correct / SONGS.length) * 100);
  };

const saveResponseToFirebase = async () => {
  try {
    await addDoc(collection(db, 'responses'), {
  identifications: responses,
  initialRatings: ratings,
  revealedRatings: revealedRatings,
  continueListening: continueListening,
  labelingSupport: labelingSupport,
  timestamp: new Date().toISOString()
});
    console.log("Saved!");
  } catch (error) {
    console.error("Error:", error);
  }
};

const loadAggregateData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'responses'));
    const allResponses = [];
    querySnapshot.forEach((doc) => allResponses.push(doc.data()));
    
    setParticipantCount(allResponses.length);
    
    if (allResponses.length === 0) {
      setAggregateData({
        accuracy: { overall: 0, byGenre: [] },
        preferenceShift: [],
        radarData: [],
        labelingSupport: []
      });
    } else {
      setAggregateData(calculateAggregateData(allResponses));
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const calculateAggregateData = (allResponses) => {
  let totalCorrect = 0, totalGuesses = 0;
  const genreStats = {};
  const preferenceData = { ai: { before: [], after: [] }, human: { before: [], after: [] }, hybrid: { before: [], after: [] } };

  allResponses.forEach(r => {
    Object.entries(r.identifications).forEach(([songId, guess]) => {
      const song = SONGS.find(s => s.id === parseInt(songId));
      if (song) {
        totalGuesses++;
        if (guess === song.actualType) totalCorrect++;
        if (!genreStats[song.genre]) genreStats[song.genre] = { correct: 0, total: 0, color: song.color };
        genreStats[song.genre].total++;
        if (guess === song.actualType) genreStats[song.genre].correct++;
      }
    });

    Object.entries(r.initialRatings).forEach(([songId, init]) => {
      const song = SONGS.find(s => s.id === parseInt(songId));
      const rev = r.revealedRatings[songId];
      if (song && init.enjoyment && rev?.enjoyment) {
        preferenceData[song.actualType].before.push((init.enjoyment + init.creativity) / 2);
        preferenceData[song.actualType].after.push((rev.enjoyment + rev.creativity) / 2);
      }
    });
  });

  const avg = (arr) => arr.length > 0 ? arr.reduce((a,b) => a+b, 0) / arr.length : 0;
  
  // Calculate labeling support percentages
const supportCounts = { ai_only: 0, ai_and_assisted: 0, neutral: 0, dont_support: 0 };
allResponses.forEach(r => {
  if (r.labelingSupport) supportCounts[r.labelingSupport]++;
});

const total = allResponses.length;
const labelingSupport = [
  { name: 'AI-Generated Only', value: total > 0 ? Math.round((supportCounts.ai_only / total) * 100) : 35, fill: '#FF6B9D' },
  { name: 'AI-Generated & Assisted', value: total > 0 ? Math.round((supportCounts.ai_and_assisted / total) * 100) : 56, fill: '#4ECDC4' },
  { name: 'Neutral', value: total > 0 ? Math.round((supportCounts.neutral / total) * 100) : 6, fill: '#95E1D3' },
  { name: "Don't Support", value: total > 0 ? Math.round((supportCounts.dont_support / total) * 100) : 3, fill: '#F38181' }
];
  // Calculate continue listening data
const continueListeningCounts = { unlikely: 0, neutral: 0, likely: 0 };
allResponses.forEach(r => {
  Object.entries(r.continueListening || {}).forEach(([songId, value]) => {
    if (value <= 2) continueListeningCounts.unlikely++;
    else if (value === 3) continueListeningCounts.neutral++;
    else continueListeningCounts.likely++;
  });
});

const totalCL = continueListeningCounts.unlikely + continueListeningCounts.neutral + continueListeningCounts.likely;
const continueListeningData = [
  { category: 'Unlikely', percentage: totalCL > 0 ? Math.round((continueListeningCounts.unlikely / totalCL) * 100) : 33 },
  { category: 'Neutral', percentage: totalCL > 0 ? Math.round((continueListeningCounts.neutral / totalCL) * 100) : 33 },
  { category: 'Likely', percentage: totalCL > 0 ? Math.round((continueListeningCounts.likely / totalCL) * 100) : 34 }
];
  return {
    accuracy: {
      overall: totalGuesses > 0 ? Math.round((totalCorrect / totalGuesses) * 100) : 0,
      byGenre: Object.entries(genreStats).map(([genre, stats]) => ({
        genre,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        fill: stats.color
      }))
    },
    preferenceShift: [
      { category: 'AI Music', before: parseFloat(avg(preferenceData.ai.before).toFixed(1)) || 0, after: parseFloat(avg(preferenceData.ai.after).toFixed(1)) || 0 },
      { category: 'Human Music', before: parseFloat(avg(preferenceData.human.before).toFixed(1)) || 0, after: parseFloat(avg(preferenceData.human.after).toFixed(1)) || 0 },
      { category: 'Hybrid', before: parseFloat(avg(preferenceData.hybrid.before).toFixed(1)) || 0, after: parseFloat(avg(preferenceData.hybrid.after).toFixed(1)) || 0 }
    ],
    radarData: AGGREGATE_DATA.radarData,
    labelingSupport: labelingSupport,
    continueListeningData: continueListeningData
  };
};

const displayData = aggregateData || AGGREGATE_DATA;;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden"
         style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      
      {/* Animated gradient background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
             style={{ animation: 'pulse 8s ease-in-out infinite' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
             style={{ animation: 'pulse 12s ease-in-out infinite' }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
             style={{ animation: 'pulse 10s ease-in-out infinite' }} />
      </div>

      {/* Cursor follower */}
      <div 
        className="fixed w-4 h-4 rounded-full bg-pink-500 pointer-events-none z-50 mix-blend-difference transition-transform"
        style={{ 
          left: mousePosition.x - 8, 
          top: mousePosition.y - 8,
          transform: isPlaying ? 'scale(2)' : 'scale(1)'
        }}
      />

      {/* Noise texture overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }} />

      {/* Header */}
      <header className="border-b-4 border-pink-500 bg-black/90 backdrop-blur-sm sticky top-0 z-40 relative">
  <div className="max-w-7xl mx-auto pl-4 pr-8 py-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* Logo - clickable to return home */}
        <button 
          onClick={() => setSection('intro')}
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <img 
            src="/logo.png" 
            alt="The Transparency Test Logo" 
            className="h-20 w-auto"
          />
        </button>
        
        {/* Title next to logo */}
        <div>
          <h1 className="text-4xl font-black tracking-tight" style={{ 
            background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: "'Space Grotesk', sans-serif"
          }}>
            AI Music Study
          </h1>
        </div>
      </div>
      
      <VinylRecord isPlaying={isPlaying} size="medium" />
    </div>
  </div>
</header>

{/* Navigation - Only show after test is complete */}
{(section === 'results' || section === 'overview' || section === 'recommendations' || section === 'citations') && (
  <NavigationBar currentSection={section} onNavigate={setSection} />
)}

      <main className="max-w-7xl mx-auto px-8 py-16 relative z-10">
        {section === 'intro' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block bg-pink-500/20 border-2 border-pink-500 px-4 py-2 rounded-full">
                  <span className="text-pink-400 font-bold text-sm uppercase tracking-wider">Interactive Experiment</span>
                </div>
                <h2 className="text-7xl font-black leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  AI vs.<br/>
                  <span style={{ 
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>HUMAN</span><br/>
                  MUSIC
                </h2>
              </div>

              <div className="space-y-4 text-lg text-gray-300 leading-relaxed">
                <p className="text-xl">
                  AI music tools like Suno and Udio can 
                  now generate high quality songs, complete with vocals, production, and instrumentals, in seconds. 
                  But can you tell the difference between music created by <span className="text-cyan-400 font-bold">AI</span> and music created by <span className="text-pink-400 font-bold">humans</span>?
                </p>
                <p>
                  This study explores whether listeners can distinguish AI-generated music from human creativity, 
                  and whether <span className="font-bold text-white">transparency changes listeners' perception and attitudes.</span>
                </p>
              </div>

              <div className="bg-gradient-to-r from-pink-500/10 to-cyan-500/10 border-l-4 border-pink-500 p-6 rounded-r-2xl">
                <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                  <Music2 className="text-pink-500" />
                  The Experiment
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Headphones className="text-cyan-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="font-bold text-white">Phase 1</div>
                      <div className="text-gray-400">Identify {SONGS.length} songs</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Eye className="text-pink-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="font-bold text-white">Phase 2</div>
                      <div className="text-gray-400">Rate blind</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-purple-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="font-bold text-white">Phase 3</div>
                      <div className="text-gray-400">Reveal and re-rate</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BrainCircuit className="text-yellow-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="font-bold text-white">Results</div>
                      <div className="text-gray-400">See the data</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={() => {
                    setSection('quiz');
                    setQuizPhase('identify');
                  }}
                  className="group relative bg-pink-500 hover:bg-pink-600 text-white font-black text-xl px-12 py-6 rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider"
                >
                  Start Test
                  <ChevronRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="text-sm text-gray-500">
                  <div className="font-mono">~8 minutes</div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {participantCount} participant{participantCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center gap-4">
  <VinylRecord isPlaying={true} color="#FF6B9D" size="large" />
  <div className="w-full flex justify-center">
    <Waveform isPlaying={true} color="#4ECDC4" />
  </div>
</div>
          </div>
        )}

        {section === 'quiz' && quizPhase === 'identify' && (
          <div className="max-w-4xl mx-auto">
            {/* Progress bar */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-3xl font-black uppercase tracking-tight">Phase 1: Identification</h3>
                <span className="text-pink-400 font-mono font-bold">
                  {currentSongIndex + 1}/{SONGS.length}
                </span>
              </div>
              <div className="h-3 bg-gray-900 border-2 border-gray-800 overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${((currentSongIndex + 1) / SONGS.length) * 100}%`,
                    background: `linear-gradient(90deg, #FF6B9D 0%, #4ECDC4 100%)`
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Vinyl player */}
              <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-gray-800 p-8 rounded-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col items-center">
                  <VinylRecord isPlaying={isPlaying} color={currentSong.color} size="large" />
                  
                  <div className="mt-8 text-center w-full">
                    <h4 className="text-3xl font-black mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {currentSong.title}
                    </h4>
                    
                    <Waveform isPlaying={isPlaying} color={currentSong.color} />
                    
                    <audio ref={audioRef} onEnded={() => setIsPlaying(false)}>
                      <source src={currentSong.audioUrl} type="audio/mpeg" />
                    </audio>

                    <button
                      onClick={handlePlayPause}
                      className="mt-6 w-full bg-white hover:bg-gray-200 text-black font-black py-4 px-6 rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider flex items-center justify-center gap-3"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Choices */}
              <div className="space-y-6">
                <div className="bg-pink-500/10 border-l-4 border-pink-500 p-6">
                  <p className="text-xl font-bold mb-2">Decide:</p>
                  <p className="text-gray-400">Is this AI-generated, human-made, or hybrid?</p>
                </div>

                <div className="space-y-4">
                  {[
                    { type: 'ai', label: 'AI-Generated', icon: BrainCircuit, color: '#FF6B9D', desc: 'Created by algorithm' },
                    { type: 'human', label: 'Human-Made', icon: Users, color: '#4ECDC4', desc: 'Human artist' },
                    { type: 'hybrid', label: 'Hybrid', icon: Sparkles, color: '#AA96DA', desc: 'AI-assisted' }
                  ].map(({ type, label, icon: Icon, color, desc }) => (
                    <button
                      key={type}
                      onClick={() => handleIdentification(type)}
                      className="group w-full bg-black hover:bg-gray-900 border-4 border-gray-800 hover:border-gray-600 p-6 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex items-center justify-center rounded-none border-2"
                             style={{ borderColor: color, backgroundColor: `${color}20` }}>
                          <Icon size={32} style={{ color }} />
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-2xl mb-1">{label}</div>
                          <div className="text-gray-500 text-sm font-mono">{desc}</div>
                        </div>
                        <ChevronRight className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" size={32} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {section === 'quiz' && quizPhase === 'rate' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-3xl font-black uppercase tracking-tight">Phase 2: Rate the Music</h3>
                <span className="text-cyan-400 font-mono font-bold">
                  {currentSongIndex + 1}/{SONGS.length}
                </span>
              </div>
              <div className="h-3 bg-gray-900 border-2 border-gray-800 overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${((currentSongIndex + 1) / SONGS.length) * 100}%`,
                    background: `linear-gradient(90deg, #4ECDC4 0%, #AA96DA 100%)`
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-gray-800 p-8 rounded-none sticky top-24">
                  <div className="flex flex-col items-center">
                    <VinylRecord isPlaying={isPlaying} color={currentSong.color} size="medium" />
                    
                    <div className="mt-6 text-center w-full">
                      <h4 className="text-2xl font-black mb-1">{currentSong.title}</h4>
                      
                      <audio ref={audioRef} onEnded={() => setIsPlaying(false)}>
                        <source src={currentSong.audioUrl} type="audio/mpeg" />
                      </audio>

                      <button
                        onClick={handlePlayPause}
                        className="w-full bg-white hover:bg-gray-200 text-black font-black py-3 px-4 rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        {isPlaying ? 'Pause' : 'Play'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-8">
                {[
                  { key: 'enjoyment', label: 'Enjoyment', question: 'How much did you enjoy this?', color: '#FF6B9D' },
                  { key: 'creativity', label: 'Creativity', question: 'How creative is this song?', color: '#4ECDC4' }
                ].map(({ key, label, question, color }) => (
                  <div key={key} className="bg-black border-4 border-gray-800 p-6 rounded-none">
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <h5 className="font-black text-xl uppercase tracking-tight">{label}</h5>
                      </div>
                      <p className="text-gray-400 text-sm">{question}</p>
                    </div>
                    
                    <div className="grid grid-cols-10 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleRating(key, value)}
                          className={`aspect-square flex items-center justify-center font-black text-lg border-3 rounded-none transition-all ${
                            ratings[currentSong.id]?.[key] === value
                              ? 'border-white scale-110 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]'
                              : 'border-gray-700 hover:border-gray-500'
                          }`}
                          style={{
                            backgroundColor: ratings[currentSong.id]?.[key] === value ? color : 'transparent',
                            color: ratings[currentSong.id]?.[key] === value ? '#000' : '#fff'
                          }}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-600 font-mono">
                      <span>LOW</span>
                      <span>HIGH</span>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleNextRating}
                  disabled={!ratings[currentSong.id] || Object.keys(ratings[currentSong.id]).length < 2}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-black disabled:text-gray-600 font-black text-xl py-6 px-8 rounded-none border-4 border-black disabled:border-gray-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {currentSongIndex < SONGS.length - 1 ? 'Next Song' : 'Continue'}
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>
        )}

        {section === 'quiz' && quizPhase === 'reveal' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-3xl font-black uppercase tracking-tight">Phase 3: The Truth</h3>
                <span className="text-yellow-400 font-mono font-bold">
                  {currentSongIndex + 1}/{SONGS.length}
                </span>
              </div>
              <div className="h-3 bg-gray-900 border-2 border-gray-800 overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${((currentSongIndex + 1) / SONGS.length) * 100}%`,
                    background: `linear-gradient(90deg, #FFD93D 0%, #FF6B9D 100%)`
                  }}
                />
              </div>
            </div>

            <div className="space-y-8">
              {/* Reveal card */}
              <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-yellow-500 p-8 rounded-none shadow-[12px_12px_0px_0px_rgba(255,217,61,0.3)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="flex flex-col items-center">
  {/* Album Cover */}
  <div className="relative w-64 h-64 mb-4">
    <img 
      src={currentSong.coverArt} 
      alt={`${currentSong.actualTitle} cover art`}
      className="w-full h-full object-cover rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]"
    />
    {/* Play button overlay */}
    <button
      onClick={handlePlayPause}
      className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/30 transition-all group"
    >
      {isPlaying ? (
        <Pause className="text-white group-hover:scale-110 transition-transform" size={64} />
      ) : (
        <Play className="text-white group-hover:scale-110 transition-transform" size={64} />
      )}
    </button>
  </div>
  
  {/* Song Info - Real Title & Artist */}
  <div className="text-center">
    <h4 className="text-2xl font-black mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {currentSong.actualTitle}
    </h4>
    <p className="text-gray-400 text-lg">{currentSong.artist}</p>
  </div>
  
  <audio ref={audioRef} onEnded={() => setIsPlaying(false)}>
    <source src={currentSong.audioUrl} type="audio/mpeg" />
  </audio>
</div>

                  <div className="space-y-4">
                    <div className={`border-4 p-6 rounded-none ${
                      responses[currentSong.id] === currentSong.actualType
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-red-500 bg-red-500/10'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        {responses[currentSong.id] === currentSong.actualType ? (
                          <CheckCircle2 className="text-green-500" size={32} />
                        ) : (
                          <XCircle className="text-red-500" size={32} />
                        )}
                        <div className="font-black text-2xl uppercase">
                          {responses[currentSong.id] === currentSong.actualType ? 'Correct!' : 'Incorrect'}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">You guessed:</span>
                          <span className="font-bold uppercase text-lg">
                            {responses[currentSong.id] === 'ai' ? '🤖 AI' : 
                             responses[currentSong.id] === 'human' ? '👤 Human' : '✨ Hybrid'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Actually:</span>
                          <span className="font-bold uppercase text-lg">
                            {currentSong.actualType === 'ai' ? '🤖 AI-Generated' : 
                             currentSong.actualType === 'human' ? '👤 Human-Made' : '✨ Hybrid'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4">
                      <p className="text-yellow-200 text-sm font-bold">
                        💡 Now that you know, does your perception change? Rate it again below.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Re-rating */}
              <div className="space-y-6">
                {[
                  { key: 'enjoyment', label: 'Enjoyment', color: '#FF6B9D' },
                  { key: 'creativity', label: 'Creativity', color: '#4ECDC4' }
                ].map(({ key, label, color }) => (
                  <div key={key} className="bg-black border-4 border-gray-800 p-6 rounded-none">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <h5 className="font-black text-lg uppercase">{label}</h5>
                      </div>
                      <div className="text-sm text-gray-500 font-mono">
                        Before: <span className="text-white font-bold">{ratings[currentSong.id]?.[key] || '-'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-10 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleRevealRating(key, value)}
                          className={`aspect-square flex items-center justify-center font-black text-base border-3 rounded-none transition-all ${
                            revealedRatings[currentSong.id]?.[key] === value
                              ? 'border-white scale-110'
                              : 'border-gray-700 hover:border-gray-500'
                          }`}
                          style={{
                            backgroundColor: revealedRatings[currentSong.id]?.[key] === value ? color : 'transparent',
                            color: revealedRatings[currentSong.id]?.[key] === value ? '#000' : '#fff'
                          }}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Continue listening question - only for AI/Hybrid */}
{(currentSong.actualType === 'ai' || currentSong.actualType === 'hybrid') && (
  <div className="bg-black border-4 border-yellow-500 p-6 rounded-none">
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-2">
        <AlertCircle className="text-yellow-500" size={24} />
        <h5 className="font-black text-xl uppercase tracking-tight">Continue Listening?</h5>
      </div>
      <p className="text-gray-400 text-sm">Now that you know the origins of this song, how likely are you to continue listening to it?</p>
    </div>
    
    <div className="grid grid-cols-5 gap-2">
      {[
        { value: 1, label: 'Very Unlikely' },
        { value: 2, label: 'Unlikely' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Likely' },
        { value: 5, label: 'Very Likely' }
      ].map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setContinueListening({ ...continueListening, [currentSong.id]: value })}
          className={`p-4 border-3 rounded-none transition-all ${
            continueListening[currentSong.id] === value
              ? 'border-yellow-500 bg-yellow-500/20 scale-105'
              : 'border-gray-700 hover:border-gray-500'
          }`}
        >
          <div className="font-black text-lg mb-1">{value}</div>
          <div className="text-xs text-gray-400">{label}</div>
        </button>
      ))}
    </div>
  </div>
)}

                <button
                  onClick={handleNextReveal}
                  disabled={!revealedRatings[currentSong.id] || Object.keys(revealedRatings[currentSong.id]).length < 2 || ((currentSong.actualType === 'ai' || currentSong.actualType === 'hybrid') && !continueListening[currentSong.id])}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-800 text-black disabled:text-gray-600 font-black text-xl py-6 rounded-none border-4 border-black disabled:border-gray-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all uppercase flex items-center justify-center gap-2"
                >
                  {currentSongIndex < SONGS.length - 1 ? 'Next Song' : 'Next'}
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>
        )}

        {section === 'quiz' && quizPhase === 'survey' && (
  <div className="max-w-3xl mx-auto">
    <div className="text-center mb-12">
      <div className="inline-block bg-purple-500/20 border-2 border-purple-500 px-6 py-3 rounded-full mb-6">
        <span className="text-purple-400 font-bold uppercase tracking-wider">Survey</span>
      </div>
      <h2 className="text-5xl font-black mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Should AI Music<br/>Be <span style={{ 
          background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>Labeled?</span>
      </h2>
      <p className="text-xl text-gray-400">
        Now that you've experienced how difficult it can be to identify AI music,<br/>
        do you support mandatory labeling of AI music on streaming platforms?
      </p>
    </div>

    <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-purple-500 p-10 rounded-none shadow-[16px_16px_0px_0px_rgba(170,150,218,0.3)]">
      <div className="space-y-4">
        {[
  { value: 'ai_only', label: 'AI-Generated Only', emoji: '🤖', color: '#FF6B9D', desc: 'Label only fully AI-generated tracks' },
  { value: 'ai_and_assisted', label: 'AI-Generated & Assisted', emoji: '⚙️', color: '#4ECDC4', desc: 'Label AI-generated and AI-assisted tracks' },
  { value: 'neutral', label: 'Neutral', emoji: '🤷', color: '#95E1D3', desc: "I don't have a strong opinion" },
  { value: 'dont_support', label: "Don't Support", emoji: '❌', color: '#F38181', desc: 'Labeling is unnecessary' }
].map(({ value, label, emoji, color, desc }) => (
          <button
            key={value}
            onClick={() => setLabelingSupport(value)}
            className={`group w-full bg-black border-4 p-6 rounded-none transition-all text-left ${
              labelingSupport === value 
                ? 'border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] scale-[1.02]' 
                : 'border-gray-700 hover:border-gray-500'
            }`}
            style={{
              backgroundColor: labelingSupport === value ? `${color}20` : 'black'
            }}
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl">{emoji}</div>
              <div className="flex-1">
                <div className="font-black text-2xl mb-1" style={{ color: labelingSupport === value ? color : 'white' }}>
                  {label}
                </div>
                <div className="text-gray-400 text-sm">{desc}</div>
              </div>
              {labelingSupport === value && (
                <CheckCircle2 className="text-white flex-shrink-0" size={32} />
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleSurveySubmit}
        disabled={!labelingSupport}
        className="mt-8 w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white disabled:text-gray-600 font-black text-xl py-6 rounded-none border-4 border-black disabled:border-gray-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider"
      >
        See Results →
      </button>
    </div>
  </div>
)}

        {section === 'results' && (
          <div className="space-y-16">
            {/* Hero stats */}
            <div className="text-center">
              <div className="inline-block bg-pink-500/20 border-2 border-pink-500 px-6 py-3 rounded-full mb-6">
                <span className="text-pink-400 font-bold uppercase tracking-wider">Your Results</span>
              </div>
              <div className="text-9xl font-black mb-4" style={{
                background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Space Grotesk', sans-serif"
              }}>
                {calculateAccuracy()}%
              </div>
              <p className="text-2xl text-gray-400">
  Identification Accuracy {participantCount > 0 && (
    <span className="text-gray-600 font-mono text-lg">
      (avg: {displayData.accuracy.overall}%)
    </span>
  )}
</p>
            </div>

            {/* Song breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SONGS.map((song) => {
                const isCorrect = responses[song.id] === song.actualType;
                return (
                  <div 
                    key={song.id}
                    className={`border-4 p-4 rounded-none ${
                      isCorrect 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-red-500 bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: song.color }} />
                      {isCorrect ? (
                        <CheckCircle2 className="text-green-500" size={20} />
                      ) : (
                        <XCircle className="text-red-500" size={20} />
                      )}
                    </div>
                    <div className="font-bold text-sm mb-1">{song.title}</div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>You: <span className="text-white uppercase text-[10px] font-mono">{responses[song.id]}</span></div>
                      <div>Was: <span className="text-white uppercase text-[10px] font-mono">{song.actualType}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Data visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Continue Listening */}
<div className="bg-gradient-to-br from-gray-900 to-black border-4 border-yellow-500 p-8 rounded-none shadow-[12px_12px_0px_0px_rgba(255,217,61,0.2)]">
  <h3 className="text-2xl font-black mb-6 uppercase">Willingness to Continue Listening</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={displayData.continueListeningData || []}>
      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
      <XAxis dataKey="category" stroke="#888" style={{ fontSize: '12px', fontWeight: 'bold' }} />
      <YAxis stroke="#888" style={{ fontSize: '12px' }} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#000', 
          border: '2px solid #FFD93D',
          borderRadius: 0,
          fontWeight: 'bold'
        }}
      />
      <Bar dataKey="percentage" fill="#FFD93D" />
    </BarChart>
  </ResponsiveContainer>
  <p className="text-sm text-gray-500 mt-4 font-mono">
  💡 After learning the truth, {displayData.continueListeningData?.[0]?.percentage || 0}% are unlikely to continue listening to AI music
</p>
</div>

              {/* AI vs Human Ratings */}
<div className="bg-gradient-to-br from-gray-900 to-black border-4 border-cyan-500 p-8 rounded-none shadow-[12px_12px_0px_0px_rgba(78,205,196,0.2)]">
  <h3 className="text-2xl font-black mb-6 uppercase">AI vs Human Ratings</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart 
      data={[
        { 
          dimension: 'Enjoyment', 
          'AI Music': displayData.radarData?.[0]?.ai || 0, 
          'Human Music': displayData.radarData?.[0]?.human || 0 
        },
        { 
          dimension: 'Creativity', 
          'AI Music': displayData.radarData?.[1]?.ai || 0, 
          'Human Music': displayData.radarData?.[1]?.human || 0 
        }
      ]}
      layout="vertical"
      margin={{ left: 20 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
      <XAxis type="number" domain={[0, 10]} stroke="#888" style={{ fontSize: '12px' }} />
      <YAxis dataKey="dimension" type="category" stroke="#888" style={{ fontSize: '12px', fontWeight: 'bold' }} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#000', 
          border: '2px solid #4ECDC4',
          borderRadius: 0,
          fontWeight: 'bold'
        }}
      />
      <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
      <Bar dataKey="AI Music" fill="#FF6B9D" />
      <Bar dataKey="Human Music" fill="#4ECDC4" />
    </BarChart>
  </ResponsiveContainer>
  <p className="text-sm text-gray-500 mt-4 font-mono">
    💡 {(() => {
      const enjoymentDiff = (displayData.radarData?.[0]?.human || 0) - (displayData.radarData?.[0]?.ai || 0);
      const creativityDiff = (displayData.radarData?.[1]?.human || 0) - (displayData.radarData?.[1]?.ai || 0);
      const avgDiff = (enjoymentDiff + creativityDiff) / 2;
      
      return avgDiff > 0 
        ? 'Human music rated higher on enjoyment and creativity'
        : avgDiff < 0
        ? 'AI music rated higher on enjoyment and creativity'
        : 'Human and AI music rated equally on enjoyment and creativity';
    })()}
  </p>
</div>

              {/* Preference shift */}
              <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-purple-500 p-8 rounded-none shadow-[12px_12px_0px_0px_rgba(170,150,218,0.2)]">
                <h3 className="text-2xl font-black mb-6 uppercase">Preference Shift</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={displayData.preferenceShift}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="category" stroke="#888" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <YAxis domain={[0, 10]} stroke="#888" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        border: '2px solid #AA96DA',
                        borderRadius: 0
                      }}
                    />
                    <Legend />
                    <Bar dataKey="before" fill="#AA96DA" name="Before Reveal" />
                    <Bar dataKey="after" fill="#FF6B9D" name="After Reveal" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-500 mt-4 font-mono">
  💡 AI music ratings {
    (() => {
      const aiMusic = displayData.preferenceShift?.find(d => d.category === 'AI Music');
      if (!aiMusic) return 'data pending';
      const change = aiMusic.before - aiMusic.after;
      const percent = aiMusic.before > 0 ? Math.round((change / aiMusic.before) * 100) : 0;
      return change > 0 
        ? `dropped ${percent}% after truth revealed`
        : change < 0
        ? `increased ${Math.abs(percent)}% after truth revealed`
        : 'stayed the same after truth revealed';
    })()
  }
</p>
              </div>

              {/* Labeling support */}
              <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-yellow-500 p-8 rounded-none shadow-[12px_12px_0px_0px_rgba(255,217,61,0.2)]">
                <h3 className="text-2xl font-black mb-6 uppercase">Labeling Support</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={displayData.labelingSupport}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                      labelStyle={{ fontSize: '14px', fontWeight: 'bold', fill: '#fff' }}
                    >
                      {(displayData?.labelingSupport || []).map((entry, index) => (
  <Cell key={`cell-${index}`} fill={entry.fill} />
))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        border: '2px solid #FFD93D',
                        borderRadius: 0
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-500 mt-4 font-mono">
  💡 {(() => {
    const support = displayData.labelingSupport || [];
    const aiOnly = support.find(s => s.name === 'AI-Generated Only')?.value || 0;
    const aiAndAssisted = support.find(s => s.name === 'AI-Generated & Assisted')?.value || 0;
    const total = aiOnly + aiAndAssisted;
    return `${total}% support some level of mandatory AI music labeling`;
  })()}
</p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
  onClick={() => setSection('overview')}
  className="bg-pink-500 hover:bg-pink-600 text-white font-black text-xl py-8 rounded-none border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider"
>
  Learn More & Take Action →
</button>
              <button
                onClick={() => {
                  setSection('intro');
                  setCurrentSongIndex(0);
                  setResponses({});
                  setRatings({});
                  setRevealedRatings({});
                  setLabelingSupport(null);
                  setQuizPhase('identify');
                  setContinueListening({});
                }}
                className="bg-black hover:bg-gray-900 text-white font-black text-xl py-8 rounded-none border-4 border-gray-700 hover:border-gray-500 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] transition-all uppercase tracking-wider flex items-center justify-center gap-3"
              >
                <RotateCcw size={24} />
                Restart Test
              </button>
            </div>
          </div>
        )}

        {section === 'overview' && (
  <div className="space-y-16">
    {/* Hero */}
    <div className="text-center">
      <div className="text-7xl font-black mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        THE
        <br />
        <span style={{
          background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          PROBLEM
        </span>
      </div>
    </div>

    {/* Background Context */}
    <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-pink-500 p-10 rounded-none shadow-[16px_16px_0px_0px_rgba(255,107,157,0.2)]">
      <h3 className="text-3xl font-black mb-6 uppercase flex items-center gap-3">
        <AlertCircle className="text-pink-500" size={36} />
        The Current AI Music Landscape
      </h3>
      <div className="space-y-6 text-lg text-gray-300">
        <p>
          AI tools like <span className="font-bold text-white">Suno</span> and <span className="font-bold text-white">Udio</span> can now generate high quality music in seconds. 
          While this technology offers exciting possibilities for the creative industry, it also introduces some serious risks to both artists and listeners.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/50 border-l-4 border-pink-500 p-6">
            <div className="text-5xl font-black text-pink-500 mb-2">50K+</div>
            <p className="text-gray-400 text-base">AI-generated songs uploaded to streaming platforms <span className="font-bold text-white">daily</span></p>
          </div>
          <div className="bg-black/50 border-l-4 border-cyan-500 p-6">
            <div className="text-5xl font-black text-cyan-500 mb-2">34%</div>
            <p className="text-gray-400 text-base">Of all new daily uploads are <span className="font-bold text-white">fully AI-generated</span></p>
          </div>
          <div className="bg-black/50 border-l-4 border-purple-500 p-6">
            <div className="text-5xl font-black text-purple-500 mb-2">0</div>
            <p className="text-gray-400 text-base">Major streaming platforms require and enforce <span className="font-bold text-white">consistent AI labeling</span></p>
          </div>
        </div>

        <p className="text-base text-gray-400 italic border-l-4 border-yellow-500 pl-4 py-2">
          When consumers stream music on major platforms like Spotify and Apple Music, they receive no information about whether tracks were created by human musicians or AI systems.
        </p>
      </div>
    </div>

    {/* AI Music Tiers */}
    <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-cyan-500 p-10 rounded-none shadow-[16px_16px_0px_0px_rgba(78,205,196,0.2)]">
      <h3 className="text-3xl font-black mb-6 uppercase flex items-center gap-3">
        <BrainCircuit className="text-cyan-500" size={36} />
        Tiers of AI Usage in Music Generation
      </h3>
      <p className="text-gray-400 mb-8 text-lg">
        Not all AI involvement in music is the same. A big policy question is if we should treat fully AI-generated songs the same as songs that only use AI for production. There's a spectrum of human-to-AI contribution:
      </p>

      <div className="space-y-6">
        {[
          {
            tier: "Fully AI-Generated",
            icon: "🤖",
            color: "#FF6B9D",
            description: "Songs created entirely by AI systems with no human musical input",
            examples: "Generated completely by text prompts on Suno or Udio",
            concern: "Directly displaces and takes advantage of human artists and floods platforms with zero-cost content"
          },
          {
            tier: "Hybrid Creation",
            icon: "✨",
            color: "#AA96DA",
            description: "Music where both AI and humans contribute meaningfully to the creative process",
            examples: "AI generates melody, human adds lyrics and arrangement, or AI creates backing tracks for human vocals",
            concern: "Depends case-by-case on how much AI contributed to the song, hard to regulate"
          },
          {
            tier: "AI-Assisted Production",
            icon: "⚙️",
            color: "#4ECDC4",
            description: "Music primarily created by humans, with AI used as a supporting tool in the production process",
            examples: "AI-assisted mixing, sound enhancement, or vocal tuning",
            concern: "Can be difficult to define where tool assistance ends and actual contribution begins"
          },
          {
            tier: "Human-Created",
            icon: "👤",
            color: "#FFD93D",
            description: "Music composed and produced by humans without any use of AI",
            examples: "Traditional songwriting, studio recording, and instrumentals",
            concern: "Used to train AI systems without artist consent"
          }
        ].map((tier, index) => (
          <div key={index} className="bg-black/50 border-4 p-6 rounded-none"
               style={{ borderColor: tier.color, boxShadow: `6px 6px 0px 0px ${tier.color}40` }}>
            <div className="flex items-start gap-4">
              <div className="text-5xl flex-shrink-0">{tier.icon}</div>
              <div className="flex-1">
                <h4 className="text-2xl font-black mb-2" style={{ color: tier.color }}>
                  {tier.tier}
                </h4>
                <p className="text-white font-bold mb-3">{tier.description}</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 font-mono">Examples:</span>
                    <p className="text-gray-400">{tier.examples}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-mono">Policy Concern:</span>
                    <p className="text-gray-400">{tier.concern}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-yellow-500/10 border-l-4 border-yellow-500 p-6">
        <p className="text-yellow-200 font-bold">
          In discussions of AI music labeling, many platforms currently treat all these tiers the same. 
          As we move toward labeling AI songs on streaming platforms, we need to think about how the level of AI usage in the song needs to be disclosed as well.
          However, it will be difficult to draw the lines between these many tiers.
        </p>
      </div>
    </div>

    {/* The Stakes */}
    <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-4 border-pink-500 p-10 rounded-none shadow-[16px_16px_0px_0px_rgba(255,107,157,0.2)]">
      <h3 className="text-3xl font-black mb-6 uppercase flex items-center gap-3">
        <Sparkles className="text-pink-500" size={36} />
        How Does This Affect Musicians & Listeners
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
        <div className="bg-black/50 border-l-4 border-pink-500 p-6">
          <div className="font-black text-white mb-2 text-xl">🎵 Artist Displacement</div>
          <p className="text-gray-400 text-base">
            AI music floods streaming platforms at near-zero cost. Once AI models are trained, they can produce unlimited songs with no marginal cost. 
            Human artists who invest in training, studio time, and living expenses cannot fairly compete with AI systems.
          </p>
        </div>
        <div className="bg-black/50 border-l-4 border-cyan-500 p-6">
          <div className="font-black text-white mb-2 text-xl">🎭 Voice & Style Theft</div>
          <p className="text-gray-400 text-base">
            AI systems train on copyrighted music without artist consent or compensation. Artists' unique voices and styles can be replicated, 
            undermining the value of their creative work. Furthermore, they are not compensated, recognized, or credited for AI-generated songs based on their work.
          </p>
        </div>
        <div className="bg-black/50 border-l-4 border-purple-500 p-6">
          <div className="font-black text-white mb-2 text-xl">👥 Consumer Deception</div>
          <p className="text-gray-400 text-base">
            Listeners cannot tell what music is AI-generated, preventing informed choice about which artists they want to support. 
            When consumers stream music, they typically assume they are supporting human artists and engaging with authentic creative expression.
          </p>
        </div>
        <div className="bg-black/50 border-l-4 border-yellow-500 p-6">
          <div className="font-black text-white mb-2 text-xl">💰 Economic Pressure</div>
          <p className="text-gray-400 text-base">
            Algorithmic recommendations and playlist placements determine which music generates streams and revenue. 
            AI-generated content unfairly competes with human artists for algorithmic attention on streaming platforms because AI systems are able to produce such a large quantity of music.
          </p>
        </div>
      </div>
    </div>

    {/* This Study */}
    <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-purple-500 p-10 rounded-none shadow-[16px_16px_0px_0px_rgba(170,150,218,0.2)]">
      <h3 className="text-3xl font-black mb-6 uppercase flex items-center gap-3">
        <Eye className="text-purple-500" size={36} />
        This Experiment
      </h3>
      <div className="space-y-6 text-lg text-gray-300">
        <div>
          <div className="font-black text-white mb-3">Research Question</div>
          <p className="text-gray-400">
            Can listeners distinguish AI-generated music and hybrid AI-assisted music from human-created music, and does transparency about a song's origins 
            affect their perception and attitudes toward the song?
          </p>
        </div>
        
        <div>
          <div className="font-black text-white mb-3">Methodology</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/50 border-2 border-purple-500 p-5">
              <div className="font-black text-purple-400 mb-2">Phase 1: Blind Identification</div>
              <p className="text-gray-400 text-sm">
                Participants listen to {SONGS.length} songs and identify each as AI-generated, human-made, or hybrid.
              </p>
            </div>
            <div className="bg-black/50 border-2 border-purple-500 p-5">
              <div className="font-black text-purple-400 mb-2">Phase 2: Blind Rating</div>
              <p className="text-gray-400 text-sm">
                Participants rate each song on enjoyment and creativity without knowing its origin.
              </p>
            </div>
            <div className="bg-black/50 border-2 border-purple-500 p-5">
              <div className="font-black text-purple-400 mb-2">Phase 3: Revealed Re-Rating</div>
              <p className="text-gray-400 text-sm">
                After finding out whether or not the song used AI, participants re-rate to 
                measure how transparency changes their perception.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Key Findings Preview */}
    <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-yellow-500 p-10 rounded-none shadow-[16px_16px_0px_0px_rgba(255,217,61,0.2)]">
      <h3 className="text-3xl font-black mb-6 uppercase flex items-center gap-3">
        <CheckCircle2 className="text-yellow-500" size={36} />
        What The Results Show
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-pink-500 mt-3 flex-shrink-0" />
          <p className="text-gray-300">
            <span className="font-black text-white">Detection is difficult for many listeners:</span> Average accuracy was {displayData.accuracy.overall}%,
             showing that most people can't tell the difference between AI-generated and human-made music.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-500 mt-3 flex-shrink-0" />
          <p className="text-gray-300">
            <span className="font-black text-white">Transparency is an important factor:</span> Once the songs' origins were disclosed, the ratings for AI-generated music {
              (() => {
                const aiMusic = displayData.preferenceShift?.find(d => d.category === 'AI Music');
                if (!aiMusic || aiMusic.before === 0) return 'changed significantly';
                const change = aiMusic.before - aiMusic.after;
                const percent = Math.round((change / aiMusic.before) * 100);
                return change > 0 ? `dropped ${percent}%.` : `increased ${Math.abs(percent)}%.`;
              })()
            }
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-500 mt-3 flex-shrink-0" />
          <p className="text-gray-300">
            <span className="font-black text-white">Strong support for labeling and disclosure:</span> {
              (() => {
                const support = displayData.labelingSupport || [];
                const aiOnly = support.find(s => s.name === 'AI-Generated Only')?.value || 0;
                const aiAndAssisted = support.find(s => s.name === 'AI-Generated & Assisted')?.value || 0;
                return aiOnly + aiAndAssisted;
              })()
            }% support some form of mandatory AI music labeling.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-yellow-500 mt-3 flex-shrink-0" />
          <p className="text-gray-300">
            <span className="font-black text-white">Sentiment towards AI music is generally negative:</span> {displayData.continueListeningData?.[0]?.percentage || 0}% 
            unlikely to continue listening to the song after learning that it's AI-generated.
          </p>
        </div>
      </div>
    </div>

    {/* Call to Action */}
    <div className="text-center">
      <div className="bg-gradient-to-r from-pink-500 to-cyan-500 p-1 rounded-none inline-block">
        <div className="bg-black px-8 py-4">
          <p className="text-xl text-white font-bold">
            Listeners are bad at detecting AI-generated music, and they want clear labels on streaming platforms.
          </p>
        </div>
      </div>
      <div className="mt-8">
        <button
          onClick={() => setSection('recommendations')}
          className="bg-pink-500 hover:bg-pink-600 text-white font-black text-2xl px-16 py-8 rounded-none border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider"
        >
          What Can We Do? →
        </button>
      </div>
    </div>
  </div>
)}

        {section === 'recommendations' && (
  <div className="space-y-16">
    {/* Hero */}
    <div className="text-center">
      <div className="text-7xl font-black mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        TAKE
        <br />
        <span style={{
          background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ACTION
        </span>
      </div>
    </div>

    {/* Two Column Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      
      {/* LEFT COLUMN: Policy Recommendations */}
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-4 border-pink-500 p-8 rounded-none shadow-[12px_12px_0px_0px_rgba(255,107,157,0.2)]">
          <h3 className="text-3xl font-black mb-4 uppercase flex items-center gap-3">
            <AlertCircle className="text-pink-500" size={32} />
            Policy Recommendations
          </h3>
        </div>

        {/* Policy Cards - ALL PINK */}
        {/* Card 1: Congressional Pressure on FTC */}
        <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-pink-500 p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(255,107,157,0.3)]">
          <h4 className="text-xl font-black uppercase mb-1 text-pink-400">
            Congressional Pressure on the FTC
          </h4>
          
          <p className="text-gray-300 mb-4">
            There should be an investigation into whether or not streaming platforms' failure to disclose AI-generated music is a deceptive trade practice under 
            <span className="font-bold text-pink-400"> Section 5 
            of the FTC Act.</span> When consumers stream music, they reasonably assume tracks are human-created, unless told otherwise. Listeners expect authentic human creativity and expression from the music they listen to, and they deserve to have the knowledge needed in order to make an informed consumer choice.
          </p>

          <div className="bg-black/50 border-l-4 border-pink-500 p-4 mb-4">
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-bold text-white">Build Congressional Coalition:</span>
                <p className="text-gray-400 mt-1">
                  Members of the House Energy & Commerce Committee should draft a joint letter to the Chair of the FTC, requesting formal investigation into whether platforms' 
                  non-disclosure constitutes deceptive practices.
                </p>
              </div>
              <div>
                <span className="font-bold text-white">FTC Investigation:</span>
                <p className="text-gray-400 mt-1">
                  FTC opens consumer protection investigation into major streaming platforms such as Spotify, Apple Music, and Amazon Music.
                </p>
              </div>
              <div>
                <span className="font-bold text-white">Ideal Outcome:</span>
                <p className="text-gray-400 mt-1">
                  Platforms agree to labeling requirements to avoid litigation. Non-compliance triggers penalties for companies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Coalition Building */}
        <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-pink-500 p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(255,107,157,0.3)]">
          <h4 className="text-xl font-black uppercase mb-1 text-pink-400">
            Multi-Stakeholder Coalition
          </h4>
          
          <p className="text-gray-300 mb-4">
            We need to build consensus across multiple diverse stakeholders in order to develop policy proposals based on consensus.
          </p>

          <div className="bg-black/50 border-l-4 border-pink-500 p-4 mb-4">
            <div className="font-black text-pink-400 mb-2 text-sm">Who Needs to Align:</div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-bold text-white">Music Industry Groups:</span>
                <p className="text-gray-400 mt-1">
                  EX: Recording Industry Association of America (RIAA), American Federation of Musicians (AFM), 
                  Artists Rights Alliance, Future of Music Coalition (to represent artists' economic interests)
                </p>
              </div>
              <div>
                <span className="font-bold text-white">Consumer Advocacy Organizations:</span>
                <p className="text-gray-400 mt-1">
                  EX: Consumer Reports, Consumer Federation of America, National Association of Consumer Advocates (to represent listeners'/consumers' rights to informed choice)
                </p>
              </div>
              <div>
                <span className="font-bold text-white">Tech Policy Experts:</span>
                <p className="text-gray-400 mt-1">
                  EX: Center for Democracy & Technology, Technology Policy Institute (to provide implementation and policy guidance)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/50 border-l-4 border-pink-500 p-4">
            <div className="font-black text-pink-400 mb-2 text-sm">They should work on:</div>
            <ul className="space-y-1 text-gray-400 text-sm ml-4">
              <li>• Creating joint policy principles on AI music transparency</li>
              <li>• Discussing what a tiered AI music labeling system might look like, and how it could be implemented</li>
              <li>• Technical standards for label implementation (where labels will be visible, how to enforce labels with artists)</li>
              <li>• Unified testimony for congressional hearings</li>
            </ul>
          </div>
        </div>

        {/* Card 3: Public Pressure Campaign */}
        <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-pink-500 p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(255,107,157,0.3)]">
          <h4 className="text-xl font-black uppercase mb-1 text-pink-400">
            Public Awareness Campaign
          </h4>
          
          <p className="text-gray-300 mb-4">
            Most people don't know AI music exists at scale on streaming platforms. Public awareness creates more pressure 
            on both platforms and legislators to take action.
          </p>

          <div className="bg-black/50 border-l-4 border-pink-500 p-4 mb-4">
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-bold text-white">Artist Testimonials:</span>
                <p className="text-gray-400 mt-1">
                  Working musicians can share their stories of frustration with AI music gaining more traction, algorithmic displacement of their music, and AI voice cloning without consent. More artists are starting to speak up about this topic and also call for labels on streaming platforms. 
                  Some want this specifically to resolve rumors that their own songs are AI-generated.
                </p>
              </div>
              <div>
                <span className="font-bold text-white">User Testimonials:</span>
                <p className="text-gray-400 mt-1">
                  Many listeners on social media describe feeling deceived and confused after unknowingly streaming AI content. More testimonials and experiences from listeners should be included in news campaigns about this topic to highlight that consumers actually care to know whether the songs they are listening to are made by AI.
                </p>
              </div>
              <div>
                <span className="font-bold text-white">Media Coverage:</span>
                <p className="text-gray-400 mt-1">
                  Major news outlets should conduct investigative journalism on the scale of AI music, how platforms might disproportionately profit from undisclosed AI content, and
                  the economic impact on musicians.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Individual Actions */}
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-cyan-500/10 to-yellow-500/10 border-4 border-cyan-500 p-8 rounded-none shadow-[12px_12px_0px_0px_rgba(78,205,196,0.2)]">
          <h3 className="text-3xl font-black mb-4 uppercase flex items-center gap-3">
            <Users className="text-cyan-500" size={32} />
            What You Can Do
          </h3>
        </div>

        {/* Action Cards - ALL CYAN */}
        {/* Action 1: Sign Petition */}
        <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-cyan-500 p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(78,205,196,0.3)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-cyan-500/20 border-2 border-cyan-500 rounded-none flex-shrink-0">
              <AlertCircle className="text-cyan-500" size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-black uppercase mb-1 text-cyan-400">
                Sign the Petition
              </h4>
             
              <p className="text-gray-300 mb-4 text-sm">
                The <span className="font-bold text-white">Protect Working Musicians Act</span> allows independent musicians to collectively negotiate fair compensation and terms with dominant streaming and distribution platforms. Add your name to show Congress there's public support.
              </p>

              {/* SPACE FOR PETITION IMAGE - ADD YOUR IMAGE HERE */}
              <div className="bg-black/50 border-2 border-cyan-500 p-4 mb-4 text-center">
                <p className="text-gray-500 text-sm italic"><img src="https://static.openpetition.de/images/petition/support-the-protect-working-musicians-act_1771362375_desktop.jpg?1771362375" alt="Protect Working Musicians Act Petition" className="w-full rounded-none" /></p>
                {/* When you're ready, replace the above with:
                <img src="https://static.openpetition.de/images/petition/support-the-protect-working-musicians-act_1771362375_desktop.jpg?1771362375" alt="Protect Working Musicians Act Petition" className="w-full rounded-none" />
                */}
              </div>

              <a 
                href="https://www.openpetition.org/us/petition/argumente/support-the-protect-working-musicians-act" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full bg-cyan-500 hover:bg-cyan-600 text-black font-black px-8 py-4 rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all uppercase text-sm text-center"
              >
                Sign the Petition →
              </a>

            </div>
          </div>
        </div>

        {/* Action 2: Support Deezer */}
        <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-cyan-500 p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(78,205,196,0.3)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-cyan-500/20 border-2 border-cyan-500 rounded-none flex-shrink-0">
              <Music2 className="text-cyan-500" size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-black uppercase mb-1 text-cyan-400">
                Support the right platforms
              </h4>
              
              <p className="text-gray-300 mb-4 text-sm">
                <span className="font-bold text-white">Deezer</span> became the first streaming platform to implement an 
                AI tagging system, clearly labeling AI-generated tracks. While the implementation is not yet perfect, they've shown that transparency in the age of AI music is technically 
                feasible, if streaming platforms choose to take action.
              </p>

              <div className="bg-black/50 border-l-4 border-cyan-500 p-4 mb-4">
                <div className="font-black text-cyan-400 mb-2 text-sm">What You Can Do:</div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Publicly praise Deezer's transparency on social media and raise awareness about steps that are being taken</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Tag @Spotify @AppleMusic asking why they haven't implemented similar systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>If you're willing to switch, try out Deezer to test their AI labeling system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Share Deezer's approach with friends who care about supporting human artists</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action 3: Spread Awareness */}
        <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-cyan-500 p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(78,205,196,0.3)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-cyan-500/20 border-2 border-cyan-500 rounded-none flex-shrink-0">
              <Headphones className="text-cyan-500" size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-black uppercase mb-1 text-cyan-400">
                Spread Awareness
              </h4>
              
              <p className="text-gray-300 mb-4 text-sm">
                Most people have no idea that tens of thousands of AI-generated songs are uploaded to streaming platforms everyday. 
                In order to have positive change in this AI music space, the general public needs to be aware of what is going on and how this is affecting them.
              </p>

              <div className="bg-black/50 border-l-4 border-cyan-500 p-4 mb-4">
                <div className="font-black text-cyan-400 mb-2 text-sm">Share This Study:</div>
                <p className="text-gray-300 text-sm mb-3">
                  Send this website to independent musicians, music fans, tech policy followers, etc., so we can continue collecting data about consumers' attitudes towards AI music!
                </p>
              </div>

              <div className="bg-black/50 border-l-4 border-cyan-500 p-4 mb-4">
                <div className="font-black text-cyan-400 mb-2 text-sm">Listen Critically:</div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    <span>When you listen to a new artist, check their profile. Do they have social media, past posts, pictures that look AI-generated?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    <span>Question artists with vast discographies (hundreds of tracks uploaded in weeks or months)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    <span>Start listening for common AI music tells (generic lyrics, slightly robotic/not-smooth voice, unnatural phrasing)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-black/50 border-l-4 border-cyan-500 p-4">
                <div className="font-black text-cyan-400 mb-2 text-sm">Support Human Artists:</div>
                <ul className="space-y-1 text-sm text-gray-300 ml-4">
                  <li>• Buy music or merch directly from small independent musicians</li>
                  <li>• Attend their live shows</li>
                  <li>• Follow and share artists you love</li>
                  <li>• Recommend human working musicians to friends</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Line */}
    <div className="bg-gradient-to-r from-pink-500 to-cyan-500 p-1 rounded-none">
      <div className="bg-black p-10 text-center">
        <h4 className="text-3xl font-black mb-4 uppercase">We want Responsible Integration of AI in the music industry</h4>
        <p className="text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
          This research demonstrates that <span className="font-black text-white">listeners cannot reliably detect AI music</span> ({displayData.accuracy.overall}% accuracy) 
          but <span className="font-black text-white">strongly support some level of mandatory AI music labeling</span> ({
            (() => {
              const support = displayData.labelingSupport || [];
              const aiOnly = support.find(s => s.name === 'AI-Generated Only')?.value || 0;
              const aiAndAssisted = support.find(s => s.name === 'AI-Generated & Assisted')?.value || 0;
              return aiOnly + aiAndAssisted;
            })()
          }% in favor). 
          Being transparent about when AI was used to create music protects consumer choice, supports working musicians, and enables responsible AI innovation.
        </p>
      </div>
    </div>

    {/* Navigation */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <button
        onClick={() => setSection('overview')}
        className="bg-black hover:bg-gray-900 text-white font-black text-xl py-8 rounded-none border-4 border-gray-700 hover:border-gray-500 transition-all uppercase"
      >
        ← Back to Overview
      </button>
      <button
        onClick={() => setSection('citations')}
        className="bg-pink-500 hover:bg-pink-600 text-white font-black text-xl py-8 rounded-none border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all uppercase"
      >
        View Sources →
      </button>
    </div>
  </div>
)}


  {section === 'citations' && (
  <div className="space-y-12">
    {/* Hero */}
    <div className="text-center">
      <div className="text-7xl font-black mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        WORKS
        <br />
        <span style={{
          background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          CITED
        </span>
      </div>
    </div>

    {/* Research & Policy Sources */}
    <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-pink-500 p-10 rounded-none shadow-[16px_16px_0px_0px_rgba(255,107,157,0.2)]">
      <div className="space-y-4">
        {[
          {
            title: "Federal Trade Commission Enforcement Authority",
            url: "https://www.ftc.gov/about-ftc/mission/enforcement-authority",
            org: "FTC"
          },
          {
            title: "Deezer-Ipsos Survey",
            url: "https://newsroom-deezer.com/2025/11/deezer-ipsos-survey-ai-music/",
            org: "Deezer"
          },
          {
            title: "Spotify Strengthens AI Protections",
            url: "https://newsroom.spotify.com/2025-09-25/spotify-strengthens-ai-protections/",
            org: "Spotify Newsroom"
          },
          {
            title: "Warner Music Signs Deal with AI Music Startup Suno, Settles Lawsuit",
            url: "https://techcrunch.com/2025/11/25/warner-music-signs-deal-with-ai-music-startup-suno-settles-lawsuit/",
            org: "TechCrunch"
          },
          {
            title: "AI Music Floods Spotify and Reaches Billboard Charts",
            url: "https://www.theguardian.com/technology/2025/nov/13/ai-music-spotify-billboard-charts",
            org: "The Guardian"
          },
          {
            title: "How Does AI Music Work? Benefits, Creativity, and Production on Spotify",
            url: "https://www.vox.com/the-highlight/358201/how-does-ai-music-work-benefits-creativity-production-spotify",
            org: "Vox"
          },
          {
            title: "The Impact of AI-Generated Music",
            url: "https://council.rollingstone.com/blog/the-impact-of-ai-generated-music/",
            org: "Rolling Stone Council"
          },
          {
            title: "Spotify Tightens AI Policy and Trims Catalog",
            url: "https://www.forbes.com/sites/billrosenblatt/2025/09/26/spotify-tightens-ai-policy-and-trims-catalog/",
            org: "Forbes"
          },
          {
            title: "Opinion: Spotify's AI-Generated Music Problem",
            url: "https://www.latimes.com/opinion/story/2026-02-18/spotify-ai-generated-music",
            org: "Los Angeles Times"
          },
          {
            title: "AI Disruption Could Cut Creator Earnings",
            url: "https://finance.yahoo.com/news/ai-disruption-could-cut-creator-053339720.html",
            org: "Yahoo Finance"
          }
        ].map((source, index) => (
          <div key={index} className="border-l-4 border-pink-500 pl-6 py-3 bg-black/30 hover:bg-black/50 transition-colors">
            <div className="text-gray-300">
              <div className="font-bold text-white mb-1">{source.title}</div>
              <div className="text-sm text-gray-500 mb-2">{source.org}</div>
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline text-sm break-all"
              >
                {source.url}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Music Sources */}
    <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-purple-500 p-10 rounded-none shadow-[16px_16px_0px_0px_rgba(170,150,218,0.2)]">
      <h3 className="text-2xl font-black mb-6 uppercase flex items-center gap-3">
        <Music2 className="text-purple-500" size={32} />
        Music Sources
      </h3>
      <div className="space-y-3">
        {[
          { title: "A Little Thing Like Love", artist: "Kayla Kross" },
          { title: "Cross My Mind", artist: "Olivia Dean" },
          { title: "Into the Blue", artist: "Sienna Rose" },
          { title: "A Million Colors", artist: "Vinih Pray" },
          { title: "My Darling Forever", artist: "Rosie & The Originals" },
          { title: "Influence (feat. Eric Bellinger)", artist: "Aries Ivory" }
        ].map((track, index) => (
          <div key={index} className="border-l-4 border-purple-500 pl-6 py-2 bg-black/30">
            <div className="text-gray-300">
              <span className="font-bold text-white">"{track.title}"</span>
              <span className="text-gray-500"> by {track.artist}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Technical Implementation */}
    <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-yellow-500 p-10 rounded-none shadow-[16px_16px_0px_0px_rgba(255,217,61,0.2)]">
      <h3 className="text-2xl font-black mb-6 uppercase flex items-center gap-3">
        <Sparkles className="text-yellow-500" size={32} />
        Technical Sources
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
        <div>
          <span className="font-black text-white">Claude AI used for coding assistance</span>
        </div>
      </div>
    </div>

    {/* Navigation */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <button
        onClick={() => setSection('recommendations')}
        className="bg-black hover:bg-gray-900 text-white font-black text-xl py-8 rounded-none border-4 border-gray-700 hover:border-gray-500 transition-all uppercase"
      >
        ← Back to Recommendations
      </button>
      <button
        onClick={() => {
          setSection('intro');
          setCurrentSongIndex(0);
          setResponses({});
          setRatings({});
          setRevealedRatings({});
          setLabelingSupport(null);
          setQuizPhase('identify');
          setContinueListening({});
        }}
        className="bg-pink-500 hover:bg-pink-600 text-white font-black text-xl py-8 rounded-none border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all uppercase flex items-center justify-center gap-3"
      >
        <RotateCcw size={24} />
        Restart Test
      </button>
    </div>

    {/* Footer Credit */}
    <div className="text-center text-gray-600 text-sm font-mono pt-8 border-t border-gray-800">
      Created by Kelly Yin • Duke University CS 255 • Spring 2026
    </div>
  </div>
)}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-pink-500 bg-black mt-32 relative z-10">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-black mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                AI Music Study
              </h2>
              <p className="text-gray-500 font-mono text-sm">Focused on AI music platform accountability</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400">Kelly Yin</p>
              <p className="text-gray-600 text-sm">CS 255 Final Project</p>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&display=swap');
        
        * {
          cursor: none !important;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default App;