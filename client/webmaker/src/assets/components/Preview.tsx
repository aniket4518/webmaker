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
    console.log('Generating React preview...');
    console.log('Frontend files:', projectStructure.frontendFiles.map(f => f.name));
    
    // Find the main App component
    const appFile = projectStructure.frontendFiles.find(f =>
      f.name === 'App.jsx' || f.name === 'App.tsx' || f.name === 'App.js'
    );
    
    // Find CSS files
    const cssFiles = projectStructure.frontendFiles.filter(f => 
      f.name.endsWith('.css')
    );
    
    // Find main.jsx file for additional imports
    const mainFile = projectStructure.frontendFiles.find(f =>
      f.name === 'main.jsx' || f.name === 'main.tsx' || f.name === 'index.jsx'
    );
    
    console.log('Found App file:', appFile?.name);
    console.log('Found CSS files:', cssFiles.map(f => f.name));
    console.log('Found main file:', mainFile?.name);
    
    if (!appFile) {
      console.log('No App file found');
      return null;
    }

    // Clean the React code
    let cleanedAppCode = appFile.content;
    
    // Remove imports that we can't resolve
    cleanedAppCode = cleanedAppCode.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
    cleanedAppCode = cleanedAppCode.replace(/import\s+['"].*?['"];?\s*/g, '');
    
    // Remove exports
    cleanedAppCode = cleanedAppCode.replace(/export\s+default\s+/, '');
    cleanedAppCode = cleanedAppCode.replace(/export\s+/, '');
    
    // Handle common React patterns
    cleanedAppCode = cleanedAppCode.replace(/useState/g, 'React.useState');
    cleanedAppCode = cleanedAppCode.replace(/useEffect/g, 'React.useEffect');
    cleanedAppCode = cleanedAppCode.replace(/useCallback/g, 'React.useCallback');
    cleanedAppCode = cleanedAppCode.replace(/useMemo/g, 'React.useMemo');
    cleanedAppCode = cleanedAppCode.replace(/useRef/g, 'React.useRef');
    
    // Replace common dependencies
    cleanedAppCode = cleanedAppCode.replace(/nanoid\(\)/g, 'Date.now().toString()');
    cleanedAppCode = cleanedAppCode.replace(/uuid\(\)/g, 'Date.now().toString()');
    
    console.log('Cleaned App code preview:', cleanedAppCode.substring(0, 300) + '...');

    // Combine all CSS content
    const allCssContent = cssFiles.map(f => f.content).join('\n');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Preview</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      /* Reset and base styles */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: #fff;
        line-height: 1.6;
      }
      
      #root {
        min-height: 100vh;
      }
      
      /* Default styles for common elements */
      .App {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        margin: 5px;
        transition: background-color 0.2s;
      }
      
      button:hover {
        background-color: #0056b3;
      }
      
      button:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
      }
      
      input, textarea, select {
        border: 1px solid #ddd;
        padding: 10px;
        border-radius: 5px;
        font-size: 14px;
        margin: 5px;
        outline: none;
        width: 100%;
        max-width: 300px;
      }
      
      input:focus, textarea:focus, select:focus {
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
      }
      
      ul {
        list-style: none;
        padding: 0;
      }
      
      li {
        padding: 10px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      h1, h2, h3, h4, h5, h6 {
        margin-bottom: 1rem;
        color: #333;
      }
      
      .card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        margin: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .flex {
        display: flex;
      }
      
      .flex-col {
        flex-direction: column;
      }
      
      .items-center {
        align-items: center;
      }
      
      .justify-between {
        justify-content: space-between;
      }
      
      .gap-2 {
        gap: 8px;
      }
      
      .gap-4 {
        gap: 16px;
      }
      
      .p-4 {
        padding: 16px;
      }
      
      .mb-4 {
        margin-bottom: 16px;
      }
      
      .text-lg {
        font-size: 18px;
      }
      
      .text-xl {
        font-size: 20px;
      }
      
      .font-bold {
        font-weight: bold;
      }
      
      .bg-red-500 {
        background-color: #ef4444;
      }
      
      .bg-green-500 {
        background-color: #10b981;
      }
      
      .bg-blue-500 {
        background-color: #3b82f6;
      }
      
      .text-white {
        color: white;
      }
      
      .rounded {
        border-radius: 4px;
      }
      
      .shadow {
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      }
      
      /* Generated CSS from files */
      ${allCssContent}
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
      const { useState, useEffect, useCallback, useMemo, useRef } = React;
      
      // Mock API data for demos
      const mockApiData = {
        todos: [
          { _id: '1', text: 'Learn React', completed: false },
          { _id: '2', text: 'Build awesome apps', completed: true },
          { _id: '3', text: 'Share with the world', completed: false }
        ],
        users: [
          { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
          { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' }
        ],
        posts: [
          { _id: '1', title: 'Getting Started with React', content: 'React is a powerful library for building user interfaces...', author: 'John Doe', date: '2024-01-15' },
          { _id: '2', title: 'Advanced React Patterns', content: 'Learn about hooks, context, and more advanced patterns...', author: 'Jane Smith', date: '2024-01-20' }
        ],
        products: [
          { _id: '1', name: 'Wireless Headphones', price: 99.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300' },
          { _id: '2', name: 'Smart Watch', price: 199.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300' }
        ],
        tasks: [
          { _id: '1', title: 'Complete project', priority: 'high', status: 'pending' },
          { _id: '2', title: 'Review code', priority: 'medium', status: 'completed' }
        ]
      };
      
      // Mock fetch for API calls
      window.fetch = function(url, options = {}) {
        console.log('Mock fetch called:', url, options);
        
        return new Promise((resolve) => {
          setTimeout(() => {
            const method = options.method || 'GET';
            const urlLower = url.toLowerCase();
            
            let data = [];
            
            if (urlLower.includes('todo') || urlLower.includes('task')) {
              data = urlLower.includes('task') ? mockApiData.tasks : mockApiData.todos;
            } else if (urlLower.includes('user')) {
              data = mockApiData.users;
            } else if (urlLower.includes('post') || urlLower.includes('blog')) {
              data = mockApiData.posts;
            } else if (urlLower.includes('product')) {
              data = mockApiData.products;
            } else {
              data = [{ _id: '1', name: 'Sample Item', value: 'Test Data' }];
            }
            
            if (method === 'POST') {
              const body = options.body ? JSON.parse(options.body) : {};
              const newItem = { _id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
              resolve({
                ok: true,
                status: 201,
                json: () => Promise.resolve({ success: true, data: newItem, message: 'Created successfully' })
              });
            } else if (method === 'PUT' || method === 'PATCH') {
              const updatedItem = { ...data[0], updatedAt: new Date().toISOString() };
              resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true, data: updatedItem, message: 'Updated successfully' })
              });
            } else if (method === 'DELETE') {
              resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true, message: 'Deleted successfully' })
              });
            } else {
              resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true, data: data, count: data.length })
              });
            }
          }, Math.random() * 500 + 200); // Random delay between 200-700ms
        });
      };
      
      // Mock localStorage
      const mockStorage = {};
      if (!window.localStorage) {
        window.localStorage = {
          getItem: (key) => mockStorage[key] || null,
          setItem: (key, value) => { mockStorage[key] = value; },
          removeItem: (key) => { delete mockStorage[key]; },
          clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }
        };
      }
      
      // App component from generated code
      ${cleanedAppCode}
      
      // Render the app
      try {
        const container = document.getElementById('root');
        if (container) {
          const root = ReactDOM.createRoot(container);
          root.render(React.createElement(App));
          console.log('App rendered successfully');
        }
      } catch (error) {
        console.error('Error rendering app:', error);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'padding: 20px; color: red; font-family: monospace; background: #fee; border: 1px solid red; margin: 20px; border-radius: 5px;';
        errorDiv.innerHTML = '<h3>Preview Error</h3><p>' + error.message + '</p><pre>' + error.stack + '</pre>';
        document.getElementById('root').appendChild(errorDiv);
      }
    </script>
</body>
</html>`;

    console.log('Generated HTML content length:', htmlContent.length);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    return URL.createObjectURL(blob);
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
    // Auto-generate preview when files are available
    if (files.length > 0 && projectStructure.frontendFiles.length > 0) {
      console.log('Auto-generating preview for new files...');
      generatePreview();
    }
  }, [files, projectStructure.frontendFiles.length]);

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
