/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  ChevronRight,
  RefreshCw,
  MessageSquare,
  Award,
  Globe
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Message, Role, InterviewState, Language } from './types';
import { chatWithZuenna } from './services/zuennaService';

const WELCOME_MESSAGES = {
  English: "Welcome to Hands of Mothers Rwanda. I am DOP Zuenna, and I will guide you through this interview.",
  French: "Bienvenue à Hands of Mothers Rwanda. Je suis DOP Zuenna, et je vous guiderai tout au long de cet entretien."
};

const START_PROMPTS = {
  English: (role: string) => `You've applied for the **${role}** position. Let's begin the interview. To start, could you tell me a little bit about yourself and your interest in this role?`,
  French: (role: string) => `Vous avez postulé pour le poste de **${role}**. Commençons l'entretien. Pour commencer, pourriez-vous m'en dire un peu plus sur vous et votre intérêt pour ce poste ?`
};

export default function App() {
  const [state, setState] = useState<InterviewState>({
    step: 'welcome',
    selectedRole: null,
    selectedLanguage: null,
    messages: [],
    isThinking: false
  });
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, state.isThinking]);

  const handleStart = () => {
    setState(prev => ({ ...prev, step: 'language_selection' }));
  };

  const handleLanguageSelect = (language: Language) => {
    setState(prev => ({ 
      ...prev, 
      selectedLanguage: language,
      step: 'role_selection' 
    }));
  };

  const handleRoleSelect = (role: Role) => {
    const lang = state.selectedLanguage || 'English';
    const welcome = WELCOME_MESSAGES[lang];
    const prompt = START_PROMPTS[lang](role);
    
    const firstMsg: Message = {
      role: 'assistant',
      content: `${welcome}\n\n${prompt}`,
      timestamp: Date.now()
    };
    setState(prev => ({
      ...prev,
      step: 'interviewing',
      selectedRole: role,
      messages: [firstMsg]
    }));
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || state.isThinking || !state.selectedRole || !state.selectedLanguage) return;

    const userMsg: Message = {
      role: 'user',
      content: inputText,
      timestamp: Date.now()
    };

    const newMessages = [...state.messages, userMsg];
    
    setState(prev => ({
      ...prev,
      messages: newMessages,
      isThinking: true
    }));
    setInputText('');

    const responseContent = await chatWithZuenna(newMessages, state.selectedRole, state.selectedLanguage);
    
    const assistantMsg: Message = {
      role: 'assistant',
      content: responseContent,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, assistantMsg],
      isThinking: false
    }));
  };

  const resetInterview = () => {
    setState({
      step: 'welcome',
      selectedRole: null,
      selectedLanguage: null,
      messages: [],
      isThinking: false
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-[#E2D1C3]">
      <div className="max-w-4xl mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 border-b border-[#E2D1C3] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white font-serif italic text-xl">
              H
            </div>
            <div>
              <h1 className="font-serif text-xl font-medium tracking-tight">Hands of Mothers Rwanda</h1>
              <p className="text-xs uppercase tracking-widest text-[#5A5A40]/70 font-semibold">Recruitment Portal</p>
            </div>
          </div>
          {state.step !== 'welcome' && (
            <button 
              onClick={resetInterview}
              className="flex items-center gap-2 text-sm text-[#5A5A40] hover:text-[#3E3E2B] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </header>

        <main className="flex-1 overflow-hidden flex flex-col relative bg-white rounded-3xl border border-[#E2D1C3] shadow-[0_4px_24px_rgba(90,90,64,0.04)]">
          <AnimatePresence mode="wait">
            {state.step === 'welcome' && (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-24 h-24 bg-[#E2D1C3] rounded-full flex items-center justify-center mb-8">
                  <Users className="w-12 h-12 text-[#5A5A40]" />
                </div>
                <h2 className="font-serif text-4xl mb-4 text-[#1A1A1A]">Welcome to DOP Zuenna's Interview Room</h2>
                <p className="text-[#5A5A40] max-w-md mb-10 leading-relaxed italic">
                  "At Hands of Mothers Rwanda, we believe in the power of community, integrity, and shared purpose. I'm looking forward to learning about your unique story."
                </p>
                <button 
                  onClick={handleStart}
                  className="group flex items-center gap-3 bg-[#5A5A40] text-white px-8 py-4 rounded-full font-medium hover:bg-[#3E3E2B] transition-all hover:scale-105"
                >
                  <span>Start Interview</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {state.step === 'language_selection' && (
              <motion.div 
                key="language"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <Globe className="w-12 h-12 text-[#5A5A40] mb-6" />
                <h2 className="font-serif text-3xl mb-8 text-[#1A1A1A]">Choose your language / Choisissez votre langue</h2>
                <div className="flex gap-6">
                  <button 
                    onClick={() => handleLanguageSelect('English')}
                    className="px-10 py-5 bg-white border-2 border-[#E2D1C3] rounded-2xl hover:border-[#5A5A40] hover:bg-[#FDFBF7] transition-all font-serif text-xl cursor-all"
                  >
                    English
                  </button>
                  <button 
                    onClick={() => handleLanguageSelect('French')}
                    className="px-10 py-5 bg-white border-2 border-[#E2D1C3] rounded-2xl hover:border-[#5A5A40] hover:bg-[#FDFBF7] transition-all font-serif text-xl cursor-all"
                  >
                    Français
                  </button>
                </div>
              </motion.div>
            )}

            {state.step === 'role_selection' && (
              <motion.div 
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col items-center justify-center p-8"
              >
                <h2 className="font-serif text-3xl mb-8 text-[#1A1A1A]">
                  {state.selectedLanguage === 'English' ? 'Select your application path' : 'Choisissez votre voie de candidature'}
                </h2>
                <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
                  <RoleCard 
                    title={state.selectedLanguage === 'English' ? 'Finance Officer' : 'Responsable Financier'} 
                    icon={<Award className="w-6 h-6" />}
                    description={state.selectedLanguage === 'English' 
                      ? "Shape our financial future and ensure every resource reaches those who need it most."
                      : "Façonnez notre avenir financier et assurez-vous que chaque ressource parvienne à ceux qui en ont le plus besoin."
                    }
                    onClick={() => handleRoleSelect('Finance Officer')}
                    cta={state.selectedLanguage === 'English' ? 'Apply Now' : 'Postuler maintenant'}
                  />
                  <RoleCard 
                    title={state.selectedLanguage === 'English' ? 'Content Creator' : 'Créateur de Contenu'} 
                    icon={<MessageSquare className="w-6 h-6" />}
                    description={state.selectedLanguage === 'English'
                      ? "Tell our stories, build our community, and share our impact with the world."
                      : "Racontez nos histoires, bâtissez notre communauté et partagez notre impact avec le monde entier."
                    }
                    onClick={() => handleRoleSelect('Content Creator')}
                    cta={state.selectedLanguage === 'English' ? 'Apply Now' : 'Postuler maintenant'}
                  />
                </div>
              </motion.div>
            )}

            {state.step === 'interviewing' && (
              <motion.div 
                key="interview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col h-full bg-[#FAFAF8]"
              >
                {/* Chat content */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6"
                >
                  {state.messages.map((msg, i) => (
                    <motion.div
                      key={msg.timestamp + i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                        msg.role === 'user' 
                          ? 'bg-[#5A5A40] text-white rounded-tr-none' 
                          : 'bg-white border border-[#E2D1C3] text-[#1A1A1A] rounded-tl-none shadow-sm'
                      }`}>
                        {msg.role === 'assistant' && (
                          <p className="text-[10px] uppercase tracking-wider font-bold text-[#5A5A40] mb-2">DOP Zuenna</p>
                        )}
                        <div className="prose prose-sm prose-stone">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {state.isThinking && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-[#E2D1C3] rounded-2xl rounded-tl-none px-5 py-4 shadow-sm italic text-gray-400 text-sm">
                        {state.selectedLanguage === 'English' ? 'Zuenna is writing...' : 'Zuenna écrit...'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input area */}
                <div className="p-4 bg-white border-t border-[#E2D1C3]">
                  <form 
                    onSubmit={handleSendMessage}
                    className="flex gap-3 max-w-3xl mx-auto"
                  >
                    <input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={state.selectedLanguage === 'English' ? "Type your response..." : "Écrivez votre réponse..."}
                      disabled={state.isThinking}
                      className="flex-1 bg-[#FDFBF7] border border-[#E2D1C3] rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all text-[#1A1A1A]"
                    />
                    <button 
                      type="submit"
                      disabled={!inputText.trim() || state.isThinking}
                      className="bg-[#5A5A40] text-white p-3 rounded-full hover:bg-[#3E3E2B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                  <p className="text-center text-[10px] text-[#5A5A40]/40 mt-2 uppercase tracking-wide">
                    {state.selectedLanguage === 'English' 
                      ? `Interview in progress for ${state.selectedRole}`
                      : `Entretien en cours pour ${state.selectedRole === 'Finance Officer' ? 'Responsable Financier' : 'Créateur de Contenu'}`
                    }
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-6 flex items-center justify-between text-[#5A5A40]/60 text-xs">
          <p>© 2026 Hands of Mothers Rwanda</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Secure Interface</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> AI Assisted</span>
          </div>
        </footer>
      </div>

      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-2 bg-[#5A5A40]" />
      <div className="fixed -bottom-24 -left-24 w-64 h-64 bg-[#E2D1C3]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -top-24 -right-24 w-64 h-64 bg-[#5A5A40]/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

function RoleCard({ title, icon, description, onClick, cta }: { title: string, icon: React.ReactNode, description: string, onClick: () => void, cta: string }) {
  return (
    <button 
      onClick={onClick}
      className="text-left bg-white border border-[#E2D1C3] p-6 rounded-2xl hover:border-[#5A5A40] hover:shadow-lg transition-all group relative overflow-hidden"
    >
      <div className="w-12 h-12 bg-[#FDFBF7] rounded-xl flex items-center justify-center mb-4 text-[#5A5A40] group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="font-serif text-xl mb-2 text-[#1A1A1A]">{title}</h3>
      <p className="text-sm text-[#5A5A40]/70 leading-relaxed mb-4 min-h-[60px]">{description}</p>
      <div className="flex items-center gap-2 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
        <span>{cta}</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#E2D1C3]/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
    </button>
  );
}
