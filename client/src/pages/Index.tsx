import { useState, useEffect } from "react";
import { socket, connectSocket, disconnectSocket } from "@/lib/socket";

const Index = () => {
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    connectSocket();

    // Handle initial text when connecting
    socket.on("initialText", (initialText: string) => {
      setText(initialText);
    });

    socket.on("userTyping", (userId: string) => {
      setTypingUsers((prev) => new Set(prev).add(userId));
    });

    socket.on("userStoppedTyping", (userId: string) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socket.on("textUpdate", (newText: string) => {
      setText(newText);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    socket.emit("updateText", newText);
    socket.emit("typing", socket.id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Live Typing Fountain
          </h1>
          <p className="text-muted-foreground">
            Type something and watch it flow in real-time
          </p>
        </div>

        <div className="typing-container">
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Start typing..."
            className="typing-input"
            rows={4}
          />
          
          {typingUsers.size > 0 && (
            <div className="typing-indicator">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="ml-2">
                {typingUsers.size} {typingUsers.size === 1 ? 'person' : 'people'} typing
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;