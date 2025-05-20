"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Sidebar } from "@/components/sidebar"
import { ChatArea } from "@/components/chat-area"
import { SettingsModal } from "@/components/settings-modal"
import { useToast } from "@/hooks/use-toast"
import { nanoid } from "nanoid"

export type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  isEditing?: boolean
}

export type Conversation = {
  id: string
  title: string
  messages: Message[]
  lastUpdated: Date
  isActive?: boolean
}

export type Settings = {
  apiKey: string
  apiUrl: string
  model: string
  documents: File[]
}

export default function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    apiKey: "",
    apiUrl: "https://api.openai.com/v1",
    model: "gpt-4",
    documents: [],
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  // Create a new conversation
  const createNewConversation = () => {
    const newId = nanoid()
    const newConversation: Conversation = {
      id: newId,
      title: "New Conversation",
      messages: [],
      lastUpdated: new Date(),
    }

    setConversations((prevConversations) => [newConversation, ...prevConversations])
    setActiveConversationId(newId)
  }

  // Initialize with a default conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation()
    }
  }, [conversations.length])

  // Get the active conversation
  const activeConversation = conversations.find((conv) => conv.id === activeConversationId) || null

  // Update conversation title
  const updateConversationTitle = (id: string, newTitle: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) => (conv.id === id ? { ...conv, title: newTitle, lastUpdated: new Date() } : conv)),
    )
  }

  // Delete conversation
  const deleteConversation = (id: string) => {
    setConversations((prevConversations) => prevConversations.filter((conv) => conv.id !== id))
    if (activeConversationId === id) {
      setActiveConversationId(
        conversations.length > 1 ? conversations.find((conv) => conv.id !== id)?.id || null : null,
      )
    }
  }

  // Add message to conversation
  const addMessage = (conversationId: string, role: "user" | "assistant" | "system", content: string) => {
    console.log(`Adding ${role} message to conversation ${conversationId}: ${content}`)

    const newMessage: Message = {
      id: nanoid(),
      role,
      content,
      timestamp: new Date(),
    }

    setConversations((prevConversations) => {
      // Find the conversation to update
      const updatedConversations = prevConversations.map((conv) => {
        if (conv.id === conversationId) {
          // Create a new conversation object with the new message added
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastUpdated: new Date(),
            title: conv.messages.length === 0 && role === "user" ? content.slice(0, 30) + "..." : conv.title,
          }
        }
        return conv
      })

      console.log("Updated conversations:", updatedConversations)
      return updatedConversations
    })

    // Simulate AI response
    if (role === "user") {
      setIsProcessing(true)
      setTimeout(() => {
        addMessage(
          conversationId,
          "assistant",
          "This is a simulated response from the AI assistant. In a real implementation, this would be the response from the OpenAI API.",
        )
        setIsProcessing(false)
      }, 2000)
    }
  }

  // Edit message
  const editMessage = (conversationId: string, messageId: string, newContent: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === messageId ? { ...msg, content: newContent, isEditing: false } : msg,
              ),
              lastUpdated: new Date(),
            }
          : conv,
      ),
    )
  }

  // Toggle message editing state
  const toggleMessageEditing = (conversationId: string, messageId: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === messageId ? { ...msg, isEditing: !msg.isEditing } : msg,
              ),
            }
          : conv,
      ),
    )
  }

  // Update settings
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings({ ...settings, ...newSettings })
  }

  // Handle document upload
  const handleDocumentUpload = (files: File[]) => {
    setIsProcessing(true)
    // Simulate document processing
    setTimeout(() => {
      setSettings({
        ...settings,
        documents: [...settings.documents, ...files],
      })
      setIsProcessing(false)
      toast({
        title: "Documents processed",
        description: `${files.length} document(s) have been processed and added to the vector database.`,
      })
    }, 3000)
  }

  return (
    <div className="flex flex-col h-screen">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewConversation={createNewConversation}
          onUpdateTitle={updateConversationTitle}
          onDeleteConversation={deleteConversation}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <ChatArea
          conversation={activeConversation}
          onSendMessage={(content) => {
            if (activeConversationId) {
              console.log("Sending user message:", content)
              addMessage(activeConversationId, "user", content)
            }
          }}
          onEditMessage={(messageId, content) =>
            activeConversationId && editMessage(activeConversationId, messageId, content)
          }
          onToggleEditing={(messageId) => activeConversationId && toggleMessageEditing(activeConversationId, messageId)}
          isProcessing={isProcessing}
        />
      </div>

      <AppFooter />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onDocumentUpload={handleDocumentUpload}
        isProcessing={isProcessing}
      />
    </div>
  )
}
