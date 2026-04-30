import { useState } from 'react';
import { LayoutGrid, TrendingUp, Sparkles, Send, Copy, RefreshCcw, Languages, AlignLeft, Hash, Check, ExternalLink, Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService, TransformationResult } from './services/geminiService';

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransformationResult | null>(null);
  const [keywords, setKeywords] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Character counter for Twitter
  const charCount = result?.text.length || 0;
  const isOverLimit = charCount > 280;

  const handleTransform = async (mode: 'translate' | 'summarize' | 'enhance') => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const data = await geminiService.transformContent(input, mode);
      setResult(data);
      // Scroll to result on mobile
      if (window.innerWidth < 768) {
        document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = async () => {
    if (!keywords.trim()) return;
    setSuggestLoading(true);
    try {
      const data = await geminiService.suggestTweetsBrief(keywords);
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSuggestLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openTwitter = () => {
    if (!result) return;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(result.text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center shadow-lg">
            <LayoutGrid className="text-white size-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">Scoreline AI Studio</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500">
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className={`fixed md:relative z-40 w-80 h-full bg-white border-r border-slate-200 p-6 flex flex-col gap-8 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          >
            <div className="hidden md:flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center shadow-md">
                <LayoutGrid className="text-white size-5" />
              </div>
              <h1 className="font-display font-bold text-2xl gradient-text-navy tracking-tighter">Scoreline AI Studio</h1>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-400 flex items-center gap-2">
                  <TrendingUp size={12} className="text-brand-primary" /> İÇERİK FİKİRLERİ
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Maç, takım veya oyuncu..."
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-slate-900 placeholder:text-slate-400"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSuggest()}
                  />
                  <button 
                    onClick={handleSuggest}
                    disabled={suggestLoading}
                    className="w-full bg-[#0F172A] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
                  >
                    {suggestLoading ? <RefreshCcw className="animate-spin size-4" /> : <Sparkles size={14} />}
                    FİKİR OLUŞTUR
                  </button>
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar max-h-[60vh]">
                <AnimatePresence>
                  {suggestions.map((suggestion, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => { setInput(suggestion); setSidebarOpen(false); }}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm cursor-pointer group transition-all"
                    >
                      <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed italic mb-2">"{suggestion}"</p>
                      <div className="flex items-center gap-1 text-[10px] text-brand-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                        DÜZENLE <ChevronRight size={10} />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
               <div className="flex items-center gap-3">
                 <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Scoreline AI v4.0</span>
               </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative no-scrollbar">
        <div className="max-w-6xl mx-auto w-full p-6 md:p-12 space-y-12 pb-32">
          
          <header className="space-y-4">
            <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-700 uppercase tracking-[0.2em]"
            >
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Profesyonel Medya Asistanı
            </motion.div>
            <div className="max-w-2xl space-y-4">
              <p className="text-lg md:text-xl font-medium leading-relaxed text-slate-600">
                Scoreline AI Studio, spor medyası profesyonelleri ve dijital içerik üreticileri için tasarlanmış gelişmiş bir yapay zeka asistanıdır. Yabancı dildeki kaynakları anlık olarak Türkçeye çevirir, karmaşık haberleri etkileyici tweetlere dönüştürür ve spor dünyasının dinamik diline uygun içerikler üretmenizi sağlar.
              </p>
              <p className="text-sm text-slate-400 leading-relaxed font-normal">
                Sadece metninizi yapıştırın veya anahtar kelimelerinizi girin; sistemimiz Twitter algoritmasına tam uyumlu, etkileşim odaklı ve profesyonel içerikleri saniyeler içinde sizin için optimize etsin.
              </p>
            </div>
          </header>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Editor Side */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-display uppercase tracking-[0.3em] text-slate-400">Ana Taslak</h3>
              </div>

              <div className="space-y-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="İçeriği buraya yapıştırın veya yazmaya başlayın..."
                  className="w-full h-[350px] bg-white border border-slate-200 p-8 rounded-[32px] focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-xl font-medium leading-loose placeholder:text-slate-300 selection:bg-brand-primary/10 caret-brand-primary overflow-y-auto"
                />
                
                <div className="flex flex-wrap gap-3">
                   <button 
                    onClick={() => handleTransform('translate')}
                    disabled={loading || !input}
                    className="flex-1 min-w-[140px] px-6 py-4 bg-[#0F172A] text-white rounded-2xl flex items-center justify-center gap-3 text-xs font-black shadow-lg hover:bg-black active:scale-[0.98] transition-all disabled:opacity-30"
                   >
                     <Languages size={16} className="text-emerald-400" /> ÇEVİRİ VE UYARLAMA
                   </button>
                   <button 
                    onClick={() => handleTransform('summarize')}
                    disabled={loading || !input}
                    className="flex-1 min-w-[140px] px-6 py-4 bg-white border border-slate-200 text-[#0F172A] rounded-2xl flex items-center justify-center gap-3 text-xs font-black hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-30 shadow-sm"
                   >
                     <AlignLeft size={16} className="text-brand-primary" /> ÖZETLEYİCİ
                   </button>
                </div>
              </div>
            </div>

            {/* Preview Side */}
            <div id="result-area" className="lg:col-span-12 xl:col-span-5 space-y-6">
              <h3 className="text-xs font-bold font-display uppercase tracking-[0.3em] text-slate-400">X Önizleme</h3>
              
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="w-full h-[350px] flex flex-col items-center justify-center bg-white rounded-[32px] border border-slate-200"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary animate-pulse" />
                    </div>
                    <p className="mt-6 font-display font-bold text-sm tracking-widest text-[#0F172A]">AI ANALİZ EDİYOR...</p>
                  </motion.div>
                ) : result ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    className="w-full min-h-[350px] bg-white text-black p-10 rounded-[32px] flex flex-col justify-between premium-shadow-lg border border-slate-200"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                          <LayoutGrid size={20} className="text-[#0F172A]" />
                        </div>
                        <div>
                          <div className="font-bold text-lg leading-none">Scoreline Pro</div>
                          <div className="text-xs text-slate-400 font-medium">@scoreline_hq</div>
                        </div>
                      </div>

                      <p className="text-2xl font-bold leading-snug tracking-tight text-[#0F172A]">
                        {result.text}
                      </p>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                         <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${isOverLimit ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                           {charCount} / 280 KARAKTER
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={copyToClipboard}
                          className="flex items-center justify-center gap-3 py-4 bg-slate-50 text-[#0F172A] rounded-2xl text-[10px] font-black hover:bg-slate-100 transition-all active:scale-95 border border-slate-200"
                        >
                          {copied ? <Check size={14} className="text-brand-primary" /> : <Copy size={16} />}
                          KOPYALA
                        </button>
                        <button 
                          onClick={openTwitter}
                          className="flex items-center justify-center gap-3 py-4 bg-[#0F172A] text-white rounded-2xl text-[10px] font-black hover:bg-black transition-all active:scale-95 shadow-md"
                        >
                          <ExternalLink size={16} className="text-emerald-400" /> PAYLAŞ
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-full h-[350px] flex flex-col items-center justify-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 p-12 text-center group">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                      <Send size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-400 mb-2 tracking-[0.2em] uppercase">Hazırda Bekliyor</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-[200px] italic">
                      Lütfen soldaki alana bir metin girerek analizi başlatın.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Action Mobile Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#0F172A] text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-transform active:scale-90"
      >
        <Sparkles size={24} className="text-emerald-400" />
      </button>

    </div>
  );
}
