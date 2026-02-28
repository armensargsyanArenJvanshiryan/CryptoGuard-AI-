import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Search, 
  ArrowRight, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  RefreshCcw,
  ExternalLink,
  Image as ImageIcon,
  X,
  Languages,
  Upload,
  User,
  LogOut,
  Menu,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';
import { analyzeCryptoNews, type AnalysisResult } from './services/gemini';
import { LANGUAGES } from './constants/languages';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('Auto-detect');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkApiKey();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim() && !image) return;
    
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeCryptoNews(input, image || undefined, selectedLanguage);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setInput('');
    setImage(null);
    setResult(null);
    setError(null);
  };

  const toggleLogin = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* API Key Banner */}
      {!hasApiKey && (
        <div className="bg-indigo-600 text-white py-3 px-4 text-center text-sm font-bold flex items-center justify-center gap-4 sticky top-0 z-[60] shadow-lg">
          <Zap className="w-4 h-4 fill-white animate-pulse" />
          <span>Gemini 3 Intelligence requires a valid API key.</span>
          <button 
            onClick={handleOpenKeySelector}
            className="bg-white text-indigo-600 px-4 py-1 rounded-full hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Select API Key
          </button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline opacity-80 hover:opacity-100 transition-opacity"
          >
            Billing Docs
          </a>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200"
            >
              <ShieldCheck className="text-white w-6 h-6" />
            </motion.div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-none">CryptoGuard AI</h1>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Security Protocol v2.5</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-indigo-600 transition-colors">Dashboard</a>
              <button onClick={() => setShowAboutModal(true)} className="hover:text-indigo-600 transition-colors">About Us</button>
              <a href="#" className="hover:text-indigo-600 transition-colors">Safety Tips</a>
            </nav>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowLanguageModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-[11px] font-bold text-slate-600 uppercase tracking-wider transition-colors"
              >
                <Languages className="w-3.5 h-3.5 text-indigo-500" />
                {selectedLanguage}
              </button>
              <button 
                onClick={toggleLogin}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95",
                  isLoggedIn 
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-200"
                )}
              >
                {isLoggedIn ? (
                  <>
                    <User className="w-4 h-4" />
                    My Account
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    Login
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <nav className="flex flex-col gap-4 text-base font-medium text-slate-600">
                  <a href="#" className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                    Dashboard <ChevronRight className="w-4 h-4 opacity-40" />
                  </a>
                  <button 
                    onClick={() => { setShowAboutModal(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg w-full text-left"
                  >
                    About Us <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                  <a href="#" className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                    Safety Tips <ChevronRight className="w-4 h-4 opacity-40" />
                  </a>
                  <button 
                    onClick={() => { setShowLanguageModal(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg w-full text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-indigo-500" />
                      Language: {selectedLanguage}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                </nav>
                <div className="pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => { toggleLogin(); setIsMobileMenuOpen(false); }}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {isLoggedIn ? <LogOut className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    {isLoggedIn ? "Logout" : "Login to CryptoGuard"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-bold text-[10px] uppercase tracking-widest border border-indigo-100"
              >
                <Zap className="w-3 h-3 fill-indigo-600" />
                Real-time Intelligence
              </motion.div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Scan. Verify. <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8 italic">Invest.</span>
              </h2>
              <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                Our AI-powered engine cross-references news and images across 100+ languages to protect your capital.
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste crypto news, project descriptions, or social media posts here..."
                  className="w-full h-56 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none text-slate-700 placeholder:text-slate-400 text-base leading-relaxed"
                />
                <div className="absolute bottom-6 right-6 flex gap-3">
                  {input && (
                    <button 
                      onClick={() => setInput('')}
                      className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="space-y-3">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                {!image ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all group bg-white/50"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold block text-slate-600 group-hover:text-indigo-600">Drop Screenshot</span>
                      <span className="text-[11px] opacity-60 font-medium">PNG, JPG up to 5MB</span>
                    </div>
                  </button>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden border-2 border-indigo-100 bg-white p-3 shadow-xl shadow-indigo-50">
                    <img 
                      src={image} 
                      alt="Upload preview" 
                      className="w-full h-56 object-cover rounded-2xl"
                    />
                    <button 
                      onClick={() => setImage(null)}
                      className="absolute top-6 right-6 p-2 bg-slate-900/90 text-white rounded-full hover:bg-slate-900 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-6 left-6 px-4 py-2 bg-white/95 backdrop-blur rounded-xl text-[11px] font-black text-indigo-600 uppercase tracking-widest shadow-sm border border-indigo-50">
                      Visual Data Loaded
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || (!input.trim() && !image)}
              className={cn(
                "w-full py-5 px-8 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl",
                loading || (!input.trim() && !image) 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98] shadow-indigo-100"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing Intelligence...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 fill-white" />
                  Run Protocol Scan
                </>
              )}
            </button>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Languages', value: '100+', icon: Languages },
                { label: 'Accuracy', value: '99.2%', icon: ShieldCheck },
                { label: 'Scams Blocked', value: '12k', icon: ShieldAlert },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 text-center space-y-1 shadow-sm">
                  <stat.icon className="w-4 h-4 text-indigo-500 mx-auto mb-2" />
                  <div className="text-lg font-black text-slate-900 leading-none">{stat.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 lg:sticky lg:top-32">
            <AnimatePresence mode="wait">
              {!result && !loading ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full min-h-[500px] border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-12 text-center space-y-6 bg-white/30"
                >
                  <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-slate-100 border border-slate-50">
                    <Search className="w-10 h-10 text-slate-200" />
                  </div>
                  <div className="max-w-xs space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900">Intelligence Hub</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Our neural network is standing by. Input data on the left to begin the deep-scan sequence.
                    </p>
                  </div>
                </motion.div>
              ) : loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[500px] bg-white border border-slate-200 rounded-[40px] p-12 flex flex-col items-center justify-center space-y-8 shadow-2xl shadow-slate-100"
                >
                  <div className="relative">
                    <div className="w-28 h-28 border-[6px] border-indigo-50 border-t-indigo-600 rounded-full animate-spin" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">AI Deep Scan Active</h3>
                    <p className="text-slate-500 font-medium animate-pulse">Deconstructing linguistic patterns & visual metadata...</p>
                  </div>
                  <div className="w-full max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-full bg-indigo-600"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Risk & Scam Header */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "p-8 rounded-[32px] border-2 flex flex-col gap-3 shadow-xl",
                        result?.riskLevel === 'LOW' ? "bg-emerald-50 border-emerald-100 shadow-emerald-100/50" :
                        result?.riskLevel === 'MEDIUM' ? "bg-amber-50 border-amber-100 shadow-amber-100/50" :
                        "bg-rose-50 border-rose-100 shadow-rose-100/50"
                      )}
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Risk Assessment</span>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center",
                          result?.riskLevel === 'LOW' ? "bg-emerald-100 text-emerald-600" :
                          result?.riskLevel === 'MEDIUM' ? "bg-amber-100 text-amber-600" :
                          "bg-rose-100 text-rose-600"
                        )}>
                          {result?.riskLevel === 'LOW' ? <TrendingDown className="w-7 h-7" /> : <TrendingUp className="w-7 h-7" />}
                        </div>
                        <span className={cn(
                          "text-3xl font-black tracking-tighter",
                          result?.riskLevel === 'LOW' ? "text-emerald-700" :
                          result?.riskLevel === 'MEDIUM' ? "text-amber-700" :
                          "text-rose-700"
                        )}>
                          {result?.riskLevel}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed opacity-80">{result?.riskReason}</p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "p-8 rounded-[32px] border-2 flex flex-col gap-3 shadow-xl",
                        result?.isScamLikely ? "bg-slate-900 text-white border-slate-800 shadow-slate-200" : "bg-white border-slate-200 shadow-slate-100"
                      )}
                    >
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em]",
                        result?.isScamLikely ? "text-rose-400" : "text-slate-400"
                      )}>Integrity Check</span>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center",
                          result?.isScamLikely ? "bg-rose-500 text-white" : "bg-emerald-50 text-emerald-500"
                        )}>
                          {result?.isScamLikely ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
                        </div>
                        <span className="text-3xl font-black tracking-tighter">
                          {result?.isScamLikely ? "DANGER" : "SECURE"}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm font-medium leading-relaxed",
                        result?.isScamLikely ? "text-slate-300" : "text-slate-500"
                      )}>
                        {result?.isScamLikely ? result?.scamWarning : "No immediate scam patterns detected in this context."}
                      </p>
                    </motion.div>
                  </div>

                  {/* Summary */}
                  <div className="bg-white border border-slate-200 rounded-[40px] p-8 sm:p-12 shadow-2xl shadow-slate-100 space-y-10">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                            <Info className="w-5 h-5 text-indigo-600" />
                          </div>
                          Deep Summary
                        </h3>
                        <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
                          Neural Analysis
                        </div>
                      </div>
                      <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-medium">
                        <Markdown>{result?.summary}</Markdown>
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

                    <div className="space-y-6">
                      <h3 className="text-xl font-black text-slate-900">Key Intelligence Points</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {result?.keyTakeaways.map((point, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                              {i + 1}
                            </div>
                            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">{point}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                      <button 
                        onClick={reset}
                        className="text-sm font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-2 transition-all group"
                      >
                        <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        New Scan Sequence
                      </button>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Export Report
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
                    <ShieldCheck className="text-white w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h3>
                  <p className="text-slate-500 font-medium">Access your secure crypto intelligence dashboard.</p>
                </div>

                <form onSubmit={handleMockLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@example.com"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] mt-4"
                  >
                    Authorize Access
                  </button>
                </form>

                <div className="text-center">
                  <button className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                    Don't have an account? <span className="text-indigo-600">Join the Protocol</span>
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAboutModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 sm:p-12 space-y-10">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
                    <Info className="text-white w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">About CryptoGuard AI</h3>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    CryptoGuard AI was founded with a single mission: to make the decentralized web a safer place for everyone. By leveraging cutting-edge neural networks and real-time blockchain analysis, we provide a shield against the most sophisticated scams in the crypto ecosystem.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Our Vision</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      To become the global standard for crypto intelligence, ensuring that every investor—regardless of their technical background—can navigate the market with confidence.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">The Technology</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Our proprietary Gemini-powered engine analyzes linguistic patterns, visual metadata, and smart contract signatures to detect red flags in milliseconds.
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 space-y-8">
                  <div className="text-center space-y-2">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Trusted Partners & Integrations</h4>
                    <p className="text-sm text-slate-500">We collaborate with industry leaders to maintain the highest security standards.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {[
                      { name: 'Binance', color: 'text-amber-500' },
                      { name: 'Coinbase', color: 'text-blue-600' },
                      { name: 'Chainlink', color: 'text-indigo-600' },
                      { name: 'Polygon', color: 'text-purple-600' },
                      { name: 'Ledger', color: 'text-slate-900' },
                      { name: 'MetaMask', color: 'text-orange-500' },
                    ].map((partner, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-center border border-slate-100 hover:border-indigo-200 transition-colors group">
                        <span className={cn("font-black text-lg tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity", partner.color)}>
                          {partner.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <button 
                    onClick={() => setShowAboutModal(false)}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                  >
                    Close Protocol Briefing
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setShowAboutModal(false)}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacyModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 sm:p-12 space-y-10">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
                    <ShieldCheck className="text-white w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Protocol</h3>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    Your data privacy is our highest priority. CryptoGuard AI is built on the principle of minimal data collection and maximum security.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest">Data Collection</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      We do not store your personal identity. Analysis data is processed in real-time and is not linked to your account unless you explicitly choose to save reports.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest">AI Processing</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      The text and images you submit for analysis are used solely to generate security reports. We do not use your private data to train our models.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest">Third-Party Disclosure</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      We never sell or trade your data. We only share anonymized threat patterns with our security partners to improve the global crypto safety ecosystem.
                    </p>
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <button 
                    onClick={() => setShowPrivacyModal(false)}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                  >
                    Acknowledge Privacy Terms
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Language Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLanguageModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Languages className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select Language</h3>
                    <p className="text-sm text-slate-500 font-medium">Choose the output language for your analysis.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLanguageModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setShowLanguageModal(false);
                      }}
                      className={cn(
                        "px-4 py-3 rounded-xl text-sm font-bold transition-all text-left flex items-center justify-between group",
                        selectedLanguage === lang 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                          : "bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                      )}
                    >
                      {lang}
                      {selectedLanguage === lang && <ShieldCheck className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 text-center shrink-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Currently Selected: <span className="text-indigo-600">{selectedLanguage}</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="text-white w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">CryptoGuard AI</h1>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed font-medium">
                The world's most advanced AI-powered crypto intelligence platform. We simplify the complex and expose the fraudulent.
              </p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">Platform</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Neural Engine</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Market Scan</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">API Access</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><button onClick={() => setShowAboutModal(true)} className="hover:text-indigo-600 transition-colors">About Us</button></li>
                <li><button onClick={() => setShowPrivacyModal(true)} className="hover:text-indigo-600 transition-colors">Privacy</button></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <p>© 2024 CryptoGuard AI. Built for the decentralized future.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-indigo-600 transition-colors">Twitter</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Discord</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Github</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
