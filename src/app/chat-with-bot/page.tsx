'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import AuthPromptModal from '../components/AuthPromptModal';
import Loading from '../components/Loading';
import ThreeBackground from '../components/ThreeBackground';

const ChatWithBot: React.FC = () => {
  const searchParams = useSearchParams();
  const [apiEndpoint, setApiEndpoint] = useState<string>(
    searchParams.get('endpoint') ||
      'https://my-chatbot-factory.onrender.com/api/v1/chatbots/chat/chbt_ce8e8905d3da437983b02a9ceb51327d'
  );
  const [message, setMessage] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    const endpoint = searchParams.get('endpoint');
    if (endpoint) {
      setApiEndpoint(decodeURIComponent(endpoint));
    }
  }, [searchParams]);

  useEffect(() => {
    if (isSignedIn && apiEndpoint) {
      fetchConversations();
    }
  }, [isSignedIn, apiEndpoint]);

  const cleanApiLink = (apiLink: string): string => {
    const doubleApiV1 = '/api/v1/api/v1/';
    if (apiLink.includes(doubleApiV1)) {
      const index = apiLink.indexOf(doubleApiV1);
      return apiLink.slice(0, index + 7) + apiLink.slice(index + 14);
    }
    return apiLink;
  };

  const fetchConversations = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `/api/chatbot-conversations?apiEndpoint=${encodeURIComponent(cleanApiLink(apiEndpoint))}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log('Fetched chatbot conversations:', data);
      if (response.ok) {
        setChatHistory(data);
      } else {
        console.error('Failed to fetch conversations:', data.error);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setOutput('Error: Please enter a message.');
      setChatHistory((prev) => [...prev, { role: 'bot', content: 'Error: Please enter a message.' }]);
      return;
    }

    // Add user message to chat history
    const userMessage = message;
    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);
    setOutput('Sending...');
    setIsLoading(true);
    setMessage('');

    try {
      // Send message to chatbot API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      if (data.status !== 'success') {
        throw new Error(data.message || 'Chat failed');
      }

      const botResponse = data.data.response;
      setOutput(botResponse);
      setChatHistory((prev) => [...prev, { role: 'bot', content: botResponse }]);

      // Save conversation
      const clerkToken = await getToken();
      const conversation = {
        prompt: userMessage,
        response: botResponse,
        apiEndpoint: cleanApiLink(apiEndpoint),
      };
      const saveResponse = await fetch('/api/chatbot-conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify(conversation),
      });
      const saveData = await saveResponse.json();
      if (!saveResponse.ok) {
        console.error('Failed to save conversation:', saveData.error);
      } else {
        console.log('Conversation saved:', saveData);
      }
    } catch (error: any) {
      const errorMessage = `Error: ${error.message}`;
      setOutput(errorMessage);
      setChatHistory((prev) => [...prev, { role: 'bot', content: errorMessage }]);

      // Save error conversation
      const clerkToken = await getToken();
      const conversation = {
        prompt: userMessage,
        response: errorMessage,
        apiEndpoint: cleanApiLink(apiEndpoint),
      };
      const saveResponse = await fetch('/api/chatbot-conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify(conversation),
      });
      const saveData = await saveResponse.json();
      if (!saveResponse.ok) {
        console.error('Failed to save error conversation:', saveData.error);
      } else {
        console.log('Error conversation saved:', saveData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-blue-950 bg-opacity-10 text-gray-100 relative border-hud holographic-overlay font-['Orbitron']">
      <ThreeBackground />
      <div className="relative z-10">
        <img
          src="/images/hud-overlay.png"
          alt="Holographic HUD"
          className="absolute inset-0 opacity-20 pointer-events-none"
        />
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 flex flex-col mt-14 h-[calc(100vh-3.5rem)] overflow-x-hidden">
          <div className="mb-4 bg-gray-900/80 p-4 rounded-xl border-2 border-blue-500/50 shadow-[0_0_10px_rgba(96,165,250,0.3)]">
            <label htmlFor="apiEndpoint" className="block mb-1 text-blue-400 font-medium font-['Orbitron']">
              Chatbot API Endpoint:
            </label>
            <p className="text-sm text-gray-500 mb-2 font-mono">
              To use your chatbot, copy the part after{' '}
              <code className="bg-gray-800 px-1 py-0.5 rounded text-blue-300">chbt_</code> from the API link generated in
              the chat history (e.g.,{' '}
              <code className="bg-gray-800 px-1 py-0.5 rounded text-blue-300">ce8e8905d3da437983b02a9ceb51327d</code>) and
              replace it in the endpoint below.
            </p>
            <input
              type="text"
              id="apiEndpoint"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-blue-500/50 rounded-md font-mono text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500 disabled:bg-gray-900/50 animate-pulse-border"
              required
            />
          </div>

          <div className="flex-1 bg-gray-900/80 rounded-xl shadow-[0_0_20px_rgba(96,165,250,0.3)] border-2 border-blue-500/50 p-6 overflow-y-auto relative holographic-overlay break-words">
            <div className="absolute top-2 left-2 w-2 h-2 bg-blue-400 animate-blink"></div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 animate-blink delay-200"></div>
            <div className="p-3 border-b border-gray-800 bg-gray-800 rounded-t-xl">
              <h2 className="text-blue-400 font-medium font-['Orbitron']">Conversation</h2>
            </div>

            <div className="flex-1 p-4 space-y-4">
              {chatHistory.length > 0 ? (
                chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`bg-gray-800/50 border-l-4 p-4 rounded-r-md hover:bg-gray-700/50 transition-all animate-glow ${
                      msg.role === 'user' ? 'border-blue-600 ml-8' : 'border-cyan-400 mr-8'
                    }`}
                  >
                    <div className="font-medium mb-1 text-sm text-gray-400 font-mono">
                      {msg.role === 'user' ? 'You' : '🤖 Bot'}:
                    </div>
                    <div className="whitespace-pre-wrap break-words font-mono">{msg.content}</div>
                  </div>
                ))
              ) : (
                <div className="font-mono text-gray-500 italic flex items-center justify-center h-20 border-2 border-dashed border-blue-500/50 rounded-md">
                  Your conversation will appear here...
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-800 flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && message.trim() && handleSendMessage()}
                placeholder="Type your message..."
                className="w-full px-4 py-2 bg-gray-800 border-2 border-blue-500/50 rounded-md font-mono text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500 disabled:bg-gray-900/50 animate-pulse-border"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
                className={`px-4 py-2 rounded-md font-mono text-white font-semibold ${
                  isLoading || !message.trim()
                    ? 'bg-blue-800/50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(96,165,250,0.4)] animate-pulse-border'
                } transition-all flex items-center gap-1`}
              >
                <svg
                  className="inline w-4 h-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 2L11 13"
                    stroke="#00f7ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 2L15 22L11 13L2 9L22 2Z"
                    stroke="#00f7ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="rgba(0, 247, 255, 0.2)"
                  />
                  <path
                    d="M11 13L2 9"
                    stroke="#ff00ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </svg>
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute w-4 h-4 border-2 border-cyan-400/30 rounded-full top-1/4 left-1/5 animate-orbit" style={{ animationDuration: '20s' }}></div>
        <div className="absolute w-4 h-4 border-2 border-cyan-400/30 rounded-full bottom-1/3 right-1/4 animate-orbit" style={{ animationDuration: '18s', animationDirection: 'reverse' }}></div>
      </div>

      <style jsx global>{`
        .animate-pulse-border {
          animation: pulseBorder 2s infinite;
        }

        .animate-blink {
          animation: blink 1.5s infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-orbit {
          animation: orbit 20s linear infinite;
        }

        .holographic-overlay::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            rgba(96, 165, 250, 0.1),
            rgba(255, 0, 255, 0.05),
            rgba(96, 165, 250, 0.1)
          );
          pointer-events: none;
          z-index: 5;
        }

        @keyframes pulseBorder {
          0% {
            box-shadow: 0 0 5px rgba(96, 165, 250, 0.5);
          }
          50% {
            box-shadow: 0 0 10px rgba(96, 165, 250, 0.8);
          }
          100% {
            box-shadow: 0 0 5px rgba(96, 165, 250, 0.5);
          }
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.2;
          }
        }

        @keyframes glow {
          0% {
            box-shadow: 0 0 5px rgba(96, 165, 250, 0.3);
          }
          50% {
            box-shadow: 0 0 15px rgba(96, 165, 250, 0.5);
          }
          100% {
            box-shadow: 0 0 5px rgba(96, 165, 250, 0.3);
          }
        }

        @keyframes orbit {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(10px, -10px);
          }
          50% {
            transform: translate(0, 0);
          }
          75% {
            transform: translate(-10px, 10px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        /* Custom Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #0A0E2A;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #00f7ff, #ff00ff);
          border-radius: 4px;
          box-shadow: 0 0 8px rgba(0, 247, 255, 0.3);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #00f7ff, #ff00ff, #00f7ff);
          box-shadow: 0 0 12px rgba(0, 247, 255, 0.5);
        }

        /* Firefox Scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #00f7ff #0A0E2A;
        }
      `}</style>
    </div>
  );
};

export default ChatWithBot;