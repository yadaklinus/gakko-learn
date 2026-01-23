
import React, { useState } from 'react';
import { Search, Send, ArrowLeft, MoreVertical, Paperclip } from 'lucide-react';

const MOCK_CHATS = [
  { id: '1', name: 'Ngozi Eze', lastMessage: 'Great work today on those integrals!', time: '2m ago', unread: 1, avatar: 'ngozi' },
  { id: '2', name: 'Tunde Bakare', lastMessage: 'I sent you the Python script.', time: '1h ago', unread: 0, avatar: 'tunde' },
  { id: '3', name: 'Ifeoma Okoro', lastMessage: 'See you tomorrow at 4?', time: '3h ago', unread: 0, avatar: 'ifeoma' },
];

const MessagesView: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<typeof MOCK_CHATS[0] | null>(null);
  const [messageText, setMessageText] = useState('');

  if (selectedChat) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 animate-in slide-in-from-right duration-300">
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSelectedChat(null)} className="p-1 hover:bg-slate-100 rounded-lg">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img src={`https://picsum.photos/seed/${selectedChat.avatar}/200`} alt={selectedChat.name} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">{selectedChat.name}</h3>
              <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Online</p>
            </div>
          </div>
          <button className="text-slate-400">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-center">
            <span className="bg-slate-200 text-slate-500 text-[10px] px-2 py-1 rounded-full font-medium uppercase tracking-tighter">Today</span>
          </div>
          <div className="flex items-start space-x-2 max-w-[80%]">
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
              <p className="text-sm text-slate-800">Hi! Are we still on for the session tomorrow at 4 PM?</p>
              <span className="text-[10px] text-slate-400 block mt-1">10:45 AM</span>
            </div>
          </div>
          <div className="flex items-start space-x-2 max-w-[80%] ml-auto flex-row-reverse space-x-reverse">
            <div className="bg-indigo-600 p-3 rounded-2xl rounded-tr-none shadow-sm">
              <p className="text-sm text-white">Yes, I'll be there! Bringing my textbook.</p>
              <span className="text-[10px] text-indigo-200 block mt-1 text-right">10:48 AM</span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200 pb-28 md:pb-28">
          <div className="flex items-center space-x-3 bg-slate-100 rounded-2xl p-2 pr-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button className="bg-indigo-600 text-white p-2 rounded-xl shadow-md">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <button className="p-2 bg-slate-100 rounded-full">
          <Search size={20} className="text-slate-600" />
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_CHATS.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            className="bg-white border border-slate-200 p-4 rounded-3xl flex items-center space-x-4 cursor-pointer hover:border-indigo-200 transition-colors shadow-sm"
          >
            <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-100 flex-shrink-0">
              <img src={`https://picsum.photos/seed/${chat.avatar}/200`} alt={chat.name} className="object-cover w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-slate-900 truncate">{chat.name}</h3>
                <span className="text-[10px] text-slate-400 font-medium">{chat.time}</span>
              </div>
              <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
            </div>
            {chat.unread > 0 && (
              <div className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {chat.unread}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagesView;
