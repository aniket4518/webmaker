import React, { useState } from 'react';
import { Download, Copy, Play, Archive, CheckCircle } from 'lucide-react';

interface FileStructure {
  name: string;
  path: string;
  content: string;
  type: 'file' | 'directory';
  children?: FileStructure[];
}

interface FileActionsProps {
  files: FileStructure[];
}

const FileActions: React.FC<FileActionsProps> = ({ files }) => {
  const [copied, setCopied] = useState(false);

  const downloadAllFiles = () => {
    if (files.length === 0) return;
    
    const downloadFile = (file: FileStructure) => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const processFiles = (fileList: FileStructure[]) => {
      fileList.forEach(file => {
        if (file.type === 'file') {
          downloadFile(file);
        } else if (file.children) {
          processFiles(file.children);
        }
      });
    };

    processFiles(files);
  };

  const copyProjectStructure = async () => {
    const generateStructure = (fileList: FileStructure[], level = 0): string => {
      return fileList.map(file => {
        const indent = '  '.repeat(level);
        if (file.type === 'directory') {
          const children = file.children ? generateStructure(file.children, level + 1) : '';
          return `${indent}${file.name}/\n${children}`;
        } else {
          return `${indent}${file.name}\n`;
        }
      }).join('');
    };

    const structure = `Project Structure:\n\n${generateStructure(files)}`;
    
    try {
      await navigator.clipboard.writeText(structure);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy structure: ', err);
    }
  };

  const shareProject = () => {
    // Create a shareable link or export functionality
    const projectData = {
      files: files,
      timestamp: new Date().toISOString(),
      name: 'WebMaker Project'
    };
    
    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webmaker-project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const runProject = () => {
    // This could integrate with a preview system or CodeSandbox
    console.log('Running project...');
    // For now, just open a new tab with basic HTML preview
    if (files.length > 0) {
      const htmlFile = files.find(f => f.name.endsWith('.html'));
      if (htmlFile) {
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(htmlFile.content);
          newWindow.document.close();
        }
      }
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 px-4 py-3 border-b border-gray-700 bg-gray-800">
      <div className="flex items-center space-x-1">
        <button
          onClick={downloadAllFiles}
          className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
          title="Download all files"
        >
          <Download size={14} />
          <span>Download All</span>
        </button>

        <button
          onClick={copyProjectStructure}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
          title="Copy project structure"
        >
          {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy Structure'}</span>
        </button>

        <button
          onClick={shareProject}
          className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm"
          title="Export project"
        >
          <Archive size={14} />
          <span>Export</span>
        </button>

        <button
          onClick={runProject}
          className="flex items-center space-x-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-sm"
          title="Preview project"
        >
          <Play size={14} />
          <span>Preview</span>
        </button>
      </div>

      <div className="flex-1"></div>

      <div className="text-xs text-gray-400">
        {files.length} file{files.length !== 1 ? 's' : ''} generated
      </div>
    </div>
  );
};

export default FileActions;
