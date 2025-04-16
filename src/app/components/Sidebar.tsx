'use client';

import React, { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

interface Conversation {
  _id?: string;
  prompt: string;
  response: string;
  files: string[];
  createdAt: string;
}

interface SidebarProps {
  chatHistories: { apiLink: string; conversations: Conversation[] }[];
  onSubmitPrompt: (apiLink: string, message: string, files: File[]) => Promise<void>;
  onNewChat: (message: string, files: File[]) => Promise<string | null>;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ chatHistories, onSubmitPrompt, onNewChat, isCollapsed }) => {
  const [message, setMessage] = useState<string>('');
  const [files, setFiles] = useState<File[] | null>(null);
  const [activeApiLink, setActiveApiLink] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { getToken } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(
        (file) => file.type === 'application/pdf' || file.type === 'text/plain'
      );
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

  const handleSubmit = async (e: React.FormEvent, apiLink: string) => {
    e.preventDefault();
    if (!message && !files) {
      setError('Please enter a message or upload at least one file.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await onSubmitPrompt(apiLink, message, files || []);
      setMessage('');
      setFiles(null);
    } catch (err) {
      setError('Failed to send prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message && !files) {
      setError('Please enter a message or upload at least one file.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const newApiLink = await onNewChat(message, files || []);
      if (newApiLink) {
        setActiveApiLink(newApiLink);
        setMessage('');
        setFiles(null);
      } else {
        setError('Failed to start new chat.');
      }
    } catch (err) {
      setError('Failed to start new chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCollapsed) {
    return null; // Fully hide sidebar when collapsed
  }

  return (
    <div className="bg-gray-100 h-screen flex flex-col border-r border-gray-300 w-80">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 bg-white shadow-md rounded-lg m-2">
          <h3 className="text-md font-semibold mb-2 text-black">New Chat</h3>
          <form onSubmit={handleNewChat} className="space-y-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <div>
              <label htmlFor="new-chat-file" className="block">
                <span className="sr-only">Upload files</span>
                <input
                  type="file"
                  id="new-chat-file"
                  accept=".pdf,.txt"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
                  onClick={() => document.getElementById('new-chat-file')?.click()}
                  disabled={isLoading}
                >
                  📎
                </button>
              </label>
              {files && files.length > 0 && (
                <span className="text-sm text-gray-600 ml-2">
                  {files.map((f) => f.name).join(', ')}
                </span>
              )}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={isLoading || (!message && !files)}
              className={`w-full px-3 py-2 rounded-lg text-white font-semibold ${
                isLoading || (!message && !files)
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading ? 'Starting...' : 'Start New Chat'}
            </button>
          </form>
        </div>
        {chatHistories.length === 0 ? (
          <div className="p-4 text-gray-500 italic">No chat histories yet...</div>
        ) : (
          chatHistories.map((history) => {
            const firstPrompt = history.conversations[0]?.prompt || 'Untitled Chat';
            return (
              <div key={history.apiLink} className="border-b border-gray-300 m-2">
                <button
                  onClick={() =>
                    setActiveApiLink(activeApiLink === history.apiLink ? null : history.apiLink)
                  }
                  className="w-full p-4 text-left text-indigo-600 hover:bg-gray-200 rounded-lg"
                >
                  {firstPrompt}
                </button>
                {activeApiLink === history.apiLink && (
                  <div className="p-4 bg-white shadow-md rounded-lg mt-2">
                    <div className="space-y-4 mb-4">
                      {history.conversations.map((conv) => (
                        <div key={conv._id} className="border-b border-gray-300 py-2 text-black">
                          <p>
                            <strong>Prompt:</strong> {conv.prompt}
                          </p>
                          <p>
                            <strong>Response:</strong>{' '}
                            {conv.response || 'No response available'}
                          </p>
                          {conv.files && conv.files.length > 0 && (
                            <p>
                              <strong>Files:</strong> {conv.files.join(', ')}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            <strong>Date:</strong> {new Date(conv.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    <form
                      onSubmit={(e) => handleSubmit(e, history.apiLink)}
                      className="space-y-2"
                    >
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                      />
                      <div>
                        <label htmlFor={`file-${history.apiLink}`} className="block">
                          <span className="sr-only">Upload files</span>
                          <input
                            type="file"
                            id={`file-${history.apiLink}`}
                            accept=".pdf,.txt"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
                            onClick={() =>
                              document.getElementById(`file-${history.apiLink}`)?.click()
                            }
                            disabled={isLoading}
                          >
                            📎
                          </button>
                        </label>
                        {files && files.length > 0 && (
                          <span className="text-sm text-gray-600 ml-2">
                            {files.map((f) => f.name).join(', ')}
                          </span>
                        )}
                      </div>
                      {error && <div className="text-red-500 text-sm">{error}</div>}
                      <button
                        type="submit"
                        disabled={isLoading || (!message && !files)}
                        className={`w-full px-3 py-2 rounded-lg text-white font-semibold ${
                          isLoading || (!message && !files)
                            ? 'bg-indigo-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {isLoading ? 'Sending...' : 'Send'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;