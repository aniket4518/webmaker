import React, { useState, useRef, useEffect } from "react";
import { Send, Download, Folder, Eye, Terminal, Settings, ArrowLeft } from "lucide-react";
import FileTree from "../FileTree";
import CodeViewer from "../CodeViewer";
import FileActions from "../FileActions";
import Message from "../Message";
import Preview from "../Preview";
import TerminalComponent from "../Terminal";

interface FileStructure {
  name: string;
  path: string;
  content: string;
  type: 'file' | 'directory';
  children?: FileStructure[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: FileStructure[];
}

interface UserChatProps {
  initialPrompt?: string;
  onBackToLanding?: () => void;
}

const UserChat: React.FC<UserChatProps> = ({ initialPrompt, onBackToLanding }) => {
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<FileStructure[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileStructure | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'files' | 'preview' | 'terminal'>('files');
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
 
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setUserInput(initialPrompt);
    
      setTimeout(() => {
        handleSendInitial(initialPrompt);
      }, 500);
    }
  }, [initialPrompt]);

  const handleSendInitial = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages([userMessage]);
    setLoading(true);
    setUserInput("");
    
    try {
      const res = await fetch("https://webmaker-backend.onrender.com/ask-llama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: prompt }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Handle 429 quota error specifically
        if (res.status === 429 && data.quota_exceeded) {
          const retryAfterMs = (data.retry_after || 60) * 1000;
          setRetryAfter(Date.now() + retryAfterMs);
          
          const errorContent = `⚠️ **API Quota Exceeded**\n\nThe Gemini API free tier limit has been reached.\n\n**What happened:**\n• Free tier allows limited requests per minute/day\n• Your quota has been exhausted\n\n**Solutions:**\n1. Wait ${data.retry_after} seconds and try again\n2. Get a new API key from https://ai.google.dev\n3. Upgrade to a paid plan for higher limits\n\nThe app will be ready to use again in ${data.retry_after} seconds.`;
          
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: errorContent,
            timestamp: new Date()
          };
          setMessages([userMessage, errorMessage]);
          setLoading(false);
          return;
        }
        
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      
      console.log("Backend response (initial):", data);
      console.log("Files received (initial):", data.files);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || data.error || "No response",
        timestamp: new Date(),
        files: data.files || []
      };

      setMessages([userMessage, assistantMessage]);
      
      if (data.files && data.files.length > 0) {
        console.log("Setting files (initial):", data.files);
        setFiles(data.files);
        const firstFile = findFirstFile(data.files);
        if (firstFile) {
          setSelectedFile(firstFile);
        }
      }
      
      setRetryAfter(null);
    } catch (err: any) {
      console.error("Error:", err);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Error**\n\n${err.message}\n\nPlease try again or check your connection.`,
        timestamp: new Date()
      };
      setMessages([userMessage, errorMessage]);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;
    
    // Check if we're still in retry cooldown
    if (retryAfter && Date.now() < retryAfter) {
      const waitSeconds = Math.ceil((retryAfter - Date.now()) / 1000);
      const warningMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⏱️ **Please Wait**\n\nYou need to wait **${waitSeconds} more seconds** before sending another request due to API rate limits.\n\nThis cooldown is automatically applied after quota errors.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, warningMessage]);
      return;
    }
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setUserInput("");
    
    try {
      const res = await fetch("https://webmaker-backend.onrender.com/ask-llama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: userInput }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Handle 429 quota error specifically
        if (res.status === 429 && data.quota_exceeded) {
          const retryAfterMs = (data.retry_after || 60) * 1000;
          setRetryAfter(Date.now() + retryAfterMs);
          
          const errorContent = `⚠️ **API Quota Exceeded**\n\nThe Gemini API free tier limit has been reached.\n\n**What happened:**\n• Free tier allows limited requests per minute/day\n• Your quota has been exhausted\n\n**Solutions:**\n1. Wait ${data.retry_after} seconds and try again\n2. Get a new API key from https://ai.google.dev\n3. Upgrade to a paid plan for higher limits\n\nThe app will be ready to use again in ${data.retry_after} seconds.`;
          
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: errorContent,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          setLoading(false);
          return;
        }
        
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      
      console.log("Backend response:", data);
      console.log("Files received:", data.files);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || data.error || "No response",
        timestamp: new Date(),
        files: data.files || []
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.files && data.files.length > 0) {
        console.log("Setting files:", data.files);
        setFiles(data.files);
        const firstFile = findFirstFile(data.files);
        if (firstFile) {
          setSelectedFile(firstFile);
        }
      }
      
      setRetryAfter(null);
    } catch (err: any) {
      console.error("Error:", err);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**Error**\n\n${err.message}\n\nPlease try again or check your connection.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setLoading(false);
  };

  const findFirstFile = (fileStructure: FileStructure[]): FileStructure | null => {
    for (const item of fileStructure) {
      if (item.type === 'file') {
        return item;
      }
      if (item.children) {
        const found = findFirstFile(item.children);
        if (found) return found;
      }
    }
    return null;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
//download file
  const downloadAllFiles = () => {
    if (files.length === 0) return;
    
    files.forEach(file => {
      if (file.type === 'file') {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Main Chat Area */}
      <div className={`flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-full' : 'w-1/2'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-2 text-gray-300 hover:text-white"
              >
                <ArrowLeft size={16} />
                <span className="text-sm">Back</span>
              </button>
            )}
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <h1 className="text-xl font-semibold">WebMaker AI</h1>
          </div>
          <div className="flex items-center space-x-2">
            {files.length > 0 && (
              <button
                onClick={downloadAllFiles}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <Download size={16} />
                <span className="text-sm">Download All</span>
              </button>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !initialPrompt && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl"></span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Welcome to WebMaker AI</h2>
              <p className="text-gray-400 max-w-md">
                Describe your web application and I'll help you build it. I can create complete projects with files, components, and functionality.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">AI</span>
                  </div>
                  <span className="text-sm text-gray-300">WebMaker AI</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>Generating your project...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          {retryAfter && Date.now() < retryAfter && (
            <div className="mb-3 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg text-sm text-yellow-200">
              <div className="flex items-center space-x-2">
                <span>⏱️</span>
                <span>Rate limit active. Please wait {Math.ceil((retryAfter - Date.now()) / 1000)}s before sending another message.</span>
              </div>
            </div>
          )}
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the web application you want to build..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent chat-input"
                style={{
                  color: '#ffffff',
                  backgroundColor: '#374151'
                }}
                rows={3}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !userInput.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {!sidebarCollapsed && (
        <div className="w-1/2 border-l border-gray-700 bg-gray-800 flex flex-col">
          {/* Sidebar Header */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'files' ? 'bg-gray-700 text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Folder size={16} />
              <span>Files</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'preview' ? 'bg-gray-700 text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye size={16} />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'terminal' ? 'bg-gray-700 text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Terminal size={16} />
              <span>Terminal</span>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-2 overflow-hidden">
            {activeTab === 'files' && (
              <div className="h-full flex flex-col">
                {files.length > 0 && <FileActions files={files} />}
                {files.length > 0 ? (
                  <>
                    <div className="flex-1 flex">
                      <div className="w-1/2 border-r border-gray-700">
                        <FileTree 
                          files={files} 
                          onFileSelect={setSelectedFile} 
                          selectedFile={selectedFile}
                        />
                      </div>
                      {selectedFile && (
                        <div className="w-3/2">
                          <CodeViewer file={selectedFile} />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <div className="text-4xl mb-4">📁</div>
                      <p className="text-gray-400">No files generated yet</p>
                      <p className="text-sm text-gray-500 mt-1">Start a conversation to generate files</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preview' && (
              <Preview files={files} />
            )}

            {activeTab === 'terminal' && (
              <TerminalComponent files={files} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserChat;
