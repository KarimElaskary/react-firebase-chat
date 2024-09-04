import React, { createContext, useContext, useState } from 'react';

// Create a context for chat-related state
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // State for current chat ID
  const [chatId, setChatId] = useState(null);
  // State for the user in the current chat
  const [user, setUser] = useState(null);
  // States to track if the current user or the receiver is blocked
  const [isCurrentUserBlocked, setIsCurrentUserBlocked] = useState(false);
  const [isReceiverBlocked, setIsReceiverBlocked] = useState(false);


  const changeChat = (newChatId, newUser, currentUser) => {
    if (!currentUser) return; // If there's no current user, do nothing

    // Check if the new user is blocked by the current user
    const isUserBlocked = newUser.blocked.includes(currentUser.id);
    // Check if the current user is blocked by the new user
    const isReceiverBlocked = currentUser.blocked.includes(newUser.id);

    // Update state based on blocking status
    setChatId(newChatId);
    setUser(isUserBlocked ? null : newUser);
    setIsCurrentUserBlocked(isUserBlocked);
    setIsReceiverBlocked(isReceiverBlocked);
  };

  /**
   * Toggle the block status of the receiver.
   */
  const changeBlock = () => {
    setIsReceiverBlocked(prev => !prev);
  };

  /**
   * Reset the chat state.
   */
  const resetChat = () => {
    setChatId(null);
    setUser(null);
    setIsCurrentUserBlocked(false);
    setIsReceiverBlocked(false);
  };

  return (
    <ChatContext.Provider
      value={{
        chatId,
        user,
        isCurrentUserBlocked,
        isReceiverBlocked,
        changeChat,
        changeBlock,
        resetChat,
        setChatId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChatStore = () => useContext(ChatContext);
