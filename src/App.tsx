import React, { useState, useRef } from 'react';
import { 
  Wand2, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Store, 
  Code2, 
  BookOpen, 
  ChevronRight,
  Loader2,
  AlertCircle,
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateWooCommercePlugin, type PluginResponse } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TEMPLATES = [
  { id: 'checkout-field', label: 'Add Checkout Field', prompt: 'Add a custom "How did you hear about us?" field to the WooCommerce checkout page and save it to the order metadata.' },
  { id: 'cart-text', label: 'Change Cart Text', prompt: 'Change the "Add to Cart" button text to "Buy Now" for all products in the "Electronics" category.' },
  { id: 'min-order', label: 'Minimum Order Amount', prompt: 'Set a minimum order amount of $50 for the checkout process. Show an error message if the cart total is lower.' },
  { id: 'custom-tab', label: 'Product Custom Tab', prompt: 'Add a custom "Shipping Info" tab to the product single page with static content.' },
];

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PluginResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await generateWooCommercePlugin(activePrompt);
      setResult(data);
      // Scroll to result
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.pluginName.toLowerCase().replace(/\s+/g, '-')}.php`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Store size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">WooGenie</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-500">
            <a href="#" className="hover:text-emerald-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Best Practices</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
              <Github size={16} />
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Input & Templates */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-[1.1]">
                Build WooCommerce <span className="text-emerald-600">Magic</span> in seconds.
              </h1>
              <p className="text-lg text-stone-600 leading-relaxed">
                Describe the feature you want to add to your store, and our AI will generate a production-ready WordPress plugin for you.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Add a custom field to the checkout page..."
                  className="w-full h-40 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none text-stone-800 placeholder:text-stone-400"
                />
                <div className="absolute bottom-3 right-3">
                  <button
                    onClick={() => handleGenerate()}
                    disabled={loading || !prompt.trim()}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-emerald-200 active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                    Generate
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Popular Templates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setPrompt(t.prompt);
                      handleGenerate(t.prompt);
                    }}
                    className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group text-left"
                  >
                    <span className="text-sm font-medium text-stone-700">{t.label}</span>
                    <ChevronRight size={16} className="text-stone-300 group-hover:text-emerald-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Result */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                  ref={scrollRef}
                >
                  <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                          <Code2 size={20} />
                        </div>
                        <div>
                          <h2 className="font-bold text-lg text-stone-900">{result.pluginName}</h2>
                          <p className="text-sm text-stone-500">{result.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopy}
                          className="p-2 hover:bg-stone-200 rounded-lg transition-colors text-stone-600 relative"
                          title="Copy Code"
                        >
                          {copied ? <Check size={20} className="text-emerald-600" /> : <Copy size={20} />}
                        </button>
                        <button
                          onClick={handleDownload}
                          className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download size={16} />
                          Download .php
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-[600px] overflow-auto bg-[#1a1b26]">
                      <SyntaxHighlighter
                        language="php"
                        style={atomDark}
                        customStyle={{
                          margin: 0,
                          padding: '1.5rem',
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          background: 'transparent',
                        }}
                      >
                        {result.code}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <BookOpen size={20} />
                      <h3>How to install</h3>
                    </div>
                    <ul className="space-y-3">
                      {result.installationSteps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-emerald-900/80 leading-relaxed">
                          <span className="flex-shrink-0 w-5 h-5 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50/50"
                >
                  <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-300 mb-6">
                    <Terminal size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">Ready to code</h3>
                  <p className="text-stone-500 max-w-sm">
                    Your generated plugin will appear here. Try one of the templates or enter your own request.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-stone-400">
            <Store size={16} />
            <span className="text-sm font-medium">© 2026 WooGenie. Built for WooCommerce developers.</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-stone-500">
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
