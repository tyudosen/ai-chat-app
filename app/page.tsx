"use client"

import { useChat } from "@ai-sdk/react"
import { Paperclip, Send } from "lucide-react"
import Image from "next/image"
import { useState, useRef } from "react"

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 3
  })

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      {/* Chat header */}
      <header className="p-4 border-b">
        <h1 className="text-xl font-semibold text-center">AI Chat</h1>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-zinc-400">
            <p>Send a message to start chatting</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-lg ${message.role === "user"
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-zinc-200 text-zinc-800 rounded-bl-none"
                }`}
            >
              {message.content ? message.content : <span className="italic font-light">{`calling tool: ${message?.toolInvocations?.[0].toolName}`}</span>}
              <div>
                {message?.experimental_attachments
                  ?.filter(attachment =>
                    attachment?.contentType?.startsWith('image/'),
                  )
                  .map((attachment, index) => attachment.contentType?.startsWith('image/') ? (
                    <Image
                      key={`${message.id}-${index}`}
                      src={attachment.url}
                      width={500}
                      height={500}
                      alt={attachment.name ?? `attachment-${index}`}
                    />
                  ) : attachment.contentType?.startsWith('application/pdf') ? (<iframe
                    key={`${message.id}-${index}`}
                    src={attachment.url}
                    width={500}
                    height={600}
                    title={attachment.name ?? `attachment-${index}`}
                  />) : null,)}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-200 text-zinc-800 p-3 rounded-lg rounded-bl-none max-w-[80%]">
              <div className="flex space-x-2">
                <div
                  className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <form onSubmit={(event) => {
          handleSubmit(event, {
            experimental_attachments: files
          })

          setFiles(undefined)

          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }}
          className="flex space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-zinc-500 hover:text-blue-500 transition-colors"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setFiles(e.target.files || undefined)}
            className="hidden"
            multiple
          />
          {files && files.length > 0 && (
            <div className="flex items-center text-sm text-zinc-500">{files.length} file(s) selected</div>
          )}
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={isLoading || (!input.trim() && (!files || files.length === 0))}
          >
            <Send size={20} />
          </button>        </form>
      </div>
    </div>
  )
}

