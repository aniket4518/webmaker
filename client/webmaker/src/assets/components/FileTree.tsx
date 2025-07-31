import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';

interface FileStructure {
  name: string;
  path: string;
  content: string;
  type: 'file' | 'directory';
  children?: FileStructure[];
}

interface FileTreeProps {
  files: FileStructure[];
  onFileSelect: (file: FileStructure) => void;
  selectedFile?: FileStructure | null;
}

const FileTree: React.FC<FileTreeProps> = ({ files, onFileSelect, selectedFile }) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const toggleDirectory = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const getFileIcon = (fileName: string, type: string) => {
    if (type === 'directory') {
      return expandedDirs.has(fileName) ? (
        <FolderOpen size={16} className="text-blue-400" />
      ) : (
        <Folder size={16} className="text-blue-400" />
      );
    }
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return <File size={16} className="text-yellow-400" />;
      case 'ts':
      case 'tsx':
        return <File size={16} className="text-blue-400" />;
      case 'css':
        return <File size={16} className="text-pink-400" />;
      case 'html':
        return <File size={16} className="text-orange-400" />;
      case 'json':
        return <File size={16} className="text-green-400" />;
      case 'md':
        return <File size={16} className="text-gray-400" />;
      default:
        return <File size={16} className="text-gray-300" />;
    }
  };

  const renderFileItem = (item: FileStructure, level: number = 0) => {
    const isSelected = selectedFile?.path === item.path;
    const isExpanded = expandedDirs.has(item.path);

    return (
      <div key={item.path}>
        <div
          className={`flex items-center py-2 px-3 cursor-pointer transition-colors group ${
            isSelected 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => {
            if (item.type === 'directory') {
              toggleDirectory(item.path);
            } else {
              onFileSelect(item);
            }
          }}
        >
          {item.type === 'directory' && (
            <div className="mr-1">
              {isExpanded ? (
                <ChevronDown size={16} className="text-gray-400" />
              ) : (
                <ChevronRight size={16} className="text-gray-400" />
              )}
            </div>
          )}
          <div className="mr-2">
            {getFileIcon(item.name, item.type)}
          </div>
          <span className="text-sm font-medium truncate flex-1">
            {item.name}
          </span>
        </div>
        
        {item.type === 'directory' && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderFileItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 border-gray-700 h-full flex flex-col">
      <div className="p-3 border-b border-gray-700 bg-gray-750">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide flex items-center">
          <Folder size={16} className="mr-2 text-blue-400" />
          Project Files
        </h3>
        <div className="text-xs text-gray-500 mt-1">
          {files.length} item{files.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.map(file => renderFileItem(file))}
      </div>
    </div>
  );
};

export default FileTree;
