"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Navbar from "../components/Navbar"
import AuthPromptModal from "../components/AuthPromptModel"

interface Conversation {
  _id?: string
  prompt: string
  apiLink: string
  files: string[]
  createdAt: string
  response: string
  sessionId: string
}

const History: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { getToken, isSignedIn } = useAuth()
  const apiUrl = "/api/conversations"

  useEffect(() => {
    if (isSignedIn) {
      fetchConversations()
    }
  }, [isSignedIn])

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      const token = await getToken()
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setConversations(data)
        setError("")
      } else {
        console.error("Failed to fetch conversations:", data.error)
        setError("Failed to load chat history. Please try again.")
      }
    } catch (err) {
      console.error("Error fetching conversations:", err)
      setError("Error loading chat history. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId)
      } else {
        newSet.add(sessionId)
      }
      return newSet
    })
  }

  const cleanApiLink = (apiLink: string): string => {
    const doubleApiV1 = "/api/v1/api/v1/"
    if (apiLink.includes(doubleApiV1)) {
      const index = apiLink.indexOf(doubleApiV1)
      return apiLink.slice(0, index + 7) + apiLink.slice(index + 14)
    }
    return apiLink
  }

  // Group conversations by sessionId
  const groupedConversations = conversations.reduce((acc, conv) => {
    const sessionId = conv.sessionId || `unknown-${conv._id}`
    if (!acc[sessionId]) {
      acc[sessionId] = []
    }
    acc[sessionId].push(conv)
    return acc
  }, {} as Record<string, Conversation[]>)

  if (!isSignedIn) {
    return <AuthPromptModal />
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-300">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto w-full p-6">
        <h1 className="text-2xl font-bold text-blue-400 mb-6">Chat History</h1>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-400 p-4 bg-red-900/20 border border-red-800/30 rounded-md">{error}</div>
        ) : Object.keys(groupedConversations).length === 0 ? (
          <div className="text-gray-500 italic text-center p-6 bg-gray-900 rounded-lg border border-gray-700">
            No chat history yet. Start a{" "}
            <a href="/new-chat" className="text-blue-400 hover:underline">
              new chat
            </a>{" "}
            to create a chatbot!
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedConversations)
              .sort(([a], [b]) => (b > a ? 1 : -1))
              .map(([sessionId, sessionConvs]) => {
                const firstConv = sessionConvs[0]
                const isExpanded = expandedSessions.has(sessionId)
                return (
                  <div
                    key={sessionId}
                    className="bg-gray-900 p-4 rounded-lg border border-blue-500/30 hover:bg-gray-800/50 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-blue-400 font-semibold">
                          Session: {new Date(firstConv.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-300">
                          <strong>Prompt Preview:</strong>{" "}
                          {(firstConv.prompt || "N/A").substring(0, 50)}
                          {(firstConv.prompt || "").length > 50 ? "..." : ""}
                        </p>
                        <p className="text-gray-500 text-sm">
                          <strong>Messages:</strong> {sessionConvs.length} |{" "}
                          <strong>Last Updated:</strong>{" "}
                          {new Date(firstConv.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/new-chat?sessionId=${encodeURIComponent(sessionId)}`)}
                          className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition-colors"
                        >
                          Continue Chat
                        </button>
                        <button
                          onClick={() => toggleSession(sessionId)}
                          className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
                        >
                          {isExpanded ? "View Less" : "View More"}
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-4 space-y-4">
                        {sessionConvs.map((conv) => (
                          <div
                            key={conv._id}
                            className="border-t border-gray-700 pt-3 relative group"
                          >
                            <button
                              onClick={() =>
                                router.push(
                                  `/chat-with-bot?endpoint=${encodeURIComponent(
                                    cleanApiLink(conv.apiLink),
                                  )}`,
                                )
                              }
                              className="absolute top-3 right-3 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
                            >
                              Chat
                            </button>
                            <div className="pr-24">
                              <p className="text-blue-400 font-semibold mb-1">Prompt:</p>
                              <p className="text-gray-300 mb-2">{conv.prompt || "N/A"}</p>
                              <p className="text-blue-400 font-semibold mb-1">
                                API Endpoint:
                              </p>
                              <p className="text-gray-300 mb-2">
                                <a
                                  href={cleanApiLink(conv.apiLink)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-400 hover:underline break-all"
                                >
                                  {cleanApiLink(conv.apiLink)}
                                </a>
                              </p>
                              {conv.files && conv.files.length > 0 && (
                                <>
                                  <p className="text-blue-400 font-semibold mb-1">Files:</p>
                                  <p className="text-gray-300 mb-2">
                                    {conv.files.join(", ")}
                                  </p>
                                </>
                              )}
                              <p className="text-blue-400 font-semibold mb-1">Response:</p>
                              <p className="text-gray-300 mb-2">
                                {conv.response || "No response available"}
                              </p>
                              <p className="text-blue-400 font-semibold mb-1">Date:</p>
                              <p className="text-gray-500 text-sm">
                                {new Date(conv.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}

export default History