import React from 'react';
import { FileText, Clock, User, Bot } from 'lucide-react';

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

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const countFiles = (files: FileStructure[]): number => {
    let count = 0;
    files.forEach(file => {
      if (file.type === 'file') {
        count++;
      } else if (file.children) {
        count += countFiles(file.children);
      }
    });
    return count;
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-3xl rounded-xl p-4 shadow-lg message-bubble ${
        message.role === 'user' 
          ? 'bg-blue-600 border border-blue-500 user-message' 
          : 'bg-gray-800 border border-gray-700 assistant-message'
      }`}>
        {/* Message Header */}
        <div className="flex items-center space-x-2 mb-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            message.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'
          }`}>
            {message.role === 'user' ? (
              <User size={14} className="text-white" />
            ) : (
              <Bot size={14} className="text-white" />
            )}
          </div>
          <span className={`text-sm font-medium ${
            message.role === 'user' ? 'text-white' : 'text-gray-100'
          }`}>
            {message.role === 'user' ? 'You' : 'WebMaker AI'}
          </span>
          <div className={`flex items-center space-x-1 ${
            message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
          }`}>
            <Clock size={12} />
            <span className="text-xs">{formatTime(message.timestamp)}</span>
          </div>
        </div>

        {/* Message Content */}
        <div className="leading-relaxed mb-3" style={{ 
          fontWeight: '400',
          fontSize: '14px'
        }}>
          {message.content.split('\n').map((line, index) => (
            <div key={index} className={index > 0 ? 'mt-2' : ''}>
              {line || '\u00A0'}
            </div>
          ))}
        </div>

        {/* Files Indicator */}
        {message.files && message.files.length > 0 && (
          <div className={`border-t pt-3 mt-3 ${
            message.role === 'user' ? 'border-blue-500' : 'border-gray-600'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-green-400">
                <FileText size={16} />
                <span className="text-sm font-medium">
                  Generated {countFiles(message.files)} file{countFiles(message.files) !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {message.files.slice(0, 3).map((file, index) => (
                  <span key={index} className={`px-2 py-1 rounded text-xs ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-blue-100' 
                      : 'bg-gray-700 text-gray-200'
                  }`}>
                    {file.name}
                  </span>
                ))}
                {message.files.length > 3 && (
                  <span className={`px-2 py-1 rounded text-xs ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-blue-100' 
                      : 'bg-gray-700 text-gray-200'
                  }`}>
                    +{message.files.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
