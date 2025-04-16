"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Conversation {
  _id?: string
  sessionId: string
  prompt: string
  apiLink: string
  files: string[]
  response: string
  createdAt: string
}

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  conversations: Conversation[]
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, conversations }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const router = useRouter()

  if (!isOpen) return null

  // Group conversations by sessionId
  const sessions = conversations.reduce((acc, conv) => {
    if (!acc[conv.sessionId]) {
      acc[conv.sessionId] = []
    }
    acc[conv.sessionId].push(conv)
    return acc
  }, {} as Record<string, Conversation[]>)

  // Get the first prompt of each session as the title
  const sessionList = Object.keys(sessions)
    .map((sessionId) => {
      const firstConv = sessions[sessionId].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )[0]
      return {
        sessionId,
        title: firstConv.prompt || "Untitled Conversation",
        createdAt: firstConv.createdAt,
      }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleContinueConversation = (sessionId: string) => {
    router.push(`/?sessionId=${sessionId}`)
    onClose()
  }

  const cleanApiLink = (apiLink?: string): string => {
    if (!apiLink) {
      console.warn("cleanApiLink received undefined or null apiLink")
      return "Invalid API Link"
    }
    const doubleApiV1 = "/api/v1/api/v1/"
    if (apiLink.includes(doubleApiV1)) {
      const index = apiLink.indexOf(doubleApiV1)
      return apiLink.slice(0, index + 7) + apiLink.slice(index + 14)
    }
    return apiLink
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col border border-blue-500/30">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-blue-400">Conversation History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {/* Session List */}
          <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
            {sessionList.length === 0 ? (
              <div className="p-4 text-gray-500 italic">No conversations found.</div>
            ) : (
              sessionList.map((session) => (
                <div
                  key={session.sessionId}
                  onClick={() => setSelectedSessionId(session.sessionId)}
                  className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-colors ${
                    selectedSessionId === session.sessionId ? "bg-blue-900/30" : ""
                  }`}
                >
                  <p className="text-blue-400 font-semibold truncate">{session.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(session.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
          {/* Conversation Details */}
          <div className="w-2/3 p-4 overflow-y-auto">
            {selectedSessionId && sessions[selectedSessionId] ? (
              <>
                <h3 className="text-lg font-semibold text-blue-400 mb-4">
                  {sessions[selectedSessionId][0].prompt || "Untitled Conversation"}
                </h3>
                {sessions[selectedSessionId]
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((conv) => (
                    <div key={conv._id} className="mb-4 border-b border-gray-700 pb-2">
                      <p className="text-blue-400 font-semibold">Prompt:</p>
                      <p className="text-gray-300">{conv.prompt}</p>
                      <p className="text-blue-400 font-semibold mt-2">Response:</p>
                      <p className="text-gray-300">{conv.response || "No response available"}</p>
                      {conv.files && conv.files.length > 0 && (
                        <>
                          <p className="text-blue-400 font-semibold mt-2">Files:</p>
                          <p className="text-gray-300">{conv.files.join(", ")}</p>
                        </>
                      )}
                      <p className="text-blue-400 font-semibold mt-2">API Endpoint:</p>
                      <a
                        href={cleanApiLink(conv.apiLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 hover:underline"
                      >
                        {cleanApiLink(conv.apiLink)}
                      </a>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(conv.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                <button
                  onClick={() => handleContinueConversation(selectedSessionId)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continue Conversation
                </button>
              </>
            ) : (
              <div className="text-gray-500 italic">Select a conversation to view details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistoryModal