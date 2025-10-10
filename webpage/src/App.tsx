import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, MessageCircle, Zap, Cpu, Activity, Globe2, Shield, Layers, Copy, RotateCcw, Trash2 } from 'lucide-react';
import { sendMessageToLLM, getPeerConversations } from './api/llm';
import { PeersConversation } from './PeersConversation';
import { ParticleBackground } from './components/ParticleBackground';
import { Navigation } from './components/Navigation';

type Message = { role: 'user' | 'assistant'; content: string };

function ChatPage({
  conversation,
  setConversation,
  isTyping,
  setIsTyping,
  isConnected,
  setIsConnected
}: {
  conversation: Message[];
  setConversation: (messages: Message[]) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
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
      setIsConnected(true);
      setConversation([
        ...newConversation,
        { role: 'assistant' as const, content: response }
      ]);
    } catch (error) {
      console.error('Error getting LLM response:', error);
      setIsTyping(false);
      setIsConnected(false);
      setConversation([
        ...newConversation,
        { role: 'assistant' as const, content: 'Sorry, I encountered an error while processing your request. Please check your connection and try again.' }
      ]);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const regenerateResponse = async (messageIndex: number) => {
    if (messageIndex < 1 || isTyping) return;

    const userMessage = conversation[messageIndex - 1];
    if (userMessage.role !== 'user') return;

    setIsTyping(true);
    try {
      const response = await sendMessageToLLM(userMessage.content);
      setIsTyping(false);
      setIsConnected(true);

      const newConversation = [...conversation];
      newConversation[messageIndex] = { role: 'assistant', content: response };
      setConversation(newConversation);
    } catch (error) {
      console.error('Error regenerating response:', error);
      setIsTyping(false);
      setIsConnected(false);
    }
  };

  const clearConversation = () => {
    setConversation([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Action bar for chat-specific actions */}
      {conversation.length > 0 && (
        <div className="border-b border-gray-700/30 bg-gray-800/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MessageCircle className="w-3 h-3" />
                <span>{conversation.length} messages in conversation</span>
              </div>
              <button
                onClick={clearConversation}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-xs"
                title="Clear conversation"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
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
                    <MessageCircle className="w-6 h-6 text-cyan-400" />
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
                        <span className="text-lg font-bold text-white">U</span>
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
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-all duration-200 hover:text-cyan-400"
                        title="Copy message"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                      {message.role === 'assistant' && (
                        <>
                          <span className="text-xs opacity-30">•</span>
                          <button
                            onClick={() => regenerateResponse(index)}
                            disabled={isTyping}
                            className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-all duration-200 hover:text-purple-400 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Regenerate response"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Regenerate</span>
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
      <footer className="sticky bottom-0 w-full glass border-t border-gray-700/50 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            <div className="relative">
              {/* Input container */}
              <div className="relative flex items-center glass border border-gray-600/50 rounded-2xl shadow-2xl overflow-hidden focus-within:border-cyan-500/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything... Press Enter to send or Shift+Enter for new line"
                  className="w-full bg-transparent text-white px-6 py-4 pr-16 rounded-2xl focus:outline-none placeholder-gray-400 text-base relative z-10 resize-none min-h-[56px] max-h-32"
                  disabled={isTyping}
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '56px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                  }}
                />

                {/* Send button */}
                <button
                  type="submit"
                  disabled={isTyping || !inputValue.trim() || !isConnected}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl btn-hover-glow group"
                  title={!isConnected ? 'Disconnected - check your connection' : 'Send message'}
                >
                  <Send className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Connection status */}
              {!isConnected && (
                <div className="absolute -top-12 left-0 right-0 flex items-center justify-center">
                  <div className="glass px-4 py-2 rounded-full border border-red-500/30">
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <span>Connection lost - check your network</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick info */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span className="hidden sm:inline">AI Model: Neural LLM</span>
                  <span className="sm:hidden">Neural AI</span>
                </div>
                <div className="hidden md:flex items-center gap-1">
                  <Globe2 className="w-3 h-3" />
                  <span>Response Time: ~2s</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {inputValue.length > 0 && `${inputValue.length} chars`}
                </span>
                {inputValue.length > 0 && (
                  <button
                    type="button"
                    className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                    onClick={() => setInputValue('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('chat');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [peerCount, setPeerCount] = useState(0);

  // Check peer count periodically
  useEffect(() => {
    const checkPeers = async () => {
      try {
        const peers = await getPeerConversations();
        setPeerCount(Object.keys(peers).length);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to fetch peers:', error);
        setIsConnected(false);
      }
    };

    checkPeers();
    const interval = setInterval(checkPeers, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <ParticleBackground />

      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isConnected={isConnected}
        peerCount={peerCount}
      />

      <main className="relative z-10">
        {currentPage === 'chat' ? (
          <ChatPage
            conversation={conversation}
            setConversation={setConversation}
            isTyping={isTyping}
            setIsTyping={setIsTyping}
            isConnected={isConnected}
            setIsConnected={setIsConnected}
          />
        ) : (
          <PeersConversation />
        )}
      </main>
    </div>
  );
}

export default App;