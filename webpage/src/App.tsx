import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Bot, Users, Sparkles, MessageCircle, Zap, Cpu, Activity, Globe2, Shield, Layers, Workflow } from 'lucide-react';
import { sendMessageToLLM } from './api/llm';
import { PeersConversation } from './PeersConversation';
import { ParticleBackground } from './components/ParticleBackground';

type Message = { role: 'user' | 'assistant'; content: string };

function ChatPage({
  onNavigate,
  conversation,
  setConversation,
  isTyping,
  setIsTyping
}: {
  onNavigate: (page: string) => void;
  conversation: Message[];
  setConversation: (messages: Message[]) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isTyping) return;

    const newMessage = { role: 'user' as const, content: inputValue };
    const newConversation = [...conversation, newMessage];

    setConversation(newConversation);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await sendMessageToLLM(inputValue);
      setIsTyping(false);
      setConversation([
        ...newConversation,
        { role: 'assistant' as const, content: response }
      ]);
    } catch (error) {
      console.error('Error getting LLM response:', error);
      setIsTyping(false);
      setConversation([
        ...newConversation,
        { role: 'assistant' as const, content: 'Sorry, I encountered an error while processing your request.' }
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col relative overflow-hidden">
      <ParticleBackground />

      {/* Enhanced Header with more visual elements */}
      <div className="sticky top-0 border-b border-gray-700/50 glass shadow-2xl p-4 relative z-50">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative neural-node">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg neural-glow">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-gray-900"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text typewriter">
                NeuroMesh
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Workflow className="w-3 h-3 text-cyan-400" />
                <p className="text-xs text-gray-400">Neural Intelligence Mesh • Real-time Neural Sync</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <div className="glass px-3 py-2 rounded-full">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-cyan-400 font-medium">AI Ready</span>
                </div>
              </div>
              <div className="glass px-3 py-2 rounded-full">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('peers')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl btn-hover-glow"
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Neural Mesh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 mb-24">
          {conversation.length === 0 ? (
            <div className="mt-16 text-center slide-in-up">
              <div className="mb-12">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl float-animation">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-3xl blur-xl"></div>
                </div>
                <h2 className="text-4xl font-bold gradient-text mb-4">Welcome to NeuroMesh</h2>
                <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
                  Experience the future of neural mesh intelligence. Connect with neural nodes across the mesh
                  and harness the power of distributed neural processing for unprecedented AI capabilities.
                </p>
              </div>

              {/* Enhanced feature cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
                <div className="glass p-6 rounded-2xl group hover:scale-105 transition-all duration-300 slide-in-up" style={{ animationDelay: '0.1s' }}>
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:glow-animation">
                    <Brain className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">Neural Conversations</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Engage with advanced neural models using natural language processing</p>
                </div>

                <div className="glass p-6 rounded-2xl group hover:scale-105 transition-all duration-300 slide-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:glow-animation">
                    <Layers className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">Neural Mesh</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Connect with distributed neural nodes for enhanced AI capabilities</p>
                </div>

                <div className="glass p-6 rounded-2xl group hover:scale-105 transition-all duration-300 slide-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:glow-animation">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">Neural Sync</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Instant neural response sharing and mesh synchronization</p>
                </div>

                <div className="glass p-6 rounded-2xl group hover:scale-105 transition-all duration-300 slide-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:glow-animation">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">Neural Security</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">End-to-end encrypted neural communication with mesh authentication</p>
                </div>
              </div>

              {/* Quick start suggestions */}
              <div className="max-w-2xl mx-auto">
                <p className="text-gray-400 mb-4">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "What is neural mesh AI?",
                    "How does neural networking work?",
                    "Explain machine learning",
                    "Write a Python function"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(suggestion)}
                      className="px-4 py-2 glass rounded-full text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            conversation.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${message.role === 'user' ? 'flex-row-reverse message-user' : 'message-assistant'
                  }`}
              >
                <div className={`flex-shrink-0 ${message.role === 'user' ? 'order-2' : ''
                  }`}>
                  {message.role === "assistant" ? (
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-2xl blur opacity-75"></div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <span className="text-lg font-bold text-white">W</span>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-2xl blur opacity-75"></div>
                    </div>
                  )}
                </div>
                <div className={`flex-1 max-w-4xl ${message.role === 'user' ? 'order-1' : ''
                  }`}>
                  <div className={`p-5 rounded-2xl shadow-xl relative ${message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white ml-16 border border-purple-400/30'
                    : 'glass text-white mr-16 border border-gray-600/30'
                    }`}>
                    {/* Message timestamp */}
                    <div className="text-xs opacity-60 mb-2">
                      {new Date().toLocaleTimeString()}
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-base">{message.content}</p>

                    {/* Message actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                      <button className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                        Copy
                      </button>
                      {message.role === 'assistant' && (
                        <>
                          <span className="text-xs opacity-30">•</span>
                          <button className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                            Regenerate
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex items-start gap-4 message-assistant">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-2xl blur opacity-75"></div>
              </div>
              <div className="flex-1 max-w-4xl mr-16">
                <div className="p-5 rounded-2xl glass border border-gray-600/30 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span className="text-gray-300 text-sm font-medium">AI is processing your request...</span>
                    </div>
                  </div>
                  <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shimmer-animation"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Area */}
      <div className="sticky bottom-0 w-full glass border-t border-gray-700/50 py-6 relative z-10">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="max-w-5xl mx-auto px-4">
          <div className="relative">
            {/* Input container */}
            <div className="relative flex items-center glass border border-gray-600/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything... Press Enter to send or Shift+Enter for new line"
                className="w-full bg-transparent text-white px-6 py-5 pr-20 rounded-2xl focus:outline-none placeholder-gray-400 text-base relative z-10"
                disabled={isTyping}
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={isTyping || !inputValue.trim()}
                className="absolute right-3 h-12 w-12 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl btn-hover-glow group"
              >
                <Send className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Input suggestions */}
            {inputValue === '' && !isTyping && (
              <div className="absolute -top-16 left-0 right-0 flex items-center justify-center">
                <div className="glass px-4 py-2 rounded-full">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Globe2 className="w-3 h-3" />
                    <span>Connected to NeuroMesh Network</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Activity className="w-3 h-3" />
              <span>AI Model: Qwen3-8B</span>
              <span>•</span>
              <span>Response Time: ~2s</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                onClick={() => setInputValue('')}
              >
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('chat');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  return (
    <div>
      {currentPage === 'chat' ? (
        <ChatPage
          onNavigate={setCurrentPage}
          conversation={conversation}
          setConversation={setConversation}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
        />
      ) : (
        <PeersConversation onNavigate={setCurrentPage} />
      )}
    </div>
  );
}

export default App;