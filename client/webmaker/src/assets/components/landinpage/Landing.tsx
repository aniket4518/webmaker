import { useState } from "react";
import { Send } from "lucide-react";
import Header from "./Header.tsx";

interface LandingPageProps {
  onStartChat: (prompt?: string) => void;
}

const Landingpage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onStartChat(prompt.trim());
    } else {
      onStartChat();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900">
      {/* Circular radial gradient background */}
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <div className="w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-700 via-gray-900 to-gray-900 opacity-80"></div>
      </div>
      
      <Header onGetStarted={() => onStartChat()} />
      
      <div className="flex flex-col items-center justify-center min-h-[110vh] px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-4">
            What do you want to build?
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Prompt, run, edit, and deploy full-stack web and mobile apps with AI assistance.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your project idea... (e.g., 'Create a todo app with React')"
              className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-700 bg-gray-800/80 backdrop-blur-md focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-white placeholder-gray-400 transition-all duration-300 chat-input"
              style={{
                color: '#ffffff',
                backgroundColor: 'rgba(31, 41, 55, 0.67)'
              }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center space-x-1.5"
            >
              <Send size={18} />
              <span>build now</span>
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Or try one of these examples:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Create a React todo application",
              "Build a landing page with animations",
              "Make a simple blog website",
              "Design a dashboard with charts"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => onStartChat(example)}
                className="px-4 py-2 bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-300 text-sm"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => onStartChat()}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landingpage;