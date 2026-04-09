import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Play, Pause, RotateCcw, ChevronRight, Disc3, Sparkles, Users, AlertCircle, CheckCircle2, XCircle, Headphones, Music2, BrainCircuit, Eye } from 'lucide-react';

// MOCK DATA
const SONGS = [
  { id: 1, title: "Summer Nights", genre: "Pop", actualType: "ai", audioUrl: "YOUR_AUDIO_URL_1.mp3", color: "#FF6B9D" },
  { id: 2, title: "Growing Pains", genre: "Indie", actualType: "human", audioUrl: "YOUR_AUDIO_URL_2.mp3", color: "#4ECDC4" },
  { id: 3, title: "Midnight Study", genre: "Lo-fi", actualType: "ai", audioUrl: "YOUR_AUDIO_URL_3.mp3", color: "#95E1D3" },
  { id: 4, title: "Dusty Roads", genre: "Country", actualType: "human", audioUrl: "YOUR_AUDIO_URL_4.mp3", color: "#F38181" },
  { id: 5, title: "Ethereal Dreams", genre: "Ambient", actualType: "ai", audioUrl: "YOUR_AUDIO_URL_5.mp3", color: "#AA96DA" },
  { id: 6, title: "Coffee Shop Groove", genre: "Indie", actualType: "hybrid", audioUrl: "YOUR_AUDIO_URL_6.mp3", color: "#FCBAD3" },
  { id: 7, title: "Neon Lights", genre: "Pop", actualType: "human", audioUrl: "YOUR_AUDIO_URL_7.mp3", color: "#FFFFD2" },
  { id: 8, title: "Forest Path", genre: "Folk", actualType: "ai", audioUrl: "YOUR_AUDIO_URL_8.mp3", color: "#A8D8EA" },
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
    { dimension: 'Creativity', ai: 52, human: 85 },
    { dimension: 'Emotional\nImpact', ai: 45, human: 82 },
    { dimension: 'Technical\nQuality', ai: 78, human: 73 },
    { dimension: 'Authenticity', ai: 38, human: 91 }
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

function App() {
  const [section, setSection] = useState('intro');
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [ratings, setRatings] = useState({});
  const [revealedRatings, setRevealedRatings] = useState({});
  const [quizPhase, setQuizPhase] = useState('identify');
  const [isPlaying, setIsPlaying] = useState(false);
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

  const handleNextReveal = () => {
    if (currentSongIndex < SONGS.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setQuizPhase('complete');
      setSection('results');
    }
  };

  const calculateAccuracy = () => {
    let correct = 0;
    Object.entries(responses).forEach(([songId, response]) => {
      const song = SONGS.find(s => s.id === parseInt(songId));
      if (song && song.actualType === response) correct++;
    });
    return Math.round((correct / SONGS.length) * 100);
  };

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
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-black tracking-tighter" style={{ 
                background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Space Grotesk', sans-serif"
              }}>
                THE TRANSPARENCY<br/>TEST
              </h1>
              <p className="text-pink-400 mt-2 text-sm font-mono uppercase tracking-wider">Can machines fool the human ear?</p>
            </div>
            <VinylRecord isPlaying={isPlaying} size="medium" />
          </div>
        </div>
      </header>

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
                  AI music tools like <span className="text-cyan-400 font-bold">Suno</span> and <span className="text-pink-400 font-bold">Udio</span> can 
                  now generate studio-quality tracks in seconds. But can <em>you</em> tell the difference?
                </p>
                <p>
                  This study explores whether listeners can distinguish AI-generated music from human creativity, 
                  and whether <span className="font-bold text-white">transparency changes perception</span>.
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
                      <div className="text-gray-400">Truth revealed</div>
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
                  <div className="font-mono">~12 minutes</div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    127 participants
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <VinylRecord isPlaying={true} color="#FF6B9D" size="large" />
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-full">
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
                    <p className="text-gray-500 uppercase text-sm tracking-widest font-bold mb-6">{currentSong.genre}</p>
                    
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
                  <p className="text-xl font-bold mb-2">Your Call:</p>
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
                      <p className="text-gray-500 uppercase text-xs tracking-widest font-bold mb-4">{currentSong.genre}</p>
                      
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
                  { key: 'creativity', label: 'Creativity', question: 'How creative is this song?', color: '#4ECDC4' },
                  { key: 'emotional', label: 'Emotional Impact', question: 'How emotionally resonant is this?', color: '#AA96DA' }
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
                  disabled={!ratings[currentSong.id] || Object.keys(ratings[currentSong.id]).length < 3}
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
                    <VinylRecord isPlaying={isPlaying} color={currentSong.color} size="medium" />
                    <div className="mt-4 text-center">
                      <h4 className="text-2xl font-black">{currentSong.title}</h4>
                      <p className="text-gray-500 uppercase text-xs tracking-widest">{currentSong.genre}</p>
                    </div>
                    <audio ref={audioRef} onEnded={() => setIsPlaying(false)}>
                      <source src={currentSong.audioUrl} type="audio/mpeg" />
                    </audio>
                    <button
                      onClick={handlePlayPause}
                      className="mt-4 bg-white text-black font-black py-2 px-6 rounded-none border-2 border-black flex items-center gap-2"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      {isPlaying ? 'Pause' : 'Listen'}
                    </button>
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
                  { key: 'creativity', label: 'Creativity', color: '#4ECDC4' },
                  { key: 'emotional', label: 'Emotional Impact', color: '#AA96DA' }
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

                <button
                  onClick={handleNextReveal}
                  disabled={!revealedRatings[currentSong.id] || Object.keys(revealedRatings[currentSong.id]).length < 3}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-800 text-black disabled:text-gray-600 font-black text-xl py-6 rounded-none border-4 border-black disabled:border-gray-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all uppercase flex items-center justify-center gap-2"
                >
                  {currentSongIndex < SONGS.length - 1 ? 'Next Song' : 'See Results'}
                  <ChevronRight size={24} />
                </button>
              </div>
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
                Identification Accuracy <span className="text-gray-600 font-mono text-lg">(avg: 58%)</span>
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
              {/* Accuracy by genre */}
              <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-pink-500 p-8 rounded-none shadow-[12px_12px_0px_0px_rgba(255,107,157,0.2)]">
                <h3 className="text-2xl font-black mb-6 uppercase">Accuracy by Genre</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={AGGREGATE_DATA.accuracy.byGenre}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="genre" stroke="#888" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                    <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        border: '2px solid #FF6B9D',
                        borderRadius: 0,
                        fontWeight: 'bold'
                      }}
                    />
                    <Bar dataKey="accuracy" radius={[0, 0, 0, 0]}>
                      {AGGREGATE_DATA.accuracy.byGenre.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-500 mt-4 font-mono">
                  💡 Lo-fi was hardest to identify (48%), country easiest (65%)
                </p>
              </div>

              {/* Radar chart */}
              <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-cyan-500 p-8 rounded-none shadow-[12px_12px_0px_0px_rgba(78,205,196,0.2)]">
                <h3 className="text-2xl font-black mb-6 uppercase">AI vs Human Ratings</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={AGGREGATE_DATA.radarData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="dimension" stroke="#888" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <PolarRadiusAxis stroke="#666" />
                    <Radar name="AI Music" dataKey="ai" stroke="#FF6B9D" fill="#FF6B9D" fillOpacity={0.3} strokeWidth={3} />
                    <Radar name="Human Music" dataKey="human" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.3} strokeWidth={3} />
                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-500 mt-4 font-mono">
                  💡 Human music rated higher on creativity & authenticity
                </p>
              </div>

              {/* Preference shift */}
              <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-purple-500 p-8 rounded-none shadow-[12px_12px_0px_0px_rgba(170,150,218,0.2)]">
                <h3 className="text-2xl font-black mb-6 uppercase">Preference Shift</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={AGGREGATE_DATA.preferenceShift}>
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
                  💡 AI music ratings dropped 24% after truth revealed
                </p>
              </div>

              {/* Labeling support */}
              <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-yellow-500 p-8 rounded-none shadow-[12px_12px_0px_0px_rgba(255,217,61,0.2)]">
                <h3 className="text-2xl font-black mb-6 uppercase">Labeling Support</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={AGGREGATE_DATA.labelingSupport}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                      labelStyle={{ fontSize: '14px', fontWeight: 'bold', fill: '#fff' }}
                    >
                      {AGGREGATE_DATA.labelingSupport.map((entry, index) => (
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
                  💡 91% support mandatory AI music labeling
                </p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setSection('policy')}
                className="bg-pink-500 hover:bg-pink-600 text-white font-black text-xl py-8 rounded-none border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider"
              >
                View Policy Recommendations →
              </button>
              <button
                onClick={() => {
                  setSection('intro');
                  setCurrentSongIndex(0);
                  setResponses({});
                  setRatings({});
                  setRevealedRatings({});
                  setQuizPhase('identify');
                }}
                className="bg-black hover:bg-gray-900 text-white font-black text-xl py-8 rounded-none border-4 border-gray-700 hover:border-gray-500 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] transition-all uppercase tracking-wider flex items-center justify-center gap-3"
              >
                <RotateCcw size={24} />
                Restart Test
              </button>
            </div>
          </div>
        )}

        {section === 'policy' && (
          <div className="space-y-12">
            <div className="text-center">
              <div className="text-7xl font-black mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                POLICY
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  RECOMMENDATIONS
                </span>
              </div>
              <p className="text-xl text-gray-400">Evidence-based framework for AI music accountability</p>
            </div>

            {/* Key findings */}
            <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-4 border-pink-500 p-10 rounded-none shadow-[16px_16px_0px_0px_rgba(255,107,157,0.2)]">
              <h3 className="text-3xl font-black mb-6 uppercase flex items-center gap-3">
                <AlertCircle className="text-pink-500" size={36} />
                Key Findings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-pink-500 mt-3 flex-shrink-0" />
                  <p className="text-gray-300">Listeners perform only <span className="font-black text-white">slightly better than chance</span> at identifying AI music (58% accuracy)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mt-3 flex-shrink-0" />
                  <p className="text-gray-300"><span className="font-black text-white">Genre matters:</span> Lo-fi hardest to detect, country easiest</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-3 flex-shrink-0" />
                  <p className="text-gray-300">Transparency changes perception: ratings drop <span className="font-black text-white">24% for AI music</span> once origin is known</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-3 flex-shrink-0" />
                  <p className="text-gray-300"><span className="font-black text-white">91% support</span> mandatory labeling despite low detection accuracy</p>
                </div>
              </div>
            </div>

            {/* Policy sections */}
            <div className="space-y-8">
              {[
                {
                  number: "01",
                  title: "Mandatory Labeling Standards",
                  color: "#FF6B9D",
                  icon: AlertCircle,
                  content: (
                    <>
                      <p className="text-gray-300 mb-4 text-lg">
                        Streaming platforms must require clear AI-generated music labels visible on track pages, similar to "Explicit Content" warnings.
                      </p>
                      <div className="bg-black/50 border-l-4 border-pink-500 p-6 space-y-3">
                        <div>
                          <span className="font-black text-pink-400">Tiered System:</span>
                          <ul className="mt-2 space-y-2 text-gray-400">
                            <li className="flex items-start gap-2">
                              <span className="text-pink-500">▸</span>
                              <span>"AI-Generated" - Fully created by AI tools</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-500">▸</span>
                              <span>"AI-Assisted" - Human artists using AI for production</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-500">▸</span>
                              <span>"Human-Created" - No AI involvement</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <span className="font-black text-pink-400">Enforcement:</span>
                          <p className="text-gray-400 mt-2">Platform accountability for verification, with penalties for intentional mislabeling</p>
                        </div>
                      </div>
                    </>
                  )
                },
                {
                  number: "02",
                  title: "Platform Accountability",
                  color: "#4ECDC4",
                  icon: Users,
                  content: (
                    <>
                      <div className="space-y-4 text-gray-300">
                        <div className="bg-black/50 border-l-4 border-cyan-500 p-5">
                          <div className="font-black text-cyan-400 mb-2">Upload Verification</div>
                          <p className="text-gray-400">Implement processes to prevent fraudulent attribution of AI music to human artists</p>
                        </div>
                        <div className="bg-black/50 border-l-4 border-cyan-500 p-5">
                          <div className="font-black text-cyan-400 mb-2">Algorithmic Transparency</div>
                          <p className="text-gray-400">Disclose when playlists heavily feature AI-generated content</p>
                        </div>
                        <div className="bg-black/50 border-l-4 border-cyan-500 p-5">
                          <div className="font-black text-cyan-400 mb-2">Royalty Differentiation</div>
                          <p className="text-gray-400">Consider different monetization structures to protect human artist income</p>
                        </div>
                      </div>
                    </>
                  )
                },
                {
                  number: "03",
                  title: "Artist Protection",
                  color: "#AA96DA",
                  icon: Sparkles,
                  content: (
                    <>
                      <div className="space-y-4 text-gray-300">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-none bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center flex-shrink-0">
                            <span className="font-black text-purple-400">→</span>
                          </div>
                          <div>
                            <div className="font-black text-white mb-1">Voice/Style Rights</div>
                            <p className="text-gray-400">Artists have the right to opt out of voice and style replication by AI tools</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-none bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center flex-shrink-0">
                            <span className="font-black text-purple-400">→</span>
                          </div>
                          <div>
                            <div className="font-black text-white mb-1">Copyright Enhancement</div>
                            <p className="text-gray-400">Strengthen protections for artists whose work is used in AI training datasets</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-none bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center flex-shrink-0">
                            <span className="font-black text-purple-400">→</span>
                          </div>
                          <div>
                            <div className="font-black text-white mb-1">Discoverability Support</div>
                            <p className="text-gray-400">Platform algorithms should support human artist discoverability</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                },
                {
                  number: "04",
                  title: "Balancing Innovation",
                  color: "#FFD93D",
                  icon: BrainCircuit,
                  content: (
                    <>
                      <p className="text-gray-300 mb-4 text-lg">
                        AI music tools offer legitimate benefits and should not be banned outright:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { title: "Accessibility", desc: "For musicians with disabilities" },
                          { title: "Prototyping", desc: "Rapid creative exploration" },
                          { title: "Education", desc: "Teaching composition & production" }
                        ].map((item, i) => (
                          <div key={i} className="bg-black/50 border-2 border-yellow-500 p-4">
                            <div className="font-black text-yellow-400 mb-2">{item.title}</div>
                            <p className="text-gray-400 text-sm">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-6 mt-6">
                        <p className="text-gray-300">
                          <span className="font-black text-white">Framework:</span> Distinguish between AI as a <em>tool</em> (augmenting human creativity) 
                          versus AI as <em>replacement</em> (displacing human artists). Policy should enable the former while 
                          regulating the latter through transparency requirements.
                        </p>
                      </div>
                    </>
                  )
                }
              ].map((section) => (
                <div key={section.number} className="bg-gradient-to-br from-gray-900 to-black border-4 p-8 rounded-none"
                     style={{ borderColor: section.color, boxShadow: `12px 12px 0px 0px ${section.color}40` }}>
                  <div className="flex items-start gap-6 mb-6">
                    <div className="text-7xl font-black text-gray-800">{section.number}</div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black uppercase mb-2 flex items-center gap-3">
                        <section.icon size={32} style={{ color: section.color }} />
                        {section.title}
                      </h3>
                    </div>
                  </div>
                  {section.content}
                </div>
              ))}
            </div>

            {/* Implementation path */}
            <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-white p-10 rounded-none shadow-[16px_16px_0px_0px_rgba(255,255,255,0.1)]">
              <h3 className="text-3xl font-black uppercase mb-8">Implementation Path</h3>
              <div className="space-y-6">
                {[
                  { phase: "Phase 1", time: "0-6 months", action: "Industry working group develops technical standards for labeling", color: "#FF6B9D" },
                  { phase: "Phase 2", time: "6-12 months", action: "Voluntary adoption by major platforms with public reporting", color: "#4ECDC4" },
                  { phase: "Phase 3", time: "12-18 months", action: "FTC enforcement action under Section 5 for non-compliant platforms", color: "#AA96DA" },
                  { phase: "Backup", time: "If needed", action: "Federal legislation requiring AI content labeling across all platforms", color: "#FFD93D" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-6">
                    <div className="w-24 flex-shrink-0">
                      <div className="font-black text-sm uppercase" style={{ color: item.color }}>{item.phase}</div>
                      <div className="text-xs text-gray-600 font-mono">{item.time}</div>
                    </div>
                    <div className="flex-1 bg-black/50 border-l-4 p-4" style={{ borderColor: item.color }}>
                      <p className="text-gray-300">{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom line */}
            <div className="bg-gradient-to-r from-pink-500 to-cyan-500 p-1 rounded-none">
              <div className="bg-black p-10">
                <h4 className="text-3xl font-black mb-4 uppercase">The Bottom Line</h4>
                <p className="text-xl text-gray-300 leading-relaxed">
                  This research demonstrates that listeners <span className="font-black text-white">cannot reliably detect AI music</span>, 
                  yet <span className="font-black text-white">strongly support transparency</span>. Mandatory labeling protects consumer choice, 
                  supports human artists, and enables responsible AI innovation. The technology exists, public support is clear, 
                  and the policy path is straightforward. The question is not <em>whether</em> platforms should label AI music, 
                  but <span className="font-black text-white">when they will start</span>.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setSection('results')}
                className="bg-black hover:bg-gray-900 text-white font-black text-xl py-8 rounded-none border-4 border-gray-700 hover:border-gray-500 transition-all uppercase"
              >
                ← Back to Results
              </button>
              <button
                onClick={() => {
                  setSection('intro');
                  setCurrentSongIndex(0);
                  setResponses({});
                  setRatings({});
                  setRevealedRatings({});
                  setQuizPhase('identify');
                }}
                className="bg-pink-500 hover:bg-pink-600 text-white font-black text-xl py-8 rounded-none border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all uppercase flex items-center justify-center gap-3"
              >
                <RotateCcw size={24} />
                Restart Test
              </button>
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
                THE TRANSPARENCY TEST
              </h2>
              <p className="text-gray-500 font-mono text-sm">A study on AI music platform accountability</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400">Kelly Yin</p>
              <p className="text-gray-600 text-sm">Duke University</p>
              <p className="text-gray-600 text-sm">Cybersecurity & National Security Law/Policy Capstone</p>
              <p className="text-gray-600 text-sm font-mono">2026</p>
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