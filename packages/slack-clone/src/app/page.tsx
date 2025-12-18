'use client';

import { useState, useEffect } from 'react';

interface Channel {
  id: string;
  name: string;
}

interface Message {
  id: string;
  channelId: string;
  text: string;
  timestamp: number;
  author: string;
}

export default function SlackClone() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [newChannelName, setNewChannelName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showChannelInput, setShowChannelInput] = useState(false);
  const [vipUsers, setVipUsers] = useState<string[]>([]);
  const [newVipName, setNewVipName] = useState('');
  const [showVipInput, setShowVipInput] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedChannels = localStorage.getItem('slack-channels');
    const savedMessages = localStorage.getItem('slack-messages');
    const savedActiveChannel = localStorage.getItem('slack-active-channel');
    const savedVipUsers = localStorage.getItem('slack-vip-users');

    if (savedChannels) {
      const parsedChannels = JSON.parse(savedChannels);
      setChannels(parsedChannels);
      
      if (savedActiveChannel) {
        setActiveChannelId(savedActiveChannel);
      } else if (parsedChannels.length > 0) {
        setActiveChannelId(parsedChannels[0].id);
      }
    } else {
      // Create default channel
      const defaultChannel = { id: '1', name: 'general' };
      setChannels([defaultChannel]);
      setActiveChannelId(defaultChannel.id);
      localStorage.setItem('slack-channels', JSON.stringify([defaultChannel]));
      localStorage.setItem('slack-active-channel', defaultChannel.id);
    }

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    if (savedVipUsers) {
      setVipUsers(JSON.parse(savedVipUsers));
    }
  }, []);

  // Save to localStorage whenever channels or messages change
  useEffect(() => {
    if (channels.length > 0) {
      localStorage.setItem('slack-channels', JSON.stringify(channels));
    }
  }, [channels]);

  useEffect(() => {
    localStorage.setItem('slack-messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (activeChannelId) {
      localStorage.setItem('slack-active-channel', activeChannelId);
    }
  }, [activeChannelId]);

  useEffect(() => {
    localStorage.setItem('slack-vip-users', JSON.stringify(vipUsers));
  }, [vipUsers]);

  const createChannel = () => {
    if (!newChannelName.trim()) return;

    const newChannel: Channel = {
      id: Date.now().toString(),
      name: newChannelName.trim().toLowerCase().replace(/\s+/g, '-'),
    };

    setChannels([...channels, newChannel]);
    setActiveChannelId(newChannel.id);
    setNewChannelName('');
    setShowChannelInput(false);
  };

  const sendMessage = () => {
    if (!messageText.trim() || !activeChannelId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      channelId: activeChannelId,
      text: messageText.trim(),
      timestamp: Date.now(),
      author: 'You',
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  const addVipUser = () => {
    if (!newVipName.trim()) return;
    if (vipUsers.includes(newVipName.trim())) return;

    setVipUsers([...vipUsers, newVipName.trim()]);
    setNewVipName('');
    setShowVipInput(false);
  };

  const removeVipUser = (userName: string) => {
    setVipUsers(vipUsers.filter(u => u !== userName));
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  return (
    <div className="flex h-screen bg-[#1a1d21] text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#3f0e40] flex flex-col">
        <div className="p-4 border-b border-[#522653]">
          <h1 className="text-xl font-bold">Slack Clone</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Threads Section */}
          <div className="p-4 border-b border-[#522653]">
            <h2 className="text-sm font-semibold flex items-center gap-2 px-2 py-1 hover:bg-[#522653] rounded cursor-pointer">
              <span>💬</span> Threads
            </h2>
          </div>

          {/* Huddles Section */}
          <div className="p-4 border-b border-[#522653]">
            <h2 className="text-sm font-semibold flex items-center gap-2 px-2 py-1 hover:bg-[#522653] rounded cursor-pointer">
              <span>🎧</span> Huddles
            </h2>
          </div>

          {/* Drafts & Sent Section */}
          <div className="p-4 border-b border-[#522653]">
            <h2 className="text-sm font-semibold flex items-center gap-2 px-2 py-1 hover:bg-[#522653] rounded cursor-pointer">
              <span>📝</span> Drafts & sent
            </h2>
          </div>

          {/* Directories Section */}
          <div className="p-4 border-b border-[#522653]">
            <h2 className="text-sm font-semibold flex items-center gap-2 px-2 py-1 hover:bg-[#522653] rounded cursor-pointer">
              <span>📁</span> Directories
            </h2>
          </div>

          {/* VIP Section */}
          <div className="p-4 border-b border-[#522653]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold flex items-center gap-1">
                <span className="text-yellow-400">⭐</span> VIP
              </h2>
              <button
                onClick={() => setShowVipInput(!showVipInput)}
                className="text-xl hover:bg-[#522653] rounded px-2"
              >
                +
              </button>
            </div>

            {showVipInput && (
              <div className="mb-3">
                <input
                  type="text"
                  value={newVipName}
                  onChange={(e) => setNewVipName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addVipUser()}
                  placeholder="Name"
                  className="w-full px-2 py-1 text-sm bg-[#522653] rounded border-none outline-none"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={addVipUser}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowVipInput(false);
                      setNewVipName('');
                    }}
                    className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {vipUsers.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No VIPs yet</p>
              ) : (
                vipUsers.map((user) => (
                  <div
                    key={user}
                    className="flex items-center justify-between px-2 py-1 rounded hover:bg-[#522653] group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-yellow-500 flex items-center justify-center text-xs font-semibold text-black">
                        {user[0].toUpperCase()}
                      </div>
                      <span className="text-sm">{user}</span>
                    </div>
                    <button
                      onClick={() => removeVipUser(user)}
                      className="text-xs text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Channels</h2>
              <button
                onClick={() => setShowChannelInput(!showChannelInput)}
                className="text-xl hover:bg-[#522653] rounded px-2"
              >
                +
              </button>
            </div>

            {showChannelInput && (
              <div className="mb-3">
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createChannel()}
                  placeholder="channel-name"
                  className="w-full px-2 py-1 text-sm bg-[#522653] rounded border-none outline-none"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={createChannel}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowChannelInput(false);
                      setNewChannelName('');
                    }}
                    className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannelId(channel.id)}
                  className={`w-full text-left px-2 py-1 rounded text-sm ${
                    activeChannelId === channel.id
                      ? 'bg-[#1164a3] text-white'
                      : 'hover:bg-[#522653]'
                  }`}
                >
                  # {channel.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-gray-700 flex items-center px-4">
          <h2 className="text-lg font-semibold">
            {activeChannel ? `# ${activeChannel.name}` : 'Select a channel'}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {channelMessages.length === 0 ? (
            <div className="text-gray-400 text-center mt-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            channelMessages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div className="w-9 h-9 rounded bg-[#3f0e40] flex items-center justify-center font-semibold">
                  {message.author[0]}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold">{message.author}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm mt-1">{message.text}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        {activeChannelId && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Message #${activeChannel?.name}`}
                className="flex-1 px-4 py-2 bg-[#1a1d21] border border-gray-600 rounded outline-none focus:border-[#1164a3]"
              />
              <button
                onClick={sendMessage}
                className="px-6 py-2 bg-[#1164a3] hover:bg-[#0e5a8a] rounded font-semibold"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}







