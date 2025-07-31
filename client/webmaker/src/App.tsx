import { useState } from "react";
import UserChat from "./assets/components/chatinterface/userchat";
import Landingpage from "./assets/components/landinpage/Landing";

function App() {
  const [showChat, setShowChat] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");

  const handleStartChat = (prompt?: string) => {
    if (prompt) {
      setInitialPrompt(prompt);
    }
    setShowChat(true);
  };

  const handleBackToLanding = () => {
    setShowChat(false);
    setInitialPrompt("");
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      {showChat ? (
        <UserChat 
          initialPrompt={initialPrompt} 
          onBackToLanding={handleBackToLanding}
        />
      ) : (
        <Landingpage onStartChat={handleStartChat} />
      )}
    </div>
  );
}

export default App;