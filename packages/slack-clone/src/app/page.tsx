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
      <div className="w-16 bg-[#2d1230] flex flex-col items-center py-4 gap-4">
        <button className="w-12 h-12 rounded-lg bg-[#3f0e40] hover:bg-[#522653] flex items-center justify-center text-xl">
          🏠
        </button>
        <button className="w-12 h-12 rounded-lg hover:bg-[#3f0e40] flex items-center justify-center text-xl">
          💬
        </button>
        <button className="w-12 h-12 rounded-lg hover:bg-[#3f0e40] flex items-center justify-center text-xl">
          🔔
        </button>
        <div className="relative">
          <button 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="w-12 h-12 rounded-lg hover:bg-[#3f0e40] flex items-center justify-center text-xl"
          >
            ⋯
          </button>
          {showMoreMenu && (
            <div className="absolute left-full ml-2 top-0 bg-[#1a1d21] border border-gray-700 rounded-lg shadow-lg py-2 w-48 z-50">
              <button className="w-full text-left px-4 py-2 hover:bg-[#3f0e40] flex items-center gap-3">
                <span>📁</span> Files
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#3f0e40] flex items-center gap-3">
                <span>🕐</span> Later
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#3f0e40] flex items-center gap-3">
                <span>🔧</span> Tools
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-[#3f0e40] w-12 my-2"></div>

        <button 
          className="w-12 h-12 rounded-lg hover:bg-[#3f0e40] flex items-center justify-center text-2xl"
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
              className="w-12 h-12 rounded-lg hover:bg-[#3f0e40] flex items-center justify-center overflow-hidden"
            >
              {userProfile.photoUrl ? (
                <img
                  src={userProfile.photoUrl}
                  alt={userProfile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#1164a3] flex items-center justify-center font-semibold text-lg">
                  {userProfile.displayName[0]?.toUpperCase()}
                </div>
              )}
            </button>
          )}
        </div>
      </div>

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
        <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4">
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
                {userProfile?.photoUrl ? (
                  <img
                    src={userProfile.photoUrl}
                    alt={message.author}
                    className="w-9 h-9 rounded object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded bg-[#1164a3] flex items-center justify-center font-semibold">
                    {message.author[0]}
                  </div>
                )}
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



      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            
            <div className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  {profileForm.photoUrl ? (
                    <img
                      src={profileForm.photoUrl}
                      alt="Profile"
                      className="w-20 h-20 rounded object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded bg-gray-300 flex items-center justify-center text-2xl font-semibold">
                      {profileForm.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <label className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
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
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500"
                  placeholder="johndoe"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={profileForm.title}
                  onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500"
                  placeholder="Software Engineer"
                />
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <select
                  value={profileForm.timezone}
                  onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500"
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
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                >
                  Save Profile
                </button>
                <button
                  onClick={() => setShowProfileEdit(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 font-semibold"
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























