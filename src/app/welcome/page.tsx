'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import ThreeWelcomeBackground from '../components/ThreeWelcomeBackground'

const WelcomePage: React.FC = () => {
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) observer.unobserve(section)
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-gray-300 overflow-x-hidden">
      <ThreeWelcomeBackground />
      {/* Hero Section with Parallax Effect */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black z-10 animate-gradient-shift"></div>
        <div className="relative z-20 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-blue-400 mb-4 animate-fade-in">
            Chatbot Factory
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto animate-fade-in delay-200">
            Create intelligent chatbots tailored to your needs. Upload files, craft prompts, and keep your conversations alive forever.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/sign-in"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105 animate-fade-in delay-400"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-block px-8 py-3 bg-transparent border border-blue-600 text-blue-400 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors transform hover:scale-105 animate-fade-in delay-400"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8">
        <div
          ref={(el) => (sectionsRef.current[0] = el)}
          className="max-w-5xl mx-auto opacity-0 transition-all duration-700"
        >
          <h2 className="text-4xl font-semibold text-blue-400 text-center mb-12">
            Discover Chatbot Factory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-6 rounded-lg border border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:scale-105">
              <h3 className="text-2xl font-semibold text-blue-400 mb-4">Custom Chatbots</h3>
              <p className="text-gray-400">
                Design chatbots with unique prompts to handle any task or conversation style.
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:scale-105">
              <h3 className="text-2xl font-semibold text-blue-400 mb-4">File Uploads</h3>
              <p className="text-gray-400">
                Enhance your chatbot with PDF or TXT files for richer, context-aware responses.
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:scale-105">
              <h3 className="text-2xl font-semibold text-blue-400 mb-4">Seamless History</h3>
              <p className="text-gray-400">
                Never lose a conversation—pick up right where you left off, anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-center border-t border-gray-700">
        <p className="text-gray-500">
          © {new Date().getFullYear()} Chatbot Factory. All rights reserved.
        </p>
      </footer>

      <style jsx global>{`
        .animate-slide-up {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .animate-gradient-shift {
          animation: gradientShift 15s ease infinite;
          background-size: 200% 200%;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Custom Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #0A0E2A; /* Matches ThreeWelcomeBackground indigo */
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #00f7ff, #ff00ff); /* Neon blue to purple */
          border-radius: 4px;
          box-shadow: 0 0 8px rgba(0, 247, 255, 0.3); /* Subtle glow */
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
  )
}

export default WelcomePage