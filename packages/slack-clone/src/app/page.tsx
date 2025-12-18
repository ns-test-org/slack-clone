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

type ViewMode = 'single' | 'split2' | 'split4';

interface PaneState {
  channelId: string | null;
  messageText: string;
}

export default function SlackClone() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [newChannelName, setNewChannelName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showChannelInput, setShowChannelInput] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState<UserProfile>({
    fullName: '',
    displayName: '',
    title: '',
    timezone: '',
    photoUrl: '',
  });
  
  // Multi-window view state
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [panes, setPanes] = useState<PaneState[]>([
    { channelId: null, messageText: '' },
    { channelId: null, messageText: '' },
    { channelId: null, messageText: '' },
    { channelId: null, messageText: '' },
  ]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedChannels = localStorage.getItem('slack-channels');
    const savedMessages = localStorage.getItem('slack-messages');
    const savedActiveChannel = localStorage.getItem('slack-active-channel');
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

  const sendMessage = (paneIndex?: number) => {
    const text = paneIndex !== undefined ? panes[paneIndex].messageText : messageText;
    const channelId = paneIndex !== undefined ? panes[paneIndex].channelId : activeChannelId;
    
    if (!text.trim() || !channelId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      channelId: channelId,
      text: text.trim(),
      timestamp: Date.now(),
      author: userProfile?.displayName || 'You',
    };

    setMessages([...messages, newMessage]);
    
    if (paneIndex !== undefined) {
      const newPanes = [...panes];
      newPanes[paneIndex].messageText = '';
      setPanes(newPanes);
    } else {
      setMessageText('');
    }
  };

  const updatePaneChannel = (paneIndex: number, channelId: string) => {
    const newPanes = [...panes];
    newPanes[paneIndex].channelId = channelId;
    setPanes(newPanes);
  };

  const updatePaneMessageText = (paneIndex: number, text: string) => {
    const newPanes = [...panes];
    newPanes[paneIndex].messageText = text;
    setPanes(newPanes);
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
    setShowSettings(false);
  };

  const openEditProfile = () => {
    if (userProfile) {
      setProfileForm(userProfile);
    }
    setShowProfileEdit(true);
    setShowSettings(false);
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  const renderChannelView = (channelId: string | null, paneIndex?: number) => {
    const channel = channels.find(c => c.id === channelId);
    const msgs = messages.filter(m => m.channelId === channelId);
    const msgText = paneIndex !== undefined ? panes[paneIndex].messageText : messageText;

    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
          {paneIndex !== undefined ? (
            <select
              value={channelId || ''}
              onChange={(e) => updatePaneChannel(paneIndex, e.target.value)}
              className="bg-[#1a1d21] border border-gray-600 rounded px-3 py-1 text-sm outline-none focus:border-[#1164a3]"
            >
              <option value="">Select channel...</option>
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  # {ch.name}
                </option>
              ))}
            </select>
          ) : (
            <h2 className="text-lg font-semibold">
              {channel ? `# ${channel.name}` : 'Select a channel'}
            </h2>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {msgs.length === 0 ? (
            <div className="text-gray-400 text-center mt-8 text-sm">
              {channelId ? 'No messages yet. Start the conversation!' : 'Select a channel to view messages'}
            </div>
          ) : (
            msgs.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div className="w-9 h-9 rounded bg-[#3f0e40] flex items-center justify-center font-semibold flex-shrink-0">
                  {message.author[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm">{message.author}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm mt-1 break-words">{message.text}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        {channelId && (
          <div className="p-4 border-t border-gray-700 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={msgText}
                onChange={(e) => paneIndex !== undefined ? updatePaneMessageText(paneIndex, e.target.value) : setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (paneIndex !== undefined ? sendMessage(paneIndex) : sendMessage())}
                placeholder={`Message #${channel?.name}`}
                className="flex-1 px-4 py-2 bg-[#1a1d21] border border-gray-600 rounded outline-none focus:border-[#1164a3] text-sm"
              />
              <button
                onClick={() => paneIndex !== undefined ? sendMessage(paneIndex) : sendMessage()}
                className="px-4 py-2 bg-[#1164a3] hover:bg-[#0e5a8a] rounded font-semibold text-sm"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#1a1d21] text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#3f0e40] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[#522653]">
          <h1 className="text-xl font-bold">Slack Clone</h1>
        </div>

        {/* User Profile Section */}
        {userProfile && (
          <div className="p-4 border-b border-[#522653]">
            <div className="flex items-center gap-3">
              {userProfile.photoUrl ? (
                <img
                  src={userProfile.photoUrl}
                  alt={userProfile.displayName}
                  className="w-10 h-10 rounded object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-[#1164a3] flex items-center justify-center font-semibold">
                  {userProfile.displayName[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{userProfile.displayName}</div>
                <div className="text-xs text-gray-300 truncate">{userProfile.title}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
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
        {/* View Mode Toolbar */}
        <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-400">View:</span>
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'single'
                  ? 'bg-[#1164a3] text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setViewMode('split2')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'split2'
                  ? 'bg-[#1164a3] text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Split 2
            </button>
            <button
              onClick={() => setViewMode('split4')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'split4'
                  ? 'bg-[#1164a3] text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Split 4
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-700 rounded"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
                <button
                  onClick={openEditProfile}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Workspace Views */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'single' && (
            <div className="h-full">
              {renderChannelView(activeChannelId)}
            </div>
          )}

          {viewMode === 'split2' && (
            <div className="h-full flex">
              <div className="flex-1 border-r border-gray-700">
                {renderChannelView(panes[0].channelId, 0)}
              </div>
              <div className="flex-1">
                {renderChannelView(panes[1].channelId, 1)}
              </div>
            </div>
          )}

          {viewMode === 'split4' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 flex border-b border-gray-700">
                <div className="flex-1 border-r border-gray-700">
                  {renderChannelView(panes[0].channelId, 0)}
                </div>
                <div className="flex-1">
                  {renderChannelView(panes[1].channelId, 1)}
                </div>
              </div>
              <div className="flex-1 flex">
                <div className="flex-1 border-r border-gray-700">
                  {renderChannelView(panes[2].channelId, 2)}
                </div>
                <div className="flex-1">
                  {renderChannelView(panes[3].channelId, 3)}
                </div>
              </div>
            </div>
          )}
        </div>
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













