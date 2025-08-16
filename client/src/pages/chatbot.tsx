import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import MobileLayout from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Bot, 
  User, 
  Send, 
  Paperclip,
  Lock,
  CalendarPlus,
  Heart
} from "lucide-react";
import { useLocation } from "wouter";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  suggestedActions?: string[];
}

export default function Chatbot() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([{
      id: "welcome",
      content: "Hello! I'm here to support your mental health. How are you feeling today?",
      isBot: true,
      timestamp: new Date(),
    }]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { message });
      return response.json();
    },
    onSuccess: (data) => {
      const botMessage: Message = {
        id: Date.now().toString() + "_bot",
        content: data.response,
        isBot: true,
        timestamp: new Date(),
        suggestedActions: data.suggestedActions,
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    chatMutation.mutate(text);
  };

  const handleQuickResponse = (response: string) => {
    handleSendMessage(response);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <MobileLayout>
      <div className="max-w-lg mx-auto bg-white min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-6 text-white">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="p-2 -ml-2 hover:bg-white hover:bg-opacity-20 rounded-lg text-white hover:text-white"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bot className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Mental Health Assistant</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span className="text-sm text-green-100">Online & Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((message, index) => (
            <div key={message.id}>
              <div className={`flex items-start space-x-3 ${message.isBot ? '' : 'justify-end'}`}>
                {message.isBot && (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-green-600" size={16} />
                  </div>
                )}
                
                <div className={`max-w-xs rounded-2xl px-4 py-3 ${
                  message.isBot 
                    ? 'bg-gray-100 rounded-tl-md' 
                    : 'bg-green-500 text-white rounded-tr-md'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.isBot ? 'text-gray-500' : 'text-green-100'
                  }`}>
                    {message.timestamp.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>

                {!message.isBot && (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-primary-600" size={16} />
                  </div>
                )}
              </div>

              {/* Quick Response Options - show after first bot message */}
              {message.isBot && index === 0 && (
                <div className="flex flex-wrap gap-2 px-11 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickResponse("I'm feeling anxious")}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-xs px-3 py-2 rounded-full"
                  >
                    I'm feeling anxious
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickResponse("I'm sad")}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-xs px-3 py-2 rounded-full"
                  >
                    I'm sad
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickResponse("I'm stressed")}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-xs px-3 py-2 rounded-full"
                  >
                    I'm stressed
                  </Button>
                </div>
              )}

              {/* Suggested Actions */}
              {message.suggestedActions && message.suggestedActions.length > 0 && (
                <Card className="mx-4 mt-3 bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Suggested Actions</h4>
                    <div className="space-y-2">
                      {message.suggestedActions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start bg-white border-blue-200 hover:border-blue-300 text-sm"
                          onClick={() => {
                            if (action.includes("consultation")) {
                              navigate("/video-consultation");
                            } else if (action.includes("appointment")) {
                              navigate("/appointments");
                            } else if (action.includes("meditation")) {
                              navigate("/reminders");
                            }
                          }}
                        >
                          {action.includes("consultation") && <CalendarPlus className="text-blue-600 mr-2" size={16} />}
                          {action.includes("appointment") && <CalendarPlus className="text-blue-600 mr-2" size={16} />}
                          {action.includes("meditation") && <Heart className="text-blue-600 mr-2" size={16} />}
                          {action}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
          
          {chatMutation.isPending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-green-600" size={16} />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Paperclip size={16} />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={chatMutation.isPending}
              />
            </div>
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || chatMutation.isPending}
              className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-colors"
            >
              <Send size={16} />
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center space-x-1">
            <Lock size={12} />
            <span>Your conversations are private and secure</span>
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
