"use client";

import React, { FormEvent, useState, useRef, useEffect } from "react";
import Image from "next/image";
import AppLogo from "@/assets/AppLogo.png";
import Bubble from "@/components/Bubble";
import LoadingBubble from "@/components/LoadingBubble";
import PromptSuggestionRow from "@/components/promptSuggestions";

// Simple message shape
export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const noMessages = messages.length === 0;

  // Append a message to the conversation
  const append = (msg: Message) => {
    setMessages((m) => [...m, msg]);
  };

  // Update the last assistant message (for streaming)
  const updateLastMessage = (content: string) => {
    setMessages((m) => {
      const newMessages = [...m];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        lastMessage.content = content;
      }
      return newMessages;
    });
  };

  // Called by PromptSuggestionRow when a suggestion is clicked
  const handlePrompt = (promptText: string) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: promptText,
    };
    append(msg);
    void sendMessageToBackend(promptText);
  };

  // Send a message to backend and handle streaming response
  const sendMessageToBackend = async (text: string) => {
    setIsLoading(true);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Send all messages including the new one
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: "user", content: text },
          ],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Backend returned an error");
      }

      // Handle streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedContent = "";
      let hasReceivedFirstChunk = false;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        // Only create the assistant message after receiving the first chunk
        if (!hasReceivedFirstChunk) {
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: accumulatedContent,
          };
          append(assistantMessage);
          hasReceivedFirstChunk = true;
          setIsLoading(false); // Stop showing loading bubble
        } else {
          updateLastMessage(accumulatedContent);
        }
      }

      // Ensure final content is set
      if (accumulatedContent) {
        updateLastMessage(accumulatedContent);
      } else {
        // If no content was received, show an error
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry — I received an empty response from the server.",
        };
        append(errorMessage);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Request was aborted");
        return;
      }

      console.error("Chat error:", err);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Sorry — I couldn't get a reply from the server. ${
          err instanceof Error ? err.message : ""
        }`,
      };
      append(errorMessage);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    append(userMessage);
    setInput("");
    await sendMessageToBackend(userMessage.content);
  };

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <main className="flex flex-col min-h-screen max-w-7xl mx-auto p-4 md:p-6 lg:p-8 bg-white dark:bg-slate-900">
      {/* Logo */}
      {/* <div className="flex justify-center my-6 md:my-8">
        <Image 
          src={AppLogo} 
          width={100} 
          alt="Cortex AI Logo" 
          className="w-40 md:w-60 drop-shadow-lg"
        />
      </div> */}

      {/* Chat Section */}
      <section 
        className={`flex-1 flex flex-col overflow-y-auto scroll-smooth mb-4 ${
          noMessages 
            ? "justify-center items-center px-4 py-8" 
            : "justify-start items-stretch gap-4 px-2 md:px-4 max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-300px)]"
        }`}
      >
        {noMessages ? (
          <>
            <h1 className="text-4xl md:text-3xl lg:text-4xl font-bold text-center text-blue-400 mb-4 font-serif">
              Cortex-AI
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-slate-300 text-center mb-2">
              Ask anything related to Cricket
            </p>
            <br />
            <PromptSuggestionRow onPromptClick={handlePrompt} />
          </>
        ) : (
          <>
            {messages.map((message, index) => (
              <Bubble key={`message-${index}`} message={message} />
            ))}
            {isLoading && <LoadingBubble />}
          </>
        )}
      </section>

      {/* Input Form */}
      <form 
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-3 p-4 md:p-5 bg-slate-800 border-2 border-slate-700 rounded-2xl shadow-lg sticky bottom-0 backdrop-blur-sm"
      >
        <input
          type="text"
          className="flex-1 px-4 py-3 md:px-5 md:py-3.5 bg-slate-900 border-2 border-slate-700 rounded-xl text-slate-100 text-base md:text-lg outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 placeholder:text-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
          onChange={(e) => setInput(e.target.value)}
          value={input}
          placeholder="Ask me Something..."
          aria-label="Chat input"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 md:px-8 md:py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base md:text-lg rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-blue-500"
        >
          Send
        </button>
      </form>
    </main>
  );
}