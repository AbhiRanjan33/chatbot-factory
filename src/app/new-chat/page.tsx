"use client"

import type React from "react"
import { useState, useEffect, type FormEvent } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
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

const NewChat: React.FC = () => {
  const [message, setMessage] = useState<string>("")
  const [files, setFiles] = useState<File[] | null>(null)
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [sessionId, setSessionId] = useState<string>("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getToken, isSignedIn } = useAuth()
  const backendUrl = "https://my-chatbot-factory.onrender.com/api/v1"
  const apiUrl = "/api/conversations"

  useEffect(() => {
    // Initialize or resume session
    const resumeSessionId = searchParams.get("sessionId")
    let currentSessionId = resumeSessionId || localStorage.getItem("chatSessionId")

    if (!currentSessionId || !resumeSessionId) {
      currentSessionId = uuidv4()
      localStorage.setItem("chatSessionId", currentSessionId)
      localStorage.setItem(`conversations_${currentSessionId}`, JSON.stringify([]))
    }
    setSessionId(currentSessionId)

    // Load conversations for this session
    const savedConversations = localStorage.getItem(`conversations_${currentSessionId}`)
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations))
    } else if (resumeSessionId) {
      // Fetch session conversations from backend if resuming
      fetchSessionConversations(resumeSessionId)
    }
  }, [searchParams])

  const fetchSessionConversations = async (sessionId: string) => {
    try {
      const token = await getToken()
      const response = await fetch(`${apiUrl}?sessionId=${encodeURIComponent(sessionId)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setConversations(data)
        localStorage.setItem(`conversations_${sessionId}`, JSON.stringify(data))
      } else {
        setError("Failed to load session history.")
      }
    } catch (err) {
      setError("Error loading session history.")
    }
  }

  const handleNewChat = async () => {
    if (conversations.length > 0) {
      // Save current session to backend
      try {
        const token = await getToken()
        await Promise.all(
          conversations.map((conv) =>
            fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(conv),
            }),
          ),
        )
      } catch (err) {
        console.error("Failed to save session:", err)
      }
    }
    // Clear current session
    localStorage.removeItem(`conversations_${sessionId}`)
    const newSessionId = uuidv4()
    localStorage.setItem("chatSessionId", newSessionId)
    localStorage.setItem(`conversations_${newSessionId}`, JSON.stringify([]))
    setSessionId(newSessionId)
    setConversations([])
    setMessage("")
    setFiles(null)
    setResult("")
    setError("")
    router.push("/new-chat")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      const validFiles = selectedFiles.filter((file) => file.type === "application/pdf" || file.type === "text/plain")
      if (validFiles.length === selectedFiles.length) {
        setFiles(validFiles)
        setError("")
      } else {
        setError("Please upload only PDF or TXT files.")
        setFiles(null)
      }
    } else {
      setFiles(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isSignedIn) {
      setError("Please sign in to create a chatbot")
      return
    }
    if (!message && !files) {
      setError("Please enter a message or upload at least one file.")
      return
    }
    setError("")
    setResult("")
    setIsLoading(true)

    try {
      const clerkToken = await getToken()
      const loginResponse = await fetch(`${backendUrl}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      })
      if (!loginResponse.ok) {
        throw new Error("Login failed")
      }
      const loginData = await loginResponse.json()
      const renderToken = loginData.token

      const botName = `Chatbot-${Date.now()}`
      const prompt = `User: ${message || "File upload"}\n${files ? `Files: ${JSON.stringify(files.map((f) => f.name))}\n` : ""}`

      const createResponse = await fetch(`${backendUrl}/chatbots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${renderToken}`,
        },
        body: JSON.stringify({
          name: botName,
          prompt,
        }),
      })
      const createData = await createResponse.json()
      if (createData.status !== "success") {
        throw new Error("Chatbot creation failed")
      }
      const { chatbot, response } = createData.data
      const apiEndpoint = `${backendUrl}${chatbot.apiEndpoint.startsWith("/api/v1") ? chatbot.apiEndpoint.slice(7) : chatbot.apiEndpoint}`

      let fileNames: string[] = []
      if (files && files.length > 0) {
        const formData = new FormData()
        files.forEach((file) => formData.append("file", file))
        const uploadResponse = await fetch(`${backendUrl}/chatbots/${chatbot._id}/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${renderToken}`,
          },
          body: formData,
        })
        const uploadData = await uploadResponse.json()
        if (uploadData.status !== "success") {
          throw new Error("File upload failed")
        }
        fileNames = files.map((file) => file.name)
      }

      const conversation: Conversation = {
        prompt: message || "File upload",
        apiLink: apiEndpoint,
        files: fileNames,
        response,
        createdAt: new Date().toISOString(),
        sessionId,
      }

      // Update local conversations
      const updatedConversations = [...conversations, conversation]
      setConversations(updatedConversations)
      localStorage.setItem(`conversations_${sessionId}`, JSON.stringify(updatedConversations))

      setResult(`Chatbot created successfully!\nYour API Endpoint: ${apiEndpoint}\nResponse: ${response}`)
      setMessage("")
      setFiles(null)
    } catch (err) {
      console.error("Error:", err)
      setError("Failed to create chatbot. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const cleanApiLink = (apiLink: string): string => {
    const doubleApiV1 = "/api/v1/api/v1/"
    if (apiLink.includes(doubleApiV1)) {
      const index = apiLink.indexOf(doubleApiV1)
      return apiLink.slice(0, index + 7) + apiLink.slice(index + 14)
    }
    return apiLink
  }

  if (!isSignedIn) {
    return <AuthPromptModal />
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-300">
      <Navbar onNewChat={handleNewChat} />
      <div className="flex-1 max-w-2xl mx-auto w-full p-4 flex flex-col">
        <div className="flex-1 bg-gray-900 rounded-lg shadow-lg border border-blue-500/30 p-4 mb-4 overflow-y-auto">
          {conversations.length > 0 ? (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div
                  key={`${conv.createdAt}-${conv.prompt}`}
                  className="border-b border-gray-700 py-3 px-3 rounded-md hover:bg-gray-800/50 transition-all"
                >
                  <p className="text-blue-400 font-semibold mb-1">Prompt:</p>
                  <p className="text-gray-300 mb-2">{conv.prompt}</p>
                  <p className="text-blue-400 font-semibold mb-1">Response:</p>
                  <p className="text-gray-300 mb-2">{conv.response || "No response available"}</p>
                  <p className="text-blue-400 font-semibold mb-1">API Endpoint:</p>
                  <p className="text-gray-300 mb-2">
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
                    <>
                      <p className="text-blue-400 font-semibold mb-1">Files:</p>
                      <p className="text-gray-300 mb-2">{conv.files.join(", ")}</p>
                    </>
                  )}
                  <p className="text-gray-500 text-sm">{new Date(conv.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic flex items-center justify-center h-full">
              Start a new conversation...
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
              disabled={isLoading}
            />
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
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:bg-gray-900 border border-gray-700"
                onClick={() => document.getElementById("file")?.click()}
                disabled={isLoading}
              >
                📎
              </button>
            </label>
            {files && files.length > 0 && (
              <span className="text-sm text-blue-400 ml-2 absolute -bottom-6 left-0 whitespace-nowrap">
                {files.length > 1 ? `${files.length} files selected` : files[0].name}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || (!message && !files)}
            className={`px-4 py-2 rounded-lg text-white font-semibold ${
              isLoading || (!message && !files) ? "bg-blue-800/50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default NewChat