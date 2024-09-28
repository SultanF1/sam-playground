"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { SendHorizontal, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [markets, setMarkets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [predefinedQuestions, setPredefinedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef<string>(uuidv4());

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SAM_BE_URL}/markets/names`,
        );
        if (!response.ok) throw new Error("Failed to fetch markets");
        const data = await response.json();
        setMarkets(data);
      } catch (error) {
        console.error("Error fetching markets:", error);
      }
    };

    fetchMarkets();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedMarket) {
      fetchPredefinedQuestions(selectedMarket);
    }
  }, [selectedMarket]);

  const fetchPredefinedQuestions = async (market: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SAM_BE_URL}/markets/${market}/entry-questions`,
      );
      if (!response.ok) throw new Error("Failed to fetch predefined questions");
      const data = await response.json();
      setPredefinedQuestions(data);
    } catch (error) {
      console.error("Error fetching predefined questions:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !selectedMarket) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message.trim(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("chatId", chatIdRef.current);
      formData.append("message", newMessage.content);
      formData.append("market", selectedMarket.toString());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SAM_BE_URL}/chat`,
        {
          body: formData as BodyInit,
          method: "POST",
          redirect: "follow" as RequestRedirect,
        },
      );

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.text();
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const handlePredefinedQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <Select onValueChange={setSelectedMarket}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a market" />
          </SelectTrigger>
          <SelectContent>
            {markets.map((market) => (
              <SelectItem key={market.toString()} value={market.toString()}>
                {market.toString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card className="flex-grow mb-4 overflow-hidden">
        <ScrollArea className="h-full">
          <CardContent className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 ${
                    message.role === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <Avatar>
                    <AvatarFallback>
                      {message.role === "user" ? <User /> : <Bot />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg p-3 max-w-[70%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
        </ScrollArea>
      </Card>
      {predefinedQuestions.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {predefinedQuestions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handlePredefinedQuestionClick(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      )}
      <form onSubmit={handleFormSubmit} className="flex space-x-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message here..."
          disabled={isLoading || !selectedMarket}
        />
        <Button type="submit" disabled={isLoading || !selectedMarket}>
          {isLoading ? (
            <Bot className="w-4 h-4 animate-spin" />
          ) : (
            <SendHorizontal className="w-4 h-4" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
