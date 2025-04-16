"use client"

import React, { useEffect, useRef } from "react"
import Link from "next/link"

const WelcomePage: React.FC = () => {
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slide-up")
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
    <div className="min-h-screen bg-black bg-circuit-pattern bg-cover bg-fixed text-gray-100 overflow-x-hidden relative holographic-overlay">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden border-hud">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 animate-gradient-shift"></div>
        <div className="relative z-10 text-center px-4 sm:px-6">
          <h1 className="font-['Orbitron'] text-5xl md:text-7xl font-bold uppercase text-blue-400 mb-4 animate-pulse-slow shadow-[0_0_15px_rgba(96,165,250,0.7)]">
            Chatbot Factory
          </h1>
          <p className="font-mono text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto animate-typing">
            Create <span className="text-cyan-400 animate-flicker">intelligent chatbots</span> tailored to your needs. Upload files, craft prompts, and keep your conversations alive forever.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/sign-in"
              className="inline-block px-8 py-3 bg-blue-900/50 border-2 border-blue-400 text-blue-400 font-mono rounded-md hover:bg-blue-400 hover:text-black transition-all scanning-line animate-fade-in delay-200"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-block px-8 py-3 bg-transparent border-2 border-blue-400 text-blue-400 font-mono rounded-md hover:bg-blue-400 hover:text-black transition-all scanning-line animate-fade-in delay-400"
            >
              Sign Up
            </Link>
          </div>
        </div>
        <div className="absolute w-3 h-3 bg-blue-400 rounded-full animate-orbit" style={{ top: '20%', left: '10%', animationDuration: '10s' }}></div>
        <div className="absolute w-3 h-3 bg-blue-400 rounded-full animate-orbit" style={{ top: '70%', right: '15%', animationDuration: '12s', animationDirection: 'reverse' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-8">
        <div
          ref={(el) => (sectionsRef.current[0] = el)}
          className="max-w-5xl mx-auto opacity-0 transition-all duration-700"
        >
          <h2 className="font-['Orbitron'] text-4xl font-bold text-blue-400 text-center mb-12 animate-fade-in">
            Discover Chatbot Factory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/80 p-6 rounded-lg border-2 border-blue-500/50 hover:shadow-[0_0_15px_rgba(96,165,250,0.4)] transition-all transform hover:scale-105 animate-glow">
              <h3 className="font-['Orbitron'] text-2xl font-semibold text-blue-400 mb-4">Custom Chatbots</h3>
              <p className="font-mono text-gray-300">
                Design chatbots with unique prompts to handle any task or conversation style.
              </p>
            </div>
            <div className="bg-gray-900/80 p-6 rounded-lg border-2 border-blue-500/50 hover:shadow-[0_0_15px_rgba(96,165,250,0.4)] transition-all transform hover:scale-105 animate-glow">
              <h3 className="font-['Orbitron'] text-2xl font-semibold text-blue-400 mb-4">File Uploads</h3>
              <p className="font-mono text-gray-300">
                Enhance your chatbot with PDF or TXT files for richer, context-aware responses.
              </p>
            </div>
            <div className="bg-gray-900/80 p-6 rounded-lg border-2 border-blue-500/50 hover:shadow-[0_0_15px_rgba(96,165,250,0.4)] transition-all transform hover:scale-105 animate-glow">
              <h3 className="font-['Orbitron'] text-2xl font-semibold text-blue-400 mb-4">Seamless History</h3>
              <p className="font-mono text-gray-300">
                Never lose a conversation—pick up right where you left off, anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900/90 text-center border-t-2 border-blue-500/50">
        <p className="font-mono text-gray-500">
          © {new Date().getFullYear()} Chatbot Factory. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default WelcomePage