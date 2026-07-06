import { useState, useEffect } from 'react';
import { 
  Search, 
  Youtube, 
  BarChart3, 
  Tag, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TagIntelligence {
  original: string;
  lower: string;
  wordCount: number;
  charCount: number;
  type: string;
  typeScore: number;
  relevanceScore: number;
  relevanceLabel: string;
  strengthScore: number;
  strength: string;
  isRedundant: boolean;
  redundancyNote: string;
  lengthScore: number;
  lengthNote: string;
  isBrandTag: boolean;
  budgetContribution: number;
  popularitySignal: string;
}

interface AnalysisResult {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  views: number;
  likes: number;
  comments: number;
  durationSecs: number;
  isShort: boolean;
  engagementRate: number;
  allTagCount: number;
  strongTagCount: number;
  rawTagCount: number;
  charBudgetUsed: number;
  charBudgetTotal: number;
  charBudgetPercent: number;
  charBudgetRemaining: number;
  tags: TagIntelligence[];
  tagHealthScore: number;
  healthLabel: string;
  avgRelevanceScore: number;
  missingTags: { tag: string; priority: string; wordCount: number }[];
  actionItems: { priority: string; action: string; impact: string }[];
  deletedTags: string[];
  allTagsCopied: string;
  strongTagsCopied: string;
}

export default function App() {
  useEffect(() => {
  const sendHeight = () => {
    const height = document.body.scrollHeight;
    window.parent.postMessage({ type: 'resize-iframe', height }, '*');
  };
  sendHeight();
  const observer = new ResizeObserver(sendHeight);
  observer.observe(document.body);
  return () => observer.disconnect();
}, []);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const analyzeVideo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    executeAnalysis();
  };

  const executeAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      const contentType = resp.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await resp.json();
        if (resp.ok) {
          setResult(data);
          setSelectedTags([]); // Reset selection on new analysis
        } else {
          setError(data.error || "Analysis failed on the server.");
        }
      } else {
        const text = await resp.text();
        console.error("Server returned non-JSON response:", text);
        setError(`Server communication error (HTTP ${resp.status}): ${text.substring(0, 100)}`);
      }
    } catch (err: any) {
      console.error("Fetch Exception:", err);
      setError(`Analysis module failure: ${err?.message || "Verify network connection."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopying(id);
    setTimeout(() => setCopying(null), 2000);
  };

  const toggleTagSelection = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleSelectAll = () => {
    if (!result) return;
    if (selectedTags.length === result.tags.length) {
      setSelectedTags([]);
    } else {
      setSelectedTags(result.tags.map(t => t.original));
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getBadgeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'strong' || t === 'critical' || t === 'excellent') return 'bg-red-500/10 text-red-600 border-red-500/20';
    if (t === 'moderate' || t === 'high' || t === 'good') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-roboto selection:bg-red-500/30 selection:text-red-900 flex flex-col overflow-hidden h-screen">
      {/* Top Navigation & Input */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 shrink-0 z-30 shadow-sm relative">
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Protocol Status</p>
            <p className={`text-[10px] font-black flex items-center gap-1 uppercase ${loading ? 'text-amber-500' : 'text-green-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${loading ? 'bg-amber-500' : 'bg-green-500'}`}></span> 
              {loading ? 'Analyzing' : 'Ready'}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Universal Search Input in Page Body */}
        <section className="max-w-4xl mx-auto w-full pt-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase font-lora leading-[1.1] mb-6">
              <span className="text-slate-900">YouTube </span>
              <span className="text-red-600">Tag Extractor </span>
              <span className="text-slate-900">and </span>
              <br className="hidden md:block" />
              <span className="text-red-600">Intelligence Analyzer</span>
            </h1>
            <div className="h-1 w-16 bg-red-600 mx-auto rounded-full"></div>
          </div>
          <form onSubmit={analyzeVideo} className="relative flex group shadow-[0_20px_50px_rgba(220,38,38,0.1)] rounded-2xl overflow-hidden border border-slate-200 transition-all focus-within:border-red-400 focus-within:ring-8 focus-within:ring-red-500/5">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
               <Search size={24} />
            </div>
            <input 
              type="text" 
              placeholder="Inject strategic video URL or ID sequence..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-20 pl-16 pr-48 bg-white text-lg focus:outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-10 bg-red-600 text-white rounded-xl text-sm font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all disabled:opacity-50 shadow-xl shadow-red-600/20 active:scale-95"
            >
              {loading ? "SEARCHING..." : "ANALYZE"}
            </button>
          </form>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center text-[11px] font-black uppercase tracking-[0.3em] text-red-600 bg-red-50/50 py-4 rounded-xl border border-red-100"
            >
              System Error: {error}
            </motion.p>
          )}
        </section>

        <AnimatePresence mode="wait">
          {!result && !loading && (
            <div key="empty" className="h-32" />
          )}

          {loading && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center py-20"
            >
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                />
              </div>
              <p className="mt-10 text-[10px] font-black uppercase tracking-[0.6em] text-red-600 animate-pulse">Scanning Metadata Clusters...</p>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto space-y-10 pb-20"
            >
              {/* SECTION: Integrated Analytics Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Left Side: Video Intelligence Container */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                    <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em] font-lora">Video Strategic Context</h3>
                  </div>
                  
                  <div className="flex gap-6 items-start">
                    <div className="w-1/2 aspect-video relative group flex-shrink-0">
                      <img src={result.thumbnailUrl} alt={result.title} className="w-full h-full object-cover rounded shadow-lg ring-1 ring-slate-200" />
                      <div className="absolute bottom-2 right-2 bg-black/90 text-white text-[9px] px-2 py-0.5 rounded font-black tracking-widest border border-white/10">
                        {Math.floor(result.durationSecs / 60)}:{String(result.durationSecs % 60).padStart(2, '0')}
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <h2 className="font-black text-sm text-slate-800 leading-[1.4] uppercase tracking-tight line-clamp-3 font-lora">{result.title}</h2>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 w-fit px-2 py-1 rounded">
                          <Eye size={12} /> {formatNumber(result.views)} VIEWS
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <BarChart3 size={12} /> {result.channelTitle}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: High Performance Metrics Container */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                   <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                    <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em] font-lora">Metadata Signal strength</h3>
                  </div>

                  <div className="grid grid-cols-12 gap-6 h-full">
                    {/* Health Score Pillar */}
                    <div className="col-span-5 bg-red-50 rounded border border-red-100 flex flex-col items-center justify-center p-4">
                      <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2">Health Grade</p>
                      <div className="text-6xl font-black text-red-600 tracking-tighter drop-shadow-[0_4px_12px_rgba(220,38,38,0.2)] font-inter">
                        {result.tagHealthScore}
                      </div>
                      <div className="mt-4 px-3 py-1 bg-white text-red-600 text-[8px] font-black uppercase tracking-[0.2em] border border-red-100 rounded-full shadow-sm">
                        {result.healthLabel}
                      </div>
                    </div>

                    {/* Metric List */}
                    <div className="col-span-7 flex flex-col justify-between h-full py-1">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">All Tag</span>
                        <span className="text-xl font-black text-slate-800 tabular-nums font-inter">{result.allTagCount}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Strong Relevance Tag</span>
                        <span className="text-xl font-black text-red-600 tabular-nums font-inter">{result.strongTagCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Raw Tag</span>
                        <span className="text-xl font-black text-slate-800 tabular-nums font-inter">{result.rawTagCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ALL TAG REPORT TABLE WITH SELECTOR */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-red-600">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] font-lora">ALL TAG REPORT — ANALYTIC VECTOR</h3>
                    {selectedTags.length > 0 && (
                      <motion.span 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-3 py-1 bg-red-600 text-white text-[9px] font-black rounded-full shadow-lg shadow-red-600/20"
                      >
                        {selectedTags.length} SELECTED
                      </motion.span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTags.length > 0 && (
                      <button 
                        onClick={() => handleCopy(selectedTags.join(", "), 'selected')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-lg"
                      >
                        {copying === 'selected' ? <CheckCircle2 size={12} /> : <Zap size={12} className="text-red-500" />}
                        {copying === 'selected' ? 'COPIED' : 'COPY SELECTED'}
                      </button>
                    )}
                    <button 
                      onClick={() => handleCopy(result.allTagsCopied, 'all')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-600/10"
                    >
                      {copying === 'all' ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                      {copying === 'all' ? 'COPIED' : 'COPY ALL TAGS'}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 w-16">
                          <div className="flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                              checked={result.tags.length > 0 && selectedTags.length === result.tags.length}
                              onChange={toggleSelectAll}
                            />
                          </div>
                        </th>
                        <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Tag Identity</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Protocol</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Relevancy</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Strategic Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.tags.map((tag, idx) => (
                        <tr 
                          key={idx} 
                          onClick={() => toggleTagSelection(tag.original)}
                          className={`hover:bg-red-50/30 transition-colors cursor-pointer group ${selectedTags.includes(tag.original) ? 'bg-red-50/50' : ''}`}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                                checked={selectedTags.includes(tag.original)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleTagSelection(tag.original);
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold tracking-tight ${tag.isRedundant ? 'text-slate-300 line-through' : 'text-slate-800'}`}>{tag.original}</span>
                              <div className="flex items-center gap-2 mt-1.5">
                                {tag.isBrandTag && <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black tracking-tighter">BRAND</span>}
                                {tag.isRedundant && <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black tracking-tighter uppercase">REDUNDANT</span>}
                                <span className="text-[8px] text-slate-400 font-mono italic uppercase tracking-tighter">{tag.charCount}B // {tag.wordCount}W</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{tag.type}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col items-center">
                              <span className={`text-xs font-black ${getScoreColor(tag.relevanceScore)} mb-1.5`}>{tag.relevanceScore}%</span>
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${tag.relevanceScore}%` }}
                                  className={`h-full ${getScoreColor(tag.relevanceScore).replace('text-', 'bg-')}`} 
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex flex-col items-end">
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded border ${getBadgeColor(tag.strength)} shadow-sm`}>
                                {tag.strength.toUpperCase()}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono mt-2 uppercase tracking-tighter opacity-60">SIG_VECTOR: {tag.strengthScore.toFixed(0)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* THREE COLUMN GRID: Strategy, Priority, Deleted Tags */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 1. Strategy Composition Vector */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-red-500" />
                    <h4 className="text-[10px] font-black text-black uppercase tracking-[0.2em] font-lora">Strategy Composition</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold text-black uppercase tracking-tighter">
                        <span>Cluster Distribution</span>
                        <span>{result.tags.length} DATAPOINTS</span>
                      </div>
                      <div className="flex h-6 gap-1 rounded-sm overflow-hidden bg-slate-50 p-1">
                        {['Broad', 'Medium', 'Targeted', 'Long-tail', 'Hyper-specific'].map((type, i) => {
                          const count = result.tags.filter(t => t.type === type).length;
                          const pct = (count / result.tags.length) * 100;
                          const colors = ['bg-red-200', 'bg-red-300', 'bg-red-400', 'bg-red-500', 'bg-red-600'];
                          return pct > 0 ? (
                            <div key={type} className={`${colors[i]} h-full rounded shadow-sm`} style={{ width: `${pct}%` }} title={`${type}: ${count}`} />
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Relevance</p>
                        <p className="text-xl font-black text-red-600">{result.avgRelevanceScore}%</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Budget Efficiency</p>
                        <p className="text-xl font-black text-slate-800">{result.charBudgetPercent}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Priority Optimization */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 bg-red-600 text-white border-b border-red-700 flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] font-lora">Optimization protocols</h4>
                    <TrendingUp size={14} />
                  </div>
                  <div className="p-5 space-y-4 flex-1">
                    {result.actionItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-start group">
                        <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${item.priority === 'Critical' ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]' : 'bg-amber-500'}`} />
                        <div>
                          <p className="text-xs font-black text-slate-800 leading-tight uppercase tracking-tight group-hover:text-red-600 transition-colors">{item.action}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-70">Impact Vector: {item.impact}</p>
                        </div>
                      </div>
                    ))}
                    {result.actionItems.length === 0 && (
                      <p className="text-center py-8 text-[10px] uppercase font-black text-slate-300 italic tracking-widest">Metadata Fully Optimized</p>
                    )}
                  </div>
                </div>

                {/* 3. Deleted Tags (Redundant/Weak) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 bg-slate-900 text-white border-b border-black flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] font-lora">Proposed Deletions</h4>
                    <span className="text-[10px] font-black bg-red-600 px-2 py-0.5 rounded text-white shadow-lg shadow-red-600/20">{result.deletedTags.length}</span>
                  </div>
                  <div className="p-5 flex flex-wrap gap-2.5 flex-1 content-start">
                    {result.deletedTags.map((tag, idx) => (
                      <div key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-400 line-through decoration-red-500/50 hover:border-red-200 transition-colors">
                        {tag}
                      </div>
                    ))}
                    {result.deletedTags.length === 0 && (
                      <div className="w-full py-8 text-center text-[10px] uppercase font-black text-slate-300 italic tracking-widest">
                        Zero redundancy detected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-8">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
            TAGINTEL_CORE_V5.0 // STRATEGIC_MODE_DEPLOYED
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_5px_rgba(220,38,38,0.8)]"></div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocol Secured</span>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ef4444;
        }
      `}</style>
    </div>
  );
}
