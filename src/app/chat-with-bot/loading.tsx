"use client"

import { useEffect, useState } from "react"

export default function Loading() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer)
          return 100
        }
        return prevProgress + Math.random() * 10
      })
    }, 200)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="relative flex flex-col items-center">
        {/* Robot head animation */}
        <div className="relative w-24 h-24 mb-8">
          {/* Robot head */}
          <div className="absolute inset-0 bg-gray-900 rounded-xl border-2 border-blue-500 shadow-lg shadow-blue-500/20 animate-pulse"></div>

          {/* Robot eyes */}
          <div className="absolute top-6 left-4 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
          <div
            className="absolute top-6 right-4 w-3 h-3 bg-blue-400 rounded-full animate-ping"
            style={{ animationDelay: "0.5s" }}
          ></div>

          {/* Robot antenna */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-blue-500"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>

          {/* Robot mouth */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-400"></div>

          {/* Spinning circle around robot */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 border-4 border-transparent border-b-blue-300 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "3s" }}
          ></div>
        </div>

        {/* Loading text */}
        <div className="text-blue-400 font-bold text-xl mb-4 animate-pulse">INITIALIZING BOT</div>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress percentage */}
        <div className="text-blue-300 text-sm mt-2">{Math.min(100, Math.floor(progress))}%</div>

        {/* Binary code effect */}
        <div className="absolute -z-10 inset-0 overflow-hidden opacity-20 select-none pointer-events-none text-blue-500 text-xs">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute whitespace-nowrap"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.5,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              {Array.from({ length: 30 })
                .map(() => Math.round(Math.random()))
                .join("")}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
