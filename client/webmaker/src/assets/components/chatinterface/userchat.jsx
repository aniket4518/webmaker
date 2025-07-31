import React, { useState } from "react";
import FileTree from "../FileTree";
import CodeViewer from "../CodeViewer";

const UserChat = () => {
  const [userInput, setUserInput] = useState("");
  const [llmResponse, setLlmResponse] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    setLlmResponse("");
    setFiles([]);
    setSelectedFile(null);
    try {
      const res = await fetch("http://localhost:5000/ask-llama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: userInput }),
      });
      const data = await res.json();
      setLlmResponse(data.reply || data.error || "No response");
      
      if (data.files && data.files.length > 0) {
        setFiles(data.files);
        // Auto-select the first file
        const firstFile = findFirstFile(data.files);
        if (firstFile) {
          setSelectedFile(firstFile);
        }
      }
    } catch (err) {
      setLlmResponse("Error contacting backend");
    }
    setLoading(false);
  };

  const findFirstFile = (fileStructure) => {
    for (const item of fileStructure) {
      if (item.type === 'file') {
        return item;
      }
      if (item.children) {
        const found = findFirstFile(item.children);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <div className="flex h-[80vh] w-full border rounded-lg shadow-lg overflow-hidden">
      {/* Left: User Input */}
      <div className="w-1/3 bg-gray-100 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Prompt</h2>
          <textarea
            className="w-full h-40 p-2 border rounded resize-none"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your prompt here..."
          />
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Code"}
        </button>
      </div>

      {/* Middle: File Tree */}
      {files.length > 0 && (
        <div className="w-1/4 border-r border-gray-200">
          <FileTree 
            files={files} 
            onFileSelect={setSelectedFile} 
            selectedFile={selectedFile}
          />
        </div>
      )}

      {/* Right: Code Viewer or Raw Response */}
      <div className={`${files.length > 0 ? 'w-5/12' : 'w-2/3'} bg-white flex flex-col`}>
        {files.length > 0 ? (
          <CodeViewer file={selectedFile} />
        ) : (
          <div className="p-6 flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4">Generated Code</h2>
            <div className="flex-1 overflow-auto border rounded p-4 bg-gray-50 whitespace-pre-wrap font-mono text-sm">
              {loading ? "Generating code..." : llmResponse}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChat;