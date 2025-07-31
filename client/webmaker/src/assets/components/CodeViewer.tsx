import React, { useEffect, useState } from 'react';
import { Copy, Download, CheckCircle } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';

interface FileStructure {
  name: string;
  path: string;
  content: string;
  type: 'file' | 'directory';
  children?: FileStructure[];
}

interface CodeViewerProps {
  file: FileStructure | null;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  const [copied, setCopied] = useState(false);

  const getLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'jsx':
        return 'jsx';
      case 'ts':
        return 'typescript';
      case 'tsx':
        return 'tsx';
      case 'css':
        return 'css';
      case 'html':
        return 'markup';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };

  const copyToClipboard = async () => {
    if (file?.content) {
      try {
        await navigator.clipboard.writeText(file.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const downloadFile = () => {
    if (file) {
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
  };

  useEffect(() => {
    if (file) {
      Prism.highlightAll();
    }
  }, [file]);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">�</div>
          <p className="text-lg font-medium">Select a file to view</p>
          <p className="text-sm text-gray-500 mt-1">Choose a file from the tree to see its content</p>
        </div>
      </div>
    );
  }

  const language = getLanguage(file.name);
  const lines = file.content.split('\n');

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              language === 'javascript' || language === 'jsx' ? 'bg-yellow-400' :
              language === 'typescript' || language === 'tsx' ? 'bg-blue-400' :
              language === 'css' ? 'bg-pink-400' :
              language === 'markup' ? 'bg-orange-400' :
              language === 'json' ? 'bg-green-400' :
              'bg-gray-400'
            }`}></div>
            <span className="text-sm font-medium text-gray-300">{file.name}</span>
          </div>
          <div className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400 uppercase">
            {language}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
          >
            {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={downloadFile}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
          >
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Line Numbers */}
          <div className="bg-gray-800 px-3 py-4 text-right select-none border-r border-gray-700">
            {lines.map((_, index) => (
              <div key={index} className="text-xs text-gray-500 leading-6 font-mono">
                {index + 1}
              </div>
            ))}
          </div>
          
          {/* Code */}
          <div className="flex-1 overflow-x-auto">
            <pre className="p-4 text-sm leading-6 font-mono bg-gray-900" style={{ margin: 0 }}>
              <code className={`language-${language}`}>
                {file.content}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>{lines.length} lines</span>
            <span>{file.content.length} characters</span>
            <span>{new Blob([file.content]).size} bytes</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>UTF-8</span>
            <span>•</span>
            <span className="capitalize">{language}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
