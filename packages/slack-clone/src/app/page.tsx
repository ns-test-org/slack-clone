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

interface UserProfile {
  fullName: string;
  displayName: string;
  title: string;
  timezone: string;
  photoUrl?: string;
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState<UserProfile>({
    fullName: '',
    displayName: '',
    title: '',
    timezone: '',
    photoUrl: '',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedChannels = localStorage.getItem('slack-channels');
    const savedMessages = localStorage.getItem('slack-messages');
    const savedActiveChannel = localStorage.getItem('slack-active-channel');
    const savedVipUsers = localStorage.getItem('slack-vip-users');
    const savedProfile = localStorage.getItem('slack-user-profile');

    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      // Show profile setup if no profile exists
      setShowProfileEdit(true);
    }

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
      author: userProfile?.displayName || 'You',
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    const profile = {
      fullName: profileForm.fullName,
      displayName: profileForm.displayName,
      title: profileForm.title,
      timezone: profileForm.timezone,
      photoUrl: profileForm.photoUrl,
    };
    setUserProfile(profile);
    localStorage.setItem('slack-user-profile', JSON.stringify(profile));
    setShowProfileEdit(false);
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  return (
    <div className="flex h-screen bg-[#1a1d21] text-white">
      {/* Left Navigation Column */}
      <div className="w-16 bg-[#3f0e40] flex flex-col items-center py-4 gap-4">
        <button className="w-10 h-10 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-xl shadow-sm transition-all">
          🏠
        </button>
        <button className="w-10 h-10 rounded-lg hover:bg-[#5a1f5c] flex items-center justify-center text-xl transition-all">
          💬
        </button>
        <button className="w-10 h-10 rounded-lg hover:bg-[#5a1f5c] flex items-center justify-center text-xl transition-all">
          🔔
        </button>
        <div className="relative">
          <button 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="w-10 h-10 rounded-lg hover:bg-[#5a1f5c] flex items-center justify-center text-xl transition-all"
          >
            ⋯
          </button>
          {showMoreMenu && (
            <div className="absolute left-full ml-2 top-0 bg-[#1a1d21] border border-gray-700 rounded-lg shadow-xl py-2 w-48 z-50">
              <button className="w-full text-left px-4 py-2 hover:bg-[#1164a3] flex items-center gap-3 transition-colors">
                <span>📁</span> Files
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#1164a3] flex items-center gap-3 transition-colors">
                <span>🕐</span> Later
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#1164a3] flex items-center gap-3 transition-colors">
                <span>🔧</span> Tools
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-[#5a1f5c] w-10 my-2"></div>

        <button 
          className="w-10 h-10 rounded-lg hover:bg-[#5a1f5c] flex items-center justify-center text-2xl transition-all"
        >
          +
        </button>

        {/* Profile Icon at Bottom */}
        <div className="mt-auto">
          {userProfile && (
            <button
              onClick={() => {
                setProfileForm(userProfile);
                setShowProfileEdit(true);
              }}
              className="w-10 h-10 rounded-lg hover:bg-[#5a1f5c] flex items-center justify-center overflow-hidden transition-all"
            >
              {userProfile.photoUrl ? (
                <img
                  src={userProfile.photoUrl}
                  alt={userProfile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#1164a3] flex items-center justify-center font-semibold text-sm text-white">
                  {userProfile.displayName[0]?.toUpperCase()}
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-[#3f0e40] flex flex-col">
        <div className="p-4 border-b border-[#5a1f5c]">
          <h1 className="text-lg font-bold text-white">Slack Clone</h1>
        </div>



        <div className="flex-1 overflow-y-auto">
          {/* Threads Section */}
          <div className="p-3 border-b border-[#5a1f5c]">
            <h2 className="text-sm font-medium flex items-center gap-2 px-2 py-1.5 hover:bg-[#5a1f5c] rounded cursor-pointer transition-colors text-white">
              <span>💬</span> Threads
            </h2>
          </div>

          {/* Huddles Section */}
          <div className="p-3 border-b border-[#5a1f5c]">
            <h2 className="text-sm font-medium flex items-center gap-2 px-2 py-1.5 hover:bg-[#5a1f5c] rounded cursor-pointer transition-colors text-white">
              <span>🎧</span> Huddles
            </h2>
          </div>

          {/* Drafts & Sent Section */}
          <div className="p-3 border-b border-[#5a1f5c]">
            <h2 className="text-sm font-medium flex items-center gap-2 px-2 py-1.5 hover:bg-[#5a1f5c] rounded cursor-pointer transition-colors text-white">
              <span>📝</span> Drafts & sent
            </h2>
          </div>

          {/* Directories Section */}
          <div className="p-3 border-b border-[#5a1f5c]">
            <h2 className="text-sm font-medium flex items-center gap-2 px-2 py-1.5 hover:bg-[#5a1f5c] rounded cursor-pointer transition-colors text-white">
              <span>📁</span> Directories
            </h2>
          </div>

          {/* VIP Section */}
          <div className="p-3 border-b border-[#5a1f5c]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium flex items-center gap-1 text-white">
                <span className="text-yellow-400">⭐</span> VIP
              </h2>
              <button
                onClick={() => setShowVipInput(!showVipInput)}
                className="text-lg hover:bg-[#5a1f5c] rounded px-2 transition-colors text-white"
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
                  className="w-full px-2 py-1 text-sm bg-[#1a1d21] border border-gray-600 rounded outline-none focus:border-[#1164a3] text-white transition-all"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={addVipUser}
                    className="px-3 py-1 text-xs bg-[#1164a3] hover:bg-[#0e5a8a] text-white rounded transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowVipInput(false);
                      setNewVipName('');
                    }}
                    className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
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
                    className="flex items-center justify-between px-2 py-1 rounded hover:bg-[#5a1f5c] group transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-yellow-500 flex items-center justify-center text-xs font-semibold text-black">
                        {user[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-white">{user}</span>
                    </div>
                    <button
                      onClick={() => removeVipUser(user)}
                      className="text-xs text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-white">Channels</h2>
              <button
                onClick={() => setShowChannelInput(!showChannelInput)}
                className="text-lg hover:bg-[#5a1f5c] rounded px-2 transition-colors text-white"
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
                  className="w-full px-2 py-1 text-sm bg-[#1a1d21] border border-gray-600 rounded outline-none focus:border-[#1164a3] text-white transition-all"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={createChannel}
                    className="px-3 py-1 text-xs bg-[#1164a3] hover:bg-[#0e5a8a] text-white rounded transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowChannelInput(false);
                      setNewChannelName('');
                    }}
                    className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
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
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                    activeChannelId === channel.id
                      ? 'bg-[#1164a3] text-white font-medium'
                      : 'hover:bg-[#5a1f5c] text-gray-300'
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
        <div className="h-14 border-b border-gray-700 flex items-center justify-between px-5">
          <h2 className="text-lg font-bold">
            {activeChannel ? `# ${activeChannel.name}` : 'Select a channel'}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {channelMessages.length === 0 ? (
            <div className="text-gray-400 text-center mt-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            channelMessages.map((message) => (
              <div key={message.id} className="flex gap-3 hover:bg-[#1a1d21]/50 -mx-2 px-2 py-1 rounded transition-colors">
                {userProfile?.photoUrl ? (
                  <img
                    src={userProfile.photoUrl}
                    alt={message.author}
                    className="w-9 h-9 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded bg-[#1164a3] flex items-center justify-center font-semibold flex-shrink-0">
                    {message.author[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-white">{message.author}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm mt-0.5 text-gray-200">{message.text}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        {activeChannelId && (
          <div className="p-5">
            <div className="flex gap-3">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Message #${activeChannel?.name}`}
                className="flex-1 px-4 py-2.5 bg-[#1a1d21] border border-gray-600 rounded-lg outline-none focus:border-[#1164a3] text-white placeholder-gray-400 transition-colors"
              />
              <button
                onClick={sendMessage}
                className="px-6 py-2.5 bg-[#1164a3] hover:bg-[#0e5a8a] rounded-lg font-semibold transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>



      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1a1d21] text-white rounded-lg p-6 w-full max-w-md border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold mb-5">Edit Profile</h2>
            
            <div className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Profile Photo</label>
                <div className="flex items-center gap-4">
                  {profileForm.photoUrl ? (
                    <img
                      src={profileForm.photoUrl}
                      alt="Profile"
                      className="w-20 h-20 rounded object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded bg-[#1164a3] flex items-center justify-center text-2xl font-semibold">
                      {profileForm.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <label className="px-4 py-2 bg-[#1164a3] text-white rounded-lg cursor-pointer hover:bg-[#0e5a8a] transition-colors">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d0f11] border border-gray-600 rounded-lg outline-none focus:border-[#1164a3] text-white transition-colors"
                  placeholder="John Doe"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Display Name</label>
                <input
                  type="text"
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d0f11] border border-gray-600 rounded-lg outline-none focus:border-[#1164a3] text-white transition-colors"
                  placeholder="johndoe"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Title</label>
                <input
                  type="text"
                  value={profileForm.title}
                  onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d0f11] border border-gray-600 rounded-lg outline-none focus:border-[#1164a3] text-white transition-colors"
                  placeholder="Software Engineer"
                />
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Timezone</label>
                <select
                  value={profileForm.timezone}
                  onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d0f11] border border-gray-600 rounded-lg outline-none focus:border-[#1164a3] text-white transition-colors"
                >
                  <option value="">Select timezone</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Anchorage">Alaska Time (AKT)</option>
                  <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Shanghai">Shanghai (CST)</option>
                  <option value="Australia/Sydney">Sydney (AEDT)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveProfile}
                  className="flex-1 px-4 py-2.5 bg-[#007a5a] text-white rounded-lg hover:bg-[#006644] font-semibold transition-colors"
                >
                  Save Profile
                </button>
                <button
                  onClick={() => setShowProfileEdit(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}








































