"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Send, ArrowLeft, MoreVertical, Paperclip, BookOpen, Users } from 'lucide-react';

// TYPES
interface Conversation {
  id: string; // This can be bookingId or connectionId
  type: 'BOOKING' | 'CONNECTION';
  otherUser: { id: string; name: string; image: string | null };
  lastMessage: string;
  lastMessageTime: string;
  isUnread: boolean;
  contextLabel: string; // "Calculus II" or "General Chat"
}

interface Message {
  id: string;
  content: string;
  senderId: any;
  createdAt: string;
}

const MessagesView: React.FC = () => {
  const { data: session } = useSession();
  
  // Views
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Inputs & Loading
  const [isLoadingInbox, setIsLoadingInbox] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Load Inbox
  useEffect(() => {
    const fetchInbox = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch('/api/messages');
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations);
        }
      } catch (error) {
        console.error("Failed to load inbox", error);
      } finally {
        setIsLoadingInbox(false);
      }
    };
    fetchInbox();
  }, [session]);

  // 2. Load Messages when Chat Selected
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      setIsLoadingChat(true);
      try {
        const res = await fetch(`/api/messages/${activeChat.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Failed to load chat", error);
      } finally {
        setIsLoadingChat(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); 
    return () => clearInterval(interval);
    
  }, [activeChat]);

  // 3. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingChat]);

  // 4. Send Message Handler
  const handleSend = async () => {
    if (!inputText.trim() || !activeChat || !session) return;

    const tempId = Date.now().toString();
    const optimisticMessage: Message = {
        id: tempId,
        content: inputText,
        senderId: session.user.id,
        createdAt: new Date().toISOString()
    };

    // Optimistic Update
    setMessages(prev => [...prev, optimisticMessage]);
    setInputText('');

    try {
        await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: activeChat.id,
                type: activeChat.type,
                content: optimisticMessage.content
            })
        });
    } catch (error) {
        console.error("Failed to send", error);
        setMessages(prev => prev.filter(m => m.id !== tempId)); // Rollback
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- RENDER CHAT ---
  if (activeChat) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] md:h-screen bg-slate-50 animate-in slide-in-from-right duration-300 relative z-50">
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button onClick={() => setActiveChat(null)} className="p-1 hover:bg-slate-100 rounded-lg">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 relative">
               <img 
                 src={activeChat.otherUser.image || `https://ui-avatars.com/api/?name=${activeChat.otherUser.name}`} 
                 alt="User" 
                 className="w-full h-full object-cover"
               />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">{activeChat.otherUser.name}</h3>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider flex items-center">
                {activeChat.type === 'BOOKING' ? <BookOpen size={10} className="mr-1"/> : <Users size={10} className="mr-1"/>}
                {activeChat.contextLabel}
              </p>
            </div>
          </div>
          <button className="text-slate-400"><MoreVertical size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
          {isLoadingChat && (
              <div className="flex justify-center mt-10"><span className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full"></span></div>
          )}
          
          {messages.map((msg) => {
             const isMe = msg.senderId === session?.user?.id;
             return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                        isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}>
                        <p className="text-sm">{msg.content}</p>
                        <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {formatTime(msg.createdAt)}
                        </span>
                    </div>
                </div>
             );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-200 fixed bottom-20 md:bottom-0 left-0 w-full md:static">
          <div className="flex items-center space-x-3 bg-slate-100 rounded-2xl p-2 pr-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600"><Paperclip size={20} /></button>
            <input
              type="text"
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 focus:outline-none"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={!inputText.trim()} className="bg-indigo-600 text-white p-2 rounded-xl shadow-md disabled:opacity-50">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- INBOX VIEW ---
  return (
    <div className="p-5 animate-in fade-in duration-500 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <button className="p-2 bg-slate-100 rounded-full"><Search size={20} className="text-slate-600" /></button>
      </div>

      <div className="space-y-4">
        {isLoadingInbox && <div className="text-center py-10"><span className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full inline-block"></span></div>}

        {!isLoadingInbox && conversations.length === 0 && (
            <p className="text-slate-400 text-center mt-10">No messages yet. Connect with a tutor or book a session!</p>
        )}

        {conversations.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setActiveChat(chat)}
            className="bg-white border border-slate-200 p-4 rounded-3xl flex items-center space-x-4 cursor-pointer hover:border-indigo-200 transition-colors shadow-sm"
          >
            <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-200 relative">
               <img 
                 src={chat.otherUser.image || `https://ui-avatars.com/api/?name=${chat.otherUser.name}`} 
                 alt={chat.otherUser.name} 
                 className="object-cover w-full h-full" 
               />
               <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full">
                  {chat.type === 'BOOKING' ? <BookOpen size={10} className="text-indigo-600"/> : <Users size={10} className="text-emerald-500"/>}
               </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-slate-900 truncate">{chat.otherUser.name}</h3>
                <span className="text-[10px] text-slate-400 font-medium">{new Date(chat.lastMessageTime).toLocaleDateString()}</span>
              </div>
              <p className={`text-xs truncate ${chat.isUnread ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                 {chat.lastMessage}
              </p>
            </div>
            {chat.isUnread && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagesView;