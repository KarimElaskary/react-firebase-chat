import { useEffect, useState } from 'react';
import './chatList.css';
import AddUser from './addUser/AddUser';
import { useUserStore } from '../../../context/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../context/chatStore';
import { toast } from 'react-toastify';

const ChatList = () => {
  const [chats, setChats] = useState([]); // State to store the list of chats
  const [addMode, setAddMode] = useState(false); // State to toggle add user mode
  const [input, setInput] = useState(''); // State to store search input

  const { changeChat } = useChatStore(); // Function to change the active chat
  const { currentUser } = useUserStore(); // Get the current user from the user store

  // Fetch chats and subscribe to real-time updates
  useEffect(() => {
    const unSub = onSnapshot(doc(db, 'userchats', currentUser.id), async (res) => {
      const items = res.data().chats;

      // Fetch each chat's user data
      const promises = items.map(async (item) => {
        const userDocRef = doc(db, 'users', item.receiverId);
        const userDocSnap = await getDoc(userDocRef);

        const user = userDocSnap.data();

        return { ...item, user }; // Merge chat data with user data
      });

      const chatData = await Promise.all(promises);

      // Sort chats by the most recent message
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => {
      unSub(); // Cleanup subscription on component unmount
    };
  }, [currentUser.id]);

  // Handle chat selection
  const handleSelect = async (chat) => {
    const updatedChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = updatedChats.findIndex((item) => item.chatId === chat.chatId);

    // Mark the selected chat as seen
    updatedChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, 'userchats', currentUser.id);

    try {
      // Update the chat's seen status in Firestore
      await updateDoc(userChatsRef, {
        chats: updatedChats,
      });
      changeChat(chat.chatId, chat.user, currentUser); // Change the active chat
    } catch (err) {
      toast.error('Error selecting chat: ' + err.message);
    }
  };

  // Filter chats based on the search input
  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className='chatList'>
      <div className='search'>
        <div className='searchBar'>
          <img src='./search.png' alt='Search Icon' />
          <input
            type='text'
            placeholder='Search'
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? './minus.png' : './plus.png'}
          alt={addMode ? 'Close Add User' : 'Add User'}
          className='add'
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {/* Render the filtered chat list */}
      {filteredChats.map((chat) => (
        <div
          className='item'
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? 'transparent' : '#5183fe', // Highlight unread chats
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? './avatar.png'
                : chat.user.avatar || './avatar.png'
            }
            alt='User Avatar'
          />
          <div className='texts'>
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? 'User'
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {/* Render AddUser component if addMode is true */}
      {addMode && <AddUser addMode={addMode} setAddMode={setAddMode} />}
    </div>
  );
};

export default ChatList;
