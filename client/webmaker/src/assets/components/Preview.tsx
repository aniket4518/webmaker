import React, { useState, useEffect } from 'react';
import { Play, Square, RefreshCw, ExternalLink } from 'lucide-react';

interface FileStructure {
  name: string;
  path: string;
  content: string;
  type: 'file' | 'directory';
  children?: FileStructure[];
}

interface PreviewProps {
  files: FileStructure[];
}

const Preview: React.FC<PreviewProps> = ({ files }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const findHtmlFile = (fileList: FileStructure[]): FileStructure | null => {
    for (const file of fileList) {
      if (file.type === 'file' && file.name.endsWith('.html')) {
        return file;
      }
      if (file.children) {
        const found = findHtmlFile(file.children);
        if (found) return found;
      }
    }
    return null;
  };

  const generatePreview = () => {
    const htmlFile = findHtmlFile(files);
    if (!htmlFile) {
      return;
    }

    setIsRunning(true);
    
    // Create a blob URL for the HTML content
    const blob = new Blob([htmlFile.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    
    setTimeout(() => setIsRunning(false), 1000);
  };

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const stopPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const hasHtmlFile = findHtmlFile(files) !== null;

  if (files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <div className="text-4xl mb-4">👁️</div>
          <p className="text-gray-400">No files to preview</p>
          <p className="text-sm text-gray-500 mt-1">Generate a project to see preview</p>
        </div>
      </div>
    );
  }

  if (!hasHtmlFile) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-400">No HTML file found</p>
          <p className="text-sm text-gray-500 mt-1">Generate a web project with HTML to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Preview Controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={generatePreview}
            disabled={isRunning}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded-lg transition-colors text-sm"
          >
            {isRunning ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            <span>{isRunning ? 'Loading...' : 'Run Preview'}</span>
          </button>

          {previewUrl && (
            <>
              <button
                onClick={stopPreview}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
              >
                <Square size={14} />
                <span>Stop</span>
              </button>

              <button
                onClick={openInNewTab}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
              >
                <ExternalLink size={14} />
                <span>Open in Tab</span>
              </button>
            </>
          )}
        </div>

        <div className="text-xs text-gray-400">
          {previewUrl ? 'Preview Active' : 'Preview Stopped'}
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 bg-white">
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full border-none"
            title="Project Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-center bg-gray-100">
            <div>
              <div className="text-4xl mb-4 text-gray-400">🌐</div>
              <p className="text-gray-600">Click "Run Preview" to see your project</p>
              <p className="text-sm text-gray-500 mt-1">Live preview will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
