import React, { useState } from "react";

const UserChat = () => {
  const [userInput, setUserInput] = useState("");
  const [llmResponse, setLlmResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    setLlmResponse("");
    try {
      const res = await fetch("http://localhost:5000/ask-llama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: userInput }),
      });
      const data = await res.json();
      setLlmResponse(data.reply || data.error || "No response");
    } catch (err) {
      setLlmResponse("Error contacting backend");
    }
    setLoading(false);
  };

  return (
    <div className="flex h-[80vh] w-full border rounded-lg shadow-lg overflow-hidden">
      {/* Left: User Input */}
      <div className="w-1/2 bg-gray-100 p-6 flex flex-col justify-between">
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
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
      {/* Right: LLM Response */}
      <div className="w-1/2 bg-white p-6 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">LLM Response</h2>
        <div className="flex-1 overflow-auto border rounded p-2 bg-gray-50 whitespace-pre-wrap">
          {loading ? "Waiting for response..." : llmResponse}
        </div>
      </div>
    </div>
  );
};

export default UserChat;