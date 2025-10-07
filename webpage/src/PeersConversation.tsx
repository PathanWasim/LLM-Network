import React, { useEffect, useState } from 'react';
import { getPeerConversations, Conversation } from './api/llm';
import { Bot, Network, Users, Clock, Server, Wifi, WifiOff, User, Activity, Globe, Shield, Zap, Brain, Cpu, Layers, MessageCircle } from 'lucide-react';
import { ParticleBackground } from './components/ParticleBackground';
import { NetworkVisualization } from './components/NetworkVisualization';

export function PeersConversation({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [peerConversations, setPeerConversations] = useState<Record<string, Conversation>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeerConversations = async () => {
      try {
        setLoading(true);
        const conversations = await getPeerConversations();
        console.log('Received peer conversations:', conversations); // Debug log
        setPeerConversations(conversations);
        setError(null);

        // If we have conversations and no peer is selected, select the first one
        const peerIps = Object.keys(conversations);
        if (peerIps.length > 0 && !selectedPeer) {
          setSelectedPeer(peerIps[0]);
        }
      } catch (err) {
        console.error('Error loading peer conversations:', err);
        setError('Failed to load peer conversations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPeerConversations();
    // Refresh every 5 seconds
    const interval = setInterval(fetchPeerConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const peerIps = Object.keys(peerConversations);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <ParticleBackground />

      {/* Enhanced Header */}
      <div className="sticky top-0 border-b border-gray-700/50 glass shadow-2xl p-6 relative z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onNavigate && (
                <button
                  onClick={() => onNavigate('chat')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Back to Chat</span>
                </button>
              )}
              <div className="relative neural-node">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl neural-glow">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-gray-900"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  NeuroMesh Dashboard
                </h1>
                <p className="text-xs text-gray-400">Neural mesh monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400 font-medium">Active</span>
            </div>
          </div>


        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {loading && peerIps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-gray-400">Scanning network for peers...</p>
          </div>
        ) : error ? (
          <div className="text-center bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <div className="text-red-400 text-lg font-semibold mb-2">Connection Error</div>
            <p className="text-red-300">{error}</p>
          </div>
        ) : peerIps.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Peers Connected</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              No peer conversations are currently available. Make sure other nodes are online and connected to the network.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Enhanced Network Visualization */}
            <NetworkVisualization
              peerCount={peerIps.length}
              llmHosts={Object.values(peerConversations).filter(p => p.host_info.is_llm_host).length}
              totalMessages={Object.values(peerConversations).reduce((total, conv) => total + conv.messages.length, 0)}
            />

            {/* Enhanced Peer Selection */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-cyan-400" />
                <h3 className="text-2xl font-bold gradient-text">Connected Neural Nodes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {peerIps.map((ip, index) => {
                  const peer = peerConversations[ip];
                  return (
                    <button
                      key={ip}
                      onClick={() => setSelectedPeer(ip)}
                      className={`group p-6 rounded-2xl border transition-all duration-300 text-left hover:scale-105 slide-in-up ${selectedPeer === ip
                        ? 'glass border-cyan-500/50 shadow-2xl glow-animation'
                        : 'glass border-gray-700/50 hover:border-gray-600/50'
                        }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full animate-pulse ${peer.host_info.is_llm_host ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          <span className="font-mono text-lg font-bold text-cyan-400">{ip}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {peer.host_info.is_llm_host ? (
                            <div className="flex items-center gap-1">
                              <Wifi className="w-5 h-5 text-green-400" />
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                          ) : (
                            <WifiOff className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 font-medium">{peer.host_info.hostname}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-gray-400">{peer.messages.length} messages</span>
                          </div>
                          {peer.host_info.is_llm_host && (
                            <div className="px-2 py-1 bg-green-500/20 rounded-full">
                              <span className="text-xs text-green-400 font-medium">AI Host</span>
                            </div>
                          )}
                        </div>

                        {/* Connection strength indicator */}
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${peer.host_info.is_llm_host
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 w-full'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 w-3/4'
                            }`}></div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Peer's Conversation */}
            {selectedPeer && peerConversations[selectedPeer] && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <div className="mb-6 border-b border-gray-700/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-cyan-400 mb-2">
                        Peer: {selectedPeer}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Host: {peerConversations[selectedPeer].host_info.hostname}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {peerConversations[selectedPeer].host_info.is_llm_host ? (
                            <>
                              <Wifi className="w-4 h-4 text-green-400" />
                              <span className="text-green-400">LLM Available</span>
                            </>
                          ) : (
                            <>
                              <WifiOff className="w-4 h-4 text-gray-400" />
                              <span>No LLM</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {peerConversations[selectedPeer].messages.length}
                      </div>
                      <div className="text-xs text-gray-400">Messages</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {peerConversations[selectedPeer].messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-4 ${message.message_type === 'Question' ? 'flex-row-reverse' : ''
                        }`}
                    >
                      <div className={`flex-shrink-0 ${message.message_type === 'Question' ? 'order-2' : ''
                        }`}>
                        {message.message_type === "Response" ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className={`flex-1 max-w-2xl ${message.message_type === 'Question' ? 'order-1' : ''
                        }`}>
                        <div className={`p-3 rounded-xl ${message.message_type === 'Question'
                          ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 ml-8'
                          : 'bg-gray-700/50 border border-gray-600/50 mr-8'
                          }`}>
                          <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {new Date(message.timestamp).toLocaleString()}
                          </div>
                          <p className="text-white whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 