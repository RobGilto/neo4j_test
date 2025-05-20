"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, MessageSquare, Settings, Edit2, Check, X, Trash2 } from "lucide-react"
import type { Conversation } from "@/components/chat-app"

interface SidebarProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onUpdateTitle: (id: string, title: string) => void
  onDeleteConversation: (id: string) => void
  onOpenSettings: () => void
}

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onUpdateTitle,
  onDeleteConversation,
  onOpenSettings,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id)
    setEditTitle(currentTitle)
  }

  const saveTitle = (id: string) => {
    if (editTitle.trim()) {
      onUpdateTitle(id, editTitle)
    }
    setEditingId(null)
  }

  const cancelEditing = () => {
    setEditingId(null)
  }

  return (
    <div className="w-64 bg-muted border-r flex flex-col h-full">
      <div className="p-4">
        <Button onClick={onNewConversation} className="w-full justify-start">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Conversation
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`
                group flex items-center justify-between p-2 rounded-md mb-1 cursor-pointer
                ${activeConversationId === conversation.id ? "bg-accent" : "hover:bg-accent/50"}
              `}
              onClick={() => editingId !== conversation.id && onSelectConversation(conversation.id)}
            >
              <div className="flex items-center flex-1 min-w-0">
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />

                {editingId === conversation.id ? (
                  <div className="flex items-center flex-1">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 ml-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        saveTitle(conversation.id)
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        cancelEditing()
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">{conversation.title}</span>
                    <div className="flex opacity-0 group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditing(conversation.id, conversation.title)
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteConversation(conversation.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button variant="outline" className="w-full justify-start" onClick={onOpenSettings}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  )
}
