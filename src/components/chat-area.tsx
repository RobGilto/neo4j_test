"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Edit2, Check, X, Loader2 } from "lucide-react"
import type { Conversation, Message } from "@/components/chat-app"

interface ChatAreaProps {
  conversation: Conversation | null
  onSendMessage: (content: string) => void
  onEditMessage: (messageId: string, content: string) => void
  onToggleEditing: (messageId: string) => void
  isProcessing: boolean
}

export function ChatArea({ conversation, onSendMessage, onEditMessage, onToggleEditing, isProcessing }: ChatAreaProps) {
  const [inputValue, setInputValue] = useState("")
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Debug: Log conversation messages whenever they change
  useEffect(() => {
    if (conversation) {
      console.log("Current conversation messages:", conversation.messages)
    }
  }, [conversation])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [conversation?.messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputValue])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      console.log("Sending message:", inputValue.trim())
      onSendMessage(inputValue.trim())
      setInputValue("")
      // Force focus back to textarea after sending
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startEditing = (message: Message) => {
    onToggleEditing(message.id)
    setEditValues({
      ...editValues,
      [message.id]: message.content,
    })
  }

  const saveEdit = (messageId: string) => {
    const newContent = editValues[messageId]
    if (newContent && newContent.trim()) {
      onEditMessage(messageId, newContent)
    }
  }

  const cancelEdit = (messageId: string) => {
    onToggleEditing(messageId)
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p>No conversation selected</p>
          <p className="text-sm">Create a new conversation or select an existing one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto">
          {conversation.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <h3 className="text-lg font-medium">Start a new conversation</h3>
              <p className="text-sm">Send a message to begin chatting with the AI assistant</p>
            </div>
          ) : (
            conversation.messages.map((message) => (
              <div key={message.id} className="mb-6">
                <div className="flex items-center mb-1">
                  <span className="text-xs font-medium">{message.role === "user" ? "You" : "AI Assistant"}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                  {!message.isEditing && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 ml-1 opacity-0 hover:opacity-100 focus:opacity-100"
                      onClick={() => startEditing(message)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div
                  className={`
                  p-3 rounded-lg max-w-2xl
                  ${message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}
                `}
                >
                  {message.isEditing ? (
                    <div>
                      <Textarea
                        value={editValues[message.id] || message.content}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [message.id]: e.target.value,
                          })
                        }
                        className="min-h-[100px] mb-2"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => cancelEdit(message.id)}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => saveEdit(message.id)}>
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
              </div>
            ))
          )}

          {isProcessing && (
            <div className="flex items-center text-muted-foreground mb-6">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="max-w-3xl mx-auto flex">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="resize-none min-h-[60px] max-h-[200px]"
            disabled={isProcessing}
          />
          <Button className="ml-2 self-end" onClick={handleSendMessage} disabled={!inputValue.trim() || isProcessing}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
