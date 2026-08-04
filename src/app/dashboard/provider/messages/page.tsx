"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Send, Phone, MoreVertical, Paperclip, Smile, Check, CheckCheck, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getUserChats, getMessagesByBookingId, sendChatMessage } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
}

interface Chat {
  id: string;
  client_id: string;
  provider_id: string;
  listing_id: string;
  profiles: {
    full_name: string;
  };
  listings: {
    title: string;
  };
}

export default function MessagesPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchUserAndChats = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) return;
      setUserId(user.id);

      const chatsData = await getUserChats();
      setChats(chatsData as unknown as Chat[]);
      if (chatsData && chatsData.length > 0) setActiveChat(chatsData[0] as unknown as Chat);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (bookingId: string) => {
    try {
      const messagesData = await getMessagesByBookingId(bookingId);
      setMessages(messagesData as unknown as Message[]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      fetchUserAndChats();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!activeChat) return;
    const id = setTimeout(() => {
      fetchMessages(activeChat.id);
    }, 0);
    const interval = setInterval(() => {
      fetchMessages(activeChat.id);
    }, 3000);
    return () => {
      clearTimeout(id);
      clearInterval(interval);
    };
  }, [activeChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !userId || isSending) return;

    setIsSending(true);
    try {
      const sent = await sendChatMessage(activeChat.id, newMessage.trim());
      if (sent) {
        setMessages(prev => [...prev, {
          id: String(sent.id || ""),
          booking_id: String(sent.booking_id || ""),
          sender_id: String(sent.sender_id || ""),
          content: String(sent.content || ""),
          created_at: sent.created_at ? new Date(sent.created_at as string).toISOString() : new Date().toISOString(),
          read_at: sent.read_at ? new Date(sent.read_at as string).toISOString() : undefined
        }]);
      }
      setNewMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-160px)] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6" dir="rtl">
      {/* Chats List */}
      <Card className="w-96 border-0 shadow-sm flex flex-col overflow-hidden bg-card">
        <div className="p-6 border-b border-border space-y-4 text-right">
           <h2 className="text-xl font-bold">المحادثات</h2>
           <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input className="h-10 pr-10 text-sm text-right" placeholder="ابحث عن محادثة..." />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-black/5">
           {chats.length > 0 ? chats.map((chat) => (
             <button 
               key={chat.id}
               onClick={() => setActiveChat(chat)}
               className={cn(
                 "w-full p-4 flex gap-4 transition-colors text-right",
                 activeChat?.id === chat.id ? "bg-primary/5" : "hover:bg-primary/5"
               )}
             >
               <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                     {chat.profiles?.full_name?.[0] || "؟"}
                  </div>
               </div>
               <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-center">
                     <span className="font-bold text-sm truncate">{chat.profiles?.full_name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.listings?.title}</p>
               </div>
             </button>
           )) : (
             <div className="p-10 text-center text-muted-foreground text-sm">لا توجد محادثات نشطة</div>
           )}
        </div>
      </Card>

      {/* Chat Window */}
      {activeChat ? (
        <Card className="flex-1 border-0 shadow-sm flex flex-col overflow-hidden relative">
          {/* Chat Header */}
          <div className="p-6 border-b border-border flex items-center justify-between bg-card dark:bg-zinc-900 z-10">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground text-lg">
                   {activeChat.profiles?.full_name?.[0]}
                </div>
                <div className="text-right">
                   <div className="font-bold">{activeChat.profiles?.full_name}</div>
                   <div className="text-xs text-muted-foreground">{activeChat.listings?.title}</div>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <Button variant="ghost" className="p-2"><Phone size={20} /></Button>
                <Button variant="ghost" className="p-2"><MoreVertical size={20} /></Button>
             </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 diagonal-bg bg-secondary/50 flex flex-col"
          >
             {messages.map((msg) => (
               <motion.div 
                 key={msg.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={cn(
                   "flex flex-col max-w-[70%]",
                   msg.sender_id === userId ? "mr-auto items-start" : "ml-auto items-end"
                 )}
               >
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed text-right",
                    msg.sender_id === userId 
                      ? "bg-primary text-white rounded-tl-none shadow-lg shadow-primary/20" 
                      : "bg-card border border-border rounded-tr-none text-foreground shadow-sm"
                  )}>
                     {msg.content}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground px-2">
                     {new Date(msg.created_at).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                     {msg.sender_id === userId && (
                       msg.read_at ? <CheckCheck size={12} className="text-primary" /> : <Check size={12} />
                     )}
                  </div>
               </motion.div>
             ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-6 border-t border-border bg-card dark:bg-zinc-950 flex gap-4">
             <Button type="button" variant="ghost" className="p-2 text-muted-foreground"><Paperclip size={20} /></Button>
             <div className="relative flex-1">
                <Input 
                  className="h-12 pr-4 pl-12 text-sm bg-secondary border-0 focus-visible:ring-primary/20 text-right" 
                  placeholder="اكتب رسالتك هنا..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  dir="rtl"
                />
                <Button type="button" variant="ghost" className="absolute left-1 top-1/2 -translate-y-1/2 p-2 text-muted-foreground">
                  <Smile size={20} />
                </Button>
             </div>
             <Button 
               type="submit" 
               variant="brutal" 
               className="h-12 w-12 p-0 rounded-xl"
               disabled={isSending || !newMessage.trim()}
             >
                {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="rotate-180" />}
             </Button>
          </form>
        </Card>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-secondary rounded-3xl border-2 border-dashed border-border">
           <div className="text-center space-y-4">
              <div className="text-6xl">💬</div>
              <h3 className="text-xl font-bold">اختر محادثة للبدء</h3>
              <p className="text-muted-foreground">تواصل مع الزبائن والشركاء بسهولة</p>
           </div>
        </div>
      )}
    </div>
  );
}
