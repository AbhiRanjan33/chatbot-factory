'use client';

import React from 'react';
import Link from 'next/link';

const AuthPromptModal: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-opacity-90 text-gray-100">
      <div className="bg-gray-900/80 p-6 rounded-xl border-2 border-blue-500/50 shadow-[0_0_20px_rgba(96,165,250,0.3)]">
        <h2 className="font-['Orbitron'] text-2xl text-blue-400 mb-4">Authentication Required</h2>
        <p className="font-mono text-gray-300 mb-6">
          Please sign in or sign up to access this feature.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/sign-in"
            className="px-4 py-2 bg-blue-600 text-white font-mono rounded-md hover:bg-blue-500 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 bg-transparent border-2 border-blue-400 text-blue-400 font-mono rounded-md hover:bg-blue-400 hover:text-black transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPromptModal;