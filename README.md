# WebMaker AI - Bolt.new Style Interface

A modern, bolt.new-inspired web development assistant that generates complete web applications through conversational AI.

## 🚀 Features

### Chat Interface (Bolt.new Style)

- **Dark Theme**: Modern dark UI matching bolt.new aesthetics
- **Real-time Messaging**: Conversational interface with the AI
- **Message History**: Full conversation history with timestamps
- **Typing Indicators**: Loading states and progress indicators
- **Responsive Design**: Adaptable layout for different screen sizes

### File Management System

- **File Tree View**: Hierarchical file structure display
- **Syntax Highlighting**: Code syntax highlighting with Prism.js
- **File Icons**: Language-specific file icons and colors
- **Line Numbers**: Professional code viewer with line numbers
- **File Actions**: Copy, download, and preview functionality

### Project Management

- **Download All**: Export entire project as downloadable files
- **Copy Structure**: Copy project structure to clipboard
- **Export Project**: Save project as JSON for sharing
- **Preview Mode**: Live preview of generated applications

### Enhanced UX Features

- **Collapsible Sidebar**: Toggle sidebar for focused chat
- **Multiple Tabs**: Files, Preview, and Terminal views
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new lines
- **Auto-scroll**: Automatic scrolling to latest messages
- **File Counter**: Display number of generated files

## 🎨 UI Components

### 1. Main Chat Interface (`userchat.tsx`)

- Split-screen layout with chat and file viewer
- Gradient brand colors and modern styling
- Interactive message bubbles with user/AI indicators
- File generation indicators and counters

### 2. File Tree (`FileTree.tsx`)

- Expandable/collapsible directory structure
- File type icons with color coding
- Selection highlighting
- Nested file organization

### 3. Code Viewer (`CodeViewer.tsx`)

- Syntax highlighting for multiple languages
- Line numbers and file metadata
- Copy and download buttons
- Professional code editor appearance

### 4. Message Component (`Message.tsx`)

- User and AI message differentiation
- Timestamp display
- File attachment indicators
- Smooth animations and transitions

### 5. File Actions (`FileActions.tsx`)

- Bulk operations on generated files
- Export and sharing functionality
- Project preview capabilities
- Action buttons with icons

## 🛠 Technologies Used

### Frontend

- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Prism.js** for syntax highlighting
- **Vite** for build tooling

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **Together AI** LLaMA API integration
- **CORS** for cross-origin requests
- **File parsing utilities**

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Together AI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd webmaker
   ```

2. **Install client dependencies**

   ```bash
   cd client/webmaker
   npm install
   ```

3. **Install server dependencies**

   ```bash
   cd ../../server
   npm install
   ```

4. **Set up environment variables**

   ```bash
   # In server directory, create .env file
   TOGETHER_AI_API_KEY=your_api_key_here
   ```

5. **Start development servers**

   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev

   # Terminal 2 - Start frontend
   cd client/webmaker
   npm run dev
   ```

6. **Open application**
   Navigate to `http://localhost:5173`

## 📁 File Structure

```
webmaker/
├── client/webmaker/          # React frontend
│   ├── src/
│   │   ├── assets/components/
│   │   │   ├── chatinterface/
│   │   │   │   └── userchat.tsx      # Main chat interface
│   │   │   ├── FileTree.tsx          # File tree component
│   │   │   ├── CodeViewer.tsx        # Code viewer with highlighting
│   │   │   ├── Message.tsx           # Individual message component
│   │   │   └── FileActions.tsx       # File management actions
│   │   ├── App.tsx                   # Root component
│   │   └── index.css                 # Global styles
│   └── package.json
├── server/                    # Express backend
│   ├── src/
│   │   ├── index.ts                  # Server entry point
│   │   ├── prompt/prompt.ts          # AI prompt generation
│   │   └── utils/fileParser.ts       # File parsing utilities
│   └── package.json
└── README.md
```

## 🎯 Key Features Comparison with Bolt.new

| Feature           | WebMaker AI | Bolt.new |
| ----------------- | ----------- | -------- |
| Dark Theme        | ✅          | ✅       |
| File Tree         | ✅          | ✅       |
| Code Highlighting | ✅          | ✅       |
| Real-time Chat    | ✅          | ✅       |
| File Download     | ✅          | ✅       |
| Project Export    | ✅          | ✅       |
| Preview Mode      | 🚧          | ✅       |
| Terminal          | 🚧          | ✅       |
| Version Control   | ❌          | ✅       |

✅ = Implemented  
🚧 = In Progress  
❌ = Not Implemented

## 🔮 Roadmap

### Phase 1 - Core Features ✅

- [x] Bolt.new-style UI
- [x] File generation and management
- [x] Syntax highlighting
- [x] Project export

### Phase 2 - Enhanced Features 🚧

- [ ] Live preview functionality
- [ ] Integrated terminal
- [ ] Package management
- [ ] Error handling and validation

### Phase 3 - Advanced Features 📅

- [ ] Version control integration
- [ ] Collaborative editing
- [ ] Template marketplace
- [ ] Cloud deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by [Bolt.new](https://bolt.new) design and functionality
- Built with [Together AI](https://together.ai) LLaMA integration
- Icons by [Lucide](https://lucide.dev)
- Syntax highlighting by [Prism.js](https://prismjs.com)

---

**WebMaker AI** - Building the future of conversational web development 🚀
