"use client"

import type React from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

interface NavbarProps {
  onOpenHistory: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenHistory }) => {
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const handleNewChat = () => {
    const newSessionId = uuidv4()
    router.push(`/?sessionId=${newSessionId}`)
  }

  return (
    <nav className="fixed top-0 w-full bg-gray-900/90 border-b-2 border-blue-500/50 p-4 shadow-[0_0_15px_rgba(96,165,250,0.3)] z-50 holographic-overlay">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-['Orbitron'] text-blue-400 text-xl font-bold flex items-center">
          <span className="text-2xl mr-2 animate-blink">🤖</span>
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent animate-pulse-slow">
            ChatBot Factory
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          {isSignedIn && (
            <>
              <button
                onClick={handleNewChat}
                className="text-blue-400 hover:text-cyan-400 p-2 rounded-md hover:bg-blue-900/30 transition-all animate-pulse-border"
                title="New Chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0013.803-3.7l3.181 3.182m0-4.991v4.992"
                  />
                </svg>
              </button>
              <button
                onClick={onOpenHistory}
                className="text-blue-400 hover:text-cyan-400 p-2 rounded-md hover:bg-blue-900/30 transition-all animate-pulse-border"
                title="View History"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </>
          )}
          {isSignedIn ? (
            <>
              <span className="font-mono text-gray-300">
                Welcome, {user?.firstName || user?.emailAddresses[0].emailAddress}
              </span>
              <button
                onClick={() => signOut({ redirectUrl: "/" })}
                className="text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-md font-mono transition-all shadow-[0_0_10px_rgba(96,165,250,0.5)] animate-pulse-border"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="text-blue-400 hover:text-cyan-400 border-2 border-blue-400/50 px-3 py-1 rounded-md hover:bg-blue-900/30 font-mono transition-all animate-pulse-border"
              >
                Sign Up
              </Link>
              <Link
                href="/sign-in"
                className="text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-md font-mono transition-all shadow-[0_0_10px_rgba(96,165,250,0.5)] animate-pulse-border"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar