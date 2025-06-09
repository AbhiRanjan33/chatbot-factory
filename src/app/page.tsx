'use client';

import type React from 'react';
import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Navbar from './components/Navbar';
import HistoryModal from './components/HistoryModal';
import WelcomePage from './components/WelcomePage';
import Loading from './components/Loading';
import ThreeBackground from './components/ThreeBackground';

interface Conversation {
  _id?: string;
  sessionId: string;
  prompt: string;
  apiLink: string;
  files: string[];
  createdAt: string;
  response: string;
}

const Home: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [files, setFiles] = useState<File[] | null>(null);
  const [mode, setMode] = useState<string>(''); // Added state to track mode
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [displayedConversations, setDisplayedConversations] = useState<Conversation[]>([]);
  const [conversationLimit, setConversationLimit] = useState<number>(10);
  const searchParams = useSearchParams();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const backendUrl = 'https://my-chatbot-factory.onrender.com/api/v1';
  const apiUrl = '/api/conversations';

  useEffect(() => {
    if (isSignedIn) {
      const paramSessionId = searchParams.get('sessionId');
      setSessionId(paramSessionId || uuidv4());
    }
  }, [searchParams, isSignedIn]);

  useEffect(() => {
    if (isSignedIn && sessionId) {
      fetchConversations();
      fetchAllConversations();
    } else if (!isSignedIn) {
      setConversations([]);
      setAllConversations([]);
      setDisplayedConversations([]);
    }
  }, [isSignedIn, sessionId]);

  useEffect(() => {
    console.log('Conversations updated:', conversations);
    setDisplayedConversations(conversations.slice(0, conversationLimit));
  }, [conversations, conversationLimit]);

  const fetchConversations = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication token not available. Please try signing in again.');
        return;
      }
      const response = await fetch(`${apiUrl}?sessionId=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('Fetched conversations for session:', data);
      if (response.ok) {
        setConversations(data);
      } else {
        console.error('Failed to fetch conversations:', data.error);
        setError('Failed to load chat history');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Error loading chat history');
    }
  };

  const fetchAllConversations = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication token not available. Please try signing in again.');
        return;
      }
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('Fetched all conversations:', data);
      if (response.ok) {
        data.forEach((conv: Conversation, index: number) => {
          if (!conv.apiLink) {
            console.warn(`Conversation at index ${index} has no apiLink:`, conv);
          }
        });
        setAllConversations(data);
      } else {
        console.error('Failed to fetch all conversations:', data.error);
        setError('Failed to load conversation history');
      }
    } catch (err) {
      console.error('Error fetching all conversations:', err);
      setError('Error loading conversation history');
    }
  };

  const handleLoadMore = () => {
    setConversationLimit((prev) => prev + 10);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter((file) => file.type === 'application/pdf' || file.type === 'text/plain');
      if (validFiles.length === selectedFiles.length) {
        setFiles(validFiles);
        setError('');
      } else {
        setError('Please upload only PDF or TXT files.');
        setFiles(null);
      }
    } else {
      setFiles(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      setError('Please sign in to create a chatbot');
      return;
    }
    if (!message && !files) {
      setError('Please enter a message or upload at least one file.');
      return;
    }
    setError('');
    setResult('');
    setIsLoading(true);

    try {
      const clerkToken = await getToken();
      if (!clerkToken) {
        throw new Error('Authentication token not available');
      }
      console.log('Logging in to Render backend');
      const loginResponse = await fetch(`${backendUrl}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });
      console.log('Login response status:', loginResponse.status, loginResponse.statusText);
      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        throw new Error(`Login failed: ${loginResponse.status} ${errorText}`);
      }
      const loginData = await loginResponse.json();
      console.log('Login response data:', loginData);
      if (loginData.status !== 'success') {
        throw new Error('Login failed: ' + (loginData.message || 'Unknown error'));
      }
      const renderToken = loginData.token;

      const botName = `Chatbot-${Date.now()}`;
      let prompt = 'Conversation history:\n';
      const maxPromptLength = 9000;
      let charCount = prompt.length;
      const historyItems = [];
      console.log(conversations);
      for (let i = 0; i < conversations.length; i++) {
        const conv = conversations[i];
        const entry = `--- Message ${i + 1} ---\nUser: ${conv.prompt || 'N/A'}\nBot: ${conv.response || 'N/A'}\n${conv.files?.length ? `Files: ${JSON.stringify(conv.files)}\n` : ''}`;
        if (charCount + entry.length < maxPromptLength) {
          historyItems.push(entry);
          charCount += entry.length;
        } else {
          break;
        }
      }
      console.log('History:', historyItems);
      prompt += historyItems.join('');
      console.log('Prompt:', prompt);
      prompt += `--- Current Message ---\nUser: ${message || 'File upload'}\n${files ? `Files: ${JSON.stringify(files.map((f) => f.name))}\n` : ''}`;

      console.log('Creating chatbot:', { name: botName, prompt, mode });
      const createBody = { name: botName, prompt };
      if (mode) createBody['mode'] = mode; // Include mode if selected
      const createResponse = await fetch(`${backendUrl}/chatbots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${renderToken}`,
        },
        body: JSON.stringify(createBody),
      });
      console.log('Chatbot response status:', createResponse.status);
      const createData = await createResponse.json();
      console.log('Chatbot creation response:', createData);
      if (createData.status !== 'success') {
        throw new Error('Chatbot creation failed: ' + (createData.message || 'Unknown error'));
      }
      const { chatbot, response } = createData.data;
      console.log('Extracted response:', response);
      const endpointPath = chatbot.apiEndpoint?.startsWith('/api/v1')
        ? chatbot.apiEndpoint.slice(7)
        : chatbot.apiEndpoint;
      if (!endpointPath) {
        throw new Error('Chatbot API endpoint is undefined');
      }
      const apiEndpoint = `${backendUrl}${endpointPath}`;
      console.log('Generated API Endpoint:', apiEndpoint);

      console.log('Before file upload - clerkToken:', clerkToken, 'renderToken:', renderToken);
      let fileNames: string[] = [];
      if (files && files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append('file', file));
        console.log('Uploading files for chatbot:', chatbot._id);
        const uploadResponse = await fetch(`${backendUrl}/chatbots/${chatbot._id}/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${renderToken}`,
          },
          body: formData,
        });
        console.log('Upload response status:', uploadResponse.status);
        const uploadData = await uploadResponse.json();
        console.log('Upload response data:', uploadData);
        if (uploadData.status !== 'success') {
          throw new Error('File upload failed: ' + (uploadData.message || 'Unknown error'));
        }
        fileNames = files.map((file) => file.name);
      }
      console.log('After file upload - clerkToken:', clerkToken, 'renderToken:', renderToken);

      const conversation = {
        sessionId,
        prompt: message || 'File upload',
        apiLink: apiEndpoint,
        files: fileNames,
        response,
      };
      console.log('Saving conversation:', conversation);
      const freshClerkToken = await getToken();
      if (!freshClerkToken) {
        throw new Error('Authentication token not available for saving conversation');
      }
      const saveResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${freshClerkToken}`,
        },
        body: JSON.stringify(conversation),
      });
      console.log('Save response status:', saveResponse.status);
      const saveData = await saveResponse.json();
      console.log('Save conversation response:', saveData);
      if (!saveResponse.ok) {
        throw new Error('Failed to save conversation: ' + (saveData.error || 'Unknown error'));
      }

      setResult(`Chatbot created successfully!\nYour API Endpoint: ${apiEndpoint}\nResponse: ${response}`);
      setMessage('');
      setFiles(null);
      setMode(''); // Reset mode after submission
      fetchConversations();
      fetchAllConversations();
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to create chatbot. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const cleanApiLink = (apiLink: string): string => {
    const doubleApiV1 = '/api/v1/api/v1/';
    if (apiLink.includes(doubleApiV1)) {
      const index = apiLink.indexOf(doubleApiV1);
      return apiLink.slice(0, index + 7) + apiLink.slice(index + 14);
    }
    return apiLink;
  };

  if (!isLoaded) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return <WelcomePage />;
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
        <Navbar onOpenHistory={() => setIsHistoryOpen(true)} />
        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          conversations={allConversations}
        />
        <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 flex flex-col mt-14 h-[calc(100vh-3.5rem)] overflow-x-hidden">
          <div className="flex-1 bg-gray-900/80 rounded-xl shadow-[0_0_20px_rgba(96,165,250,0.3)] border-2 border-blue-500/50 p-6 mb-4 overflow-y-auto relative holographic-overlay break-words">
            <div className="absolute top-2 left-2 w-2 h-2 bg-blue-400 animate-blink"></div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 animate-blink delay-200"></div>
            {displayedConversations.length > 0 && (
              <div className="mb-6">
                <h2 className="font-['Orbitron'] text-lg uppercase text-blue-400 border-b-2 border-blue-400/50 mb-4">
                  SYSTEM LOGS
                </h2>
                {displayedConversations
                  .slice()
                  .reverse()
                  .map((conv) => (
                    <div
                      key={conv._id}
                      className="bg-gray-800/50 border-l-4 border-cyan-400 p-4 rounded-r-md hover:bg-gray-700/50 transition-all relative mb-4 group animate-glow"
                      data-conversation-id={conv._id}
                    >
                      <div className="absolute left-0 top-0 h-full w-px border-dashed border-blue-500/30 -translate-x-2"></div>
                      <button
                        onClick={() =>
                          window.open(`/chat-with-bot?endpoint=${encodeURIComponent(cleanApiLink(conv.apiLink))}`, '_blank')
                        }
                        className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white font-mono rounded-md hover:bg-blue-500 text-sm transition-colors shadow-[0_0_10px_rgba(96,165,250,0.5)] animate-glow"
                      >
                        <svg
                          className="inline w-4 h-4 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z"
                            stroke="#00f7ff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2 8L12 13L22 8"
                            stroke="#ff00ff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="rgba(255, 0, 255, 0.2)"
                          />
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="1" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </svg>
                        Chat
                      </button>
                      <p className="font-mono pr-16">
                        <span className="text-blue-400">Prompt:</span> {conv.prompt}
                      </p>
                      <p className="font-mono text-sm">
                        <span className="text-blue-400">API Endpoint:</span>{' '}
                        <a
                          href={cleanApiLink(conv.apiLink)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-400 hover:underline"
                        >
                          {cleanApiLink(conv.apiLink)}
                        </a>
                      </p>
                      {conv.files && conv.files.length > 0 && (
                        <p className="font-mono text-sm">
                          <span className="text-blue-400">Files:</span> {conv.files.join(', ')}
                        </p>
                      )}
                      <p className="font-mono text-sm">
                        <span className="text-blue-400">Response:</span>{' '}
                        {conv.response ? conv.response : 'No response available'}
                      </p>
                      <p className="font-mono text-xs text-gray-500 mt-1">
                        <span className="text-blue-400">Date:</span> {new Date(conv.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                {conversations.length > displayedConversations.length && (
                  <button
                    onClick={handleLoadMore}
                    className="mt-4 px-4 py-2 bg-gray-700 text-blue-400 font-mono rounded-full hover:bg-blue-400 hover:text-black transition-all animate-pulse-border"
                  >
                    Load More
                  </button>
                )}
              </div>
            )}
            {result ? (
              <div className="font-mono text-blue-100 whitespace-pre-wrap break-words bg-gray-800/80 p-4 rounded-md border-2 border-blue-500/50 shadow-[0_0_15px_rgba(96,165,250,0.4)]">
                {result}
              </div>
            ) : (
              <div className="font-mono text-gray-500 italic flex items-center justify-center h-20 border-2 border-dashed border-blue-500/50 rounded-md">
                Your chatbot URL will appear here...
              </div>
            )}
            {error && (
              <div className="font-mono text-red-400 mt-4 p-3 bg-red-900/30 border-2 border-red-800/50 rounded-md shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end space-y-4 sm:space-y-0 sm:space-x-3">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-2 bg-gray-800 border-2 border-blue-500/50 rounded-md font-mono text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500 disabled:bg-gray-900/50 animate-pulse-border"
                disabled={isLoading}
              />
            </div>
            <div className="w-[90px]">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-blue-500/50 rounded-md font-mono text-gray-100 focus:outline-none placeholder-gray-500 disabled:bg-gray-900/50 animate-pulse-border"
                disabled={isLoading}
              >
                <option value="">Default</option>
                <option value="precision">Precision</option>
                <option value="exploration">Exploration</option>
              </select>
            </div>
            <div className="relative">
              <label htmlFor="file" className="block">
                <span className="sr-only">Upload files</span>
                <input
                  type="file"
                  id="file"
                  accept=".pdf,.txt"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-800 text-gray-100 border-2 border-blue-500/50 rounded-md hover:bg-blue-500/50 font-mono disabled:bg-gray-900/50 transition-all animate-pulse-border"
                  onClick={() => document.getElementById('file')?.click()}
                  disabled={isLoading}
                >
                  <svg
                    className="inline w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="4"
                      stroke="#00f7ff"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 16V8M12 8L8 12M12 8L16 12"
                      stroke="#ff00ff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="rgba(255, 0, 255, 0.2)"
                    />
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="1" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </svg>
                </button>
              </label>
              {files && files.length > 0 && (
                <span className="font-mono text-sm text-blue-400 ml-2 absolute -bottom-6 left-0 whitespace-nowrap">
                  {files.length > 1 ? `${files.length} files selected` : files[0].name}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || (!message && !files)}
              className={`px-4 py-2 rounded-md font-mono text-white font-semibold ${
                isLoading || (!message && !files)
                  ? 'bg-blue-800/50 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(96,165,250,0.4)] animate-pulse-border'
              } transition-all`}
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
          </form>
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

export default Home;