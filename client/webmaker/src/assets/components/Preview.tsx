 import React, { useState, useEffect, useMemo } from 'react';
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

interface ProjectStructure {
  type: 'html' | 'react' | 'mern' | 'unknown';
  hasReact: boolean;
  frontendFiles: FileStructure[];
}

const Preview: React.FC<PreviewProps> = ({ files }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const projectStructure: ProjectStructure = useMemo(() => {
    const structure: ProjectStructure = {
      type: 'unknown',
      hasReact: false,
      frontendFiles: []
    };

    const analyzeFiles = (fileList: FileStructure[]) => {
      fileList.forEach(file => {
        if (file.type === 'file') {
          const content = file.content.toLowerCase();
          const filename = file.name.toLowerCase();
          const filepath = file.path.toLowerCase();

          if (
            filename.endsWith('.jsx') ||
            filename.endsWith('.tsx') ||
            content.includes('react') ||
            filepath.startsWith('src/')
          ) {
            structure.hasReact = true;
            structure.frontendFiles.push(file);
          } else if (filename.endsWith('.css')) {
            structure.frontendFiles.push(file);
          } else if (filename.endsWith('.html')) {
            structure.frontendFiles.push(file);
          }
        }

        if (file.children) {
          analyzeFiles(file.children);
        }
      });
    };

    analyzeFiles(files);

    if (structure.hasReact) {
      structure.type = 'react';
    } else if (files.some(f => f.name.endsWith('.html'))) {
      structure.type = 'html';
    }

    return structure;
  }, [files]);

  const generateReactPreview = (): string | null => {
    const cssContent = projectStructure.frontendFiles
      .filter(f => f.name.endsWith('.css'))
      .map(f => f.content)
      .join('\n');

    const scripts = projectStructure.frontendFiles
      .filter(f => f.name.endsWith('.js') || f.name.endsWith('.jsx') || f.name.endsWith('.tsx'))
      .map(f => {
        let code = f.content;

        // Clean imports/exports
        code = code.replace(/import\s+.*?;?/g, '');
        code = code.replace(/export\s+default\s+/g, `window.${f.name.replace(/\.(jsx|js|tsx)$/, '')} = `);
        code = code.replace(/export\s+{.*?};?/g, '');

        return `<script type="text/babel" data-filename="${f.name}">\n${code}\n</script>`;
      })
      .join('\n');

    const appFile = projectStructure.frontendFiles.find(f =>
      ['App.jsx', 'App.tsx', 'App.js'].includes(f.name)
    );

    if (!appFile) return null;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>React Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>${cssContent}</style>
</head>
<body>
  <div id="root"></div>
  ${scripts}
  <script type="text/babel">
    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(App));
  </script>
</body>
</html>
    `;

    return URL.createObjectURL(new Blob([htmlContent], { type: 'text/html' }));
  };

  const generateHtmlPreview = (): string | null => {
    const htmlFile = projectStructure.frontendFiles.find(f => f.name.endsWith('.html'));
    if (!htmlFile) return null;
    return URL.createObjectURL(new Blob([htmlFile.content], { type: 'text/html' }));
  };

  const generatePreview = () => {
    setIsRunning(true);
    let url: string | null = null;

    try {
      if (projectStructure.type === 'html') {
        url = generateHtmlPreview();
      } else if (projectStructure.type === 'react') {
        url = generateReactPreview();
      }
    } catch (error) {
      console.error('Error generating preview:', error);
    }

    if (url) setPreviewUrl(url);
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

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Preview Controls */}
      <div className="flex flex-col border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between p-3">
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

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 px-2 py-1 bg-gray-700 rounded">
              FRONTEND PREVIEW
            </span>
            <div className="text-xs text-gray-400">
              {previewUrl ? 'Preview Active' : 'Preview Stopped'}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
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
              <p className="text-gray-600">Click "Run Preview" to see your {projectStructure.type} frontend</p>
              <p className="text-sm text-gray-500 mt-1">Live preview will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
