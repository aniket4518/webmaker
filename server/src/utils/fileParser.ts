export interface FileStructure {
  name: string;
  path: string;
  content: string;
  type: 'file' | 'directory';
  children?: FileStructure[];
}

export function parseCodeResponse(response: string): FileStructure[] {
  const files: FileStructure[] = [];
  
  console.log("=== PARSING RESPONSE ===");
  console.log("Response length:", response.length);
  console.log("First 1000 chars:", response.substring(0, 1000));
  
   
  const geminiFormatRegex = /```(\w+)?\n\/\/\s*([a-zA-Z0-9_\-\/\.]+\.(jsx?|tsx?|css|html|json|md|js|ts|py|java|cpp|c|php|rb|go|rs|swift|kt|scala|sh|yml|yaml|xml|sql|env|gitignore|txt))\n([\s\S]*?)\n```/gi;
  
  let match;
  while ((match = geminiFormatRegex.exec(response)) !== null) {
    const [fullMatch, language, filePath, extension, content] = match;
    if (content && content.trim()) {
      const fileName = filePath.split('/').pop() || filePath;
      const file: FileStructure = {
        name: fileName,
        path: filePath,
        content: content.trim(),
        type: 'file'
      };
      files.push(file);
      console.log(`Strategy 1 (Gemini format) - Found file: ${filePath} (${content.trim().length} chars)`);
    }
  }
  
  
  if (files.length === 0) {
    const originalFormatRegex = /^([a-zA-Z0-9_\-\/\.]+\.(jsx?|tsx?|css|html|json|md|js|ts|py|java|cpp|c|php|rb|go|rs|swift|kt|scala|sh|yml|yaml|xml|sql|env|gitignore|txt))\s*\n```(\w+)?\n([\s\S]*?)\n```/gim;
    
    while ((match = originalFormatRegex.exec(response)) !== null) {
      const [fullMatch, filePath, extension, language, content] = match;
      if (content && content.trim()) {
        const fileName = filePath.split('/').pop() || filePath;
        const file: FileStructure = {
          name: fileName,
          path: filePath,
          content: content.trim(),
          type: 'file'
        };
        files.push(file);
        console.log(`Strategy 2 (Original format) - Found file: ${filePath} (${content.trim().length} chars)`);
      }
    }
  }
  
 
  if (files.length === 0) {
    const htmlCommentFormatRegex = /```(\w+)?\n<!--\s*([a-zA-Z0-9_\-\/\.]+\.(jsx?|tsx?|css|html|json|md|js|ts|py|java|cpp|c|php|rb|go|rs|swift|kt|scala|sh|yml|yaml|xml|sql|env|gitignore|txt))\s*-->\n([\s\S]*?)\n```/gi;
    
    while ((match = htmlCommentFormatRegex.exec(response)) !== null) {
      const [fullMatch, language, filePath, extension, content] = match;
      if (content && content.trim()) {
        const fileName = filePath.split('/').pop() || filePath;
        const file: FileStructure = {
          name: fileName,
          path: filePath,
          content: content.trim(),
          type: 'file'
        };
        files.push(file);
        console.log(`Strategy 3 (HTML comment format) - Found file: ${filePath} (${content.trim().length} chars)`);
      }
    }
  }
  
 
  if (files.length === 0) {
    const cssCommentFormatRegex = /```(\w+)?\n\/\*\s*([a-zA-Z0-9_\-\/\.]+\.(jsx?|tsx?|css|html|json|md|js|ts|py|java|cpp|c|php|rb|go|rs|swift|kt|scala|sh|yml|yaml|xml|sql|env|gitignore|txt))\s*\*\/\n([\s\S]*?)\n```/gi;
    
    while ((match = cssCommentFormatRegex.exec(response)) !== null) {
      const [fullMatch, language, filePath, extension, content] = match;
      if (content && content.trim()) {
        const fileName = filePath.split('/').pop() || filePath;
        const file: FileStructure = {
          name: fileName,
          path: filePath,
          content: content.trim(),
          type: 'file'
        };
        files.push(file);
        console.log(`Strategy 4 (CSS comment format) - Found file: ${filePath} (${content.trim().length} chars)`);
      }
    }
  }
 
  if (files.length === 0) {
    const markdownCommentFormatRegex = /```(\w+)?\n#\s*([a-zA-Z0-9_\-\/\.]+\.(jsx?|tsx?|css|html|json|md|js|ts|py|java|cpp|c|php|rb|go|rs|swift|kt|scala|sh|yml|yaml|xml|sql|env|gitignore|txt))\n([\s\S]*?)\n```/gi;
    
    while ((match = markdownCommentFormatRegex.exec(response)) !== null) {
      const [fullMatch, language, filePath, extension, content] = match;
      if (content && content.trim()) {
        const fileName = filePath.split('/').pop() || filePath;
        const file: FileStructure = {
          name: fileName,
          path: filePath,
          content: content.trim(),
          type: 'file'
        };
        files.push(file);
        console.log(`Strategy 5 (Markdown comment format) - Found file: ${filePath} (${content.trim().length} chars)`);
      }
    }
  }
 
  if (files.length === 0) {
    console.log("Strategy 6 - Fallback: Looking for any code blocks...");
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
    let blockIndex = 1;
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
      const [fullMatch, language, content] = match;
      if (content && content.trim()) {
        const extension = getExtensionFromLanguage(language || 'txt');
        const fileName = `generated_file_${blockIndex}.${extension}`;
        
        files.push(createFileStructure(fileName, content.trim()));
        console.log(`Strategy 6 - Created generic file: ${fileName} (${content.trim().length} chars)`);
        blockIndex++;
      }
    }
  }
  
  console.log(`=== PARSING COMPLETE ===`);
  console.log(`Total files found: ${files.length}`);
  files.forEach((file, index) => {
    console.log(`File ${index + 1}: ${file.path} -> ${file.name} (${file.content.length} chars)`);
  });
  
  return buildFileTree(files);
}

function getExtensionFromLanguage(language: string): string {
  const languageMap: { [key: string]: string } = {
    'javascript': 'js',
    'typescript': 'ts',
    'jsx': 'jsx',
    'tsx': 'tsx',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'python': 'py',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'php': 'php',
    'ruby': 'rb',
    'go': 'go',
    'rust': 'rs',
    'swift': 'swift',
    'kotlin': 'kt',
    'scala': 'scala',
    'shell': 'sh',
    'bash': 'sh',
    'yaml': 'yml',
    'xml': 'xml',
    'sql': 'sql'
  };
  
  return languageMap[language.toLowerCase()] || 'txt';
}

function createFileStructure(path: string, content: string): FileStructure {
  const fileName = path.split('/').pop() || path;
  return {
    name: fileName,
    path: path,
    content: content.trim(),
    type: 'file'
  };
}

function buildFileTree(files: FileStructure[]): FileStructure[] {
  const tree: FileStructure[] = [];
  const dirMap = new Map<string, FileStructure>();
  
  console.log("Building file tree from files:", files.map(f => f.path));
  
 
  files.sort((a, b) => a.path.localeCompare(b.path));
  
  
  files.forEach(file => {
    const pathParts = file.path.split('/');
    let currentPath = '';
    
  
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!dirMap.has(currentPath)) {
        const dir: FileStructure = {
          name: part,
          path: currentPath,
          content: '',
          type: 'directory',
          children: []
        };
        dirMap.set(currentPath, dir);
        console.log(`Created directory: ${currentPath}`);
        
        
        if (parentPath && dirMap.has(parentPath)) {
          const parent = dirMap.get(parentPath);
          parent?.children?.push(dir);
        } else if (!parentPath) {
          tree.push(dir);
        }
      }
    }
  });
  
  // Then, place files in their directories
  files.forEach(file => {
    const pathParts = file.path.split('/');
    
    if (pathParts.length === 1) {
      // Root level file
      tree.push(file);
      console.log(`Added root file: ${file.name}`);
    } else {
  
      const dirPath = pathParts.slice(0, -1).join('/');
      const dir = dirMap.get(dirPath);
      
      if (dir && dir.children) {
        dir.children.push(file);
        console.log(`Added file ${file.name} to directory ${dirPath}`);
      } else {
       
        tree.push(file);
        console.log(`Fallback: Added file ${file.name} to root (directory ${dirPath} not found)`);
      }
    }
  });
  
 
  const sortChildren = (items: FileStructure[]) => {
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
    items.forEach(item => {
      if (item.children) {
        sortChildren(item.children);
      }
    });
  };
  
  sortChildren(tree);
  
  console.log("Final file tree structure:");
  const printTree = (items: FileStructure[], indent = '') => {
    items.forEach(item => {
      console.log(`${indent}${item.type === 'directory' ? '📁' : '📄'} ${item.name} (${item.path})`);
      if (item.children) {
        printTree(item.children, indent + '  ');
      }
    });
  };
  printTree(tree);
  
  return tree;
}
