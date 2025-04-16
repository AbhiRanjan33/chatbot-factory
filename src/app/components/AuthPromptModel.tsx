"use client"

import type React from "react"
import Link from "next/link"

const AuthPromptModal: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl max-w-sm w-full border border-blue-500/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <span className="text-5xl">🤖</span>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-center text-blue-400">Authentication Required</h2>
          <p className="text-gray-400 mb-8 text-center">
            You need to be signed in to interact with the chatbot factory.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/sign-in"
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2 bg-gray-800 text-blue-400 border border-blue-700 rounded-md hover:bg-gray-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPromptModal
