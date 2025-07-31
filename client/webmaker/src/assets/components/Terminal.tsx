import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Trash2 } from 'lucide-react';

interface TerminalProps {
  files: any[];
}

const Terminal: React.FC<TerminalProps> = ({ files }) => {
  const [commands, setCommands] = useState<Array<{ command: string; output: string; timestamp: Date }>>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [commands]);

  const runCommand = async () => {
    if (!currentCommand.trim() || isRunning) return;

    setIsRunning(true);
    const command = currentCommand.trim();
    setCurrentCommand('');

    // Simulate command execution
    let output = '';
    
    switch (command.toLowerCase()) {
      case 'ls':
      case 'dir':
        output = files.map(file => file.name).join('\n');
        break;
      case 'pwd':
        output = '/workspace';
        break;
      case 'npm install':
        output = 'Installing dependencies...\nAll packages installed successfully';
        break;
      case 'npm run dev':
        output = ' Development server starting...\n Server running on http://localhost:3000';
        break;
      case 'npm run build':
        output = ' Building for production...\n Build completed successfully';
        break;
      case 'clear':
        setCommands([]);
        setIsRunning(false);
        return;
      case 'help':
        output = `Available commands:
ls, dir     - List files
pwd         - Show current directory
npm install - Install dependencies
npm run dev - Start development server
npm run build - Build for production
clear       - Clear terminal
help        - Show this help`;
        break;
      default:
        output = `Command not found: ${command}\nType 'help' for available commands`;
    }

    setTimeout(() => {
      setCommands(prev => [...prev, { 
        command, 
        output, 
        timestamp: new Date() 
      }]);
      setIsRunning(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      runCommand();
    }
  };

  const clearTerminal = () => {
    setCommands([]);
  };

  if (files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-gray-400">Terminal not available</p>
          <p className="text-sm text-gray-500 mt-1">Generate a project to use terminal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2">
          <TerminalIcon size={16} className="text-green-400" />
          <span className="text-sm font-medium text-gray-300">Terminal</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearTerminal}
            className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {/* Welcome Message */}
        <div className="text-green-400 mb-4">
          WebMaker Terminal v1.0.0
          <br />
          Type 'help' for available commands
        </div>

        {/* Command History */}
        {commands.map((cmd, index) => (
          <div key={index} className="mb-4">
            <div className="flex items-center space-x-2 text-blue-400">
              <span>$</span>
              <span>{cmd.command}</span>
              <span className="text-gray-500 text-xs">
                {cmd.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="mt-1 text-gray-300 whitespace-pre-line">
              {cmd.output}
            </div>
          </div>
        ))}

        {/* Current Command Input */}
        <div className="flex items-center space-x-2">
          <span className="text-blue-400">$</span>
          <input
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a command..."
            disabled={isRunning}
            className="flex-1 bg-transparent border-none outline-none text-gray-300 placeholder-gray-500"
          />
          {isRunning && (
            <div className="animate-spin w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"></div>
          )}
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="p-2 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Workspace: /project</span>
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
