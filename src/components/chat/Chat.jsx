import { useEffect, useRef, useState } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../context/chatStore';
import { useUserStore } from '../../context/userStore';
import upload from '../../lib/upload';
import { toast } from 'react-toastify';

const Chat = () => {
  const [chat, setChat] = useState(); // State to store the chat data
  const [open, setOpen] = useState(false); // State to manage emoji picker visibility
  const [text, setText] = useState(''); // State for the message text
  const [loading, setLoading] = useState(false); // State to manage loading state
  const [img, setImg] = useState({ file: null, url: '' }); // State for the image to be sent

  const { currentUser } = useUserStore();
  const {
    chatId,
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlock,
    setChatId,
  } = useChatStore();

  const endRef = useRef(null); // Reference to the end of the chat for scrolling

  // Scroll to the bottom of the chat when a new message is received
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Fetch chat data when the chatId changes
  useEffect(() => {
    const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
      setChat(res.data());
    });

    // Clean up the listener on unmount
    return () => {
      unSub();
    };
  }, [chatId]);

  // Handle emoji selection and append it to the message text
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
  };

  // Handle image selection and store it in the state
  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  // Handle blocking or unblocking the user
  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, 'users', currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle sending the message
  const handleSend = async (event) => {
    setLoading(true);
    event.preventDefault();

    // Prevent sending if both text and image are missing
    if (!text.trim() && !img.file) return;

    let imgUrl = null;

    try {
      // Upload the image if it exists
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      // Create the message object
      const message = {
        senderId: currentUser.id,
        createdAt: new Date(),
        ...(imgUrl && { img: imgUrl }), // Include image URL if available
        ...(text && { text: text.trim() }), // Include message text if available
      };

      // Update Firestore with the new message
      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion(message),
      });

      // Update the last message in the user chats
      const userIDs = [currentUser.id, user.id];
      await Promise.all(
        userIDs.map(async (id) => {
          const userChatsRef = doc(db, 'userchats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatsData = userChatsSnapshot.data();
            const chatIndex = userChatsData.chats.findIndex(
              (c) => c.chatId === chatId
            );

            if (chatIndex !== -1) {
              userChatsData.chats[chatIndex].lastMessage = imgUrl
                ? 'Image'
                : text.trim();
              userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
              userChatsData.chats[chatIndex].updatedAt = Date.now();

              await updateDoc(userChatsRef, {
                chats: userChatsData.chats,
              });
            }
          }
        })
      );
    } catch (err) {
      toast.error('Error sending message: ' + err.message);
    } finally {
      setImg({ file: null, url: '' });
      setText('');
      setLoading(false);
    }
  };

  return (
    <div className='chat'>
      <div className='top'>
        <div className='user'>
          <div className='back'>
            <img
              src='/arrow.jpg'
              alt='Back'
              onClick={() => {
                setChatId(null);
              }}
            />
          </div>
          <img src={user?.avatar || './avatar.png'} alt='User Avatar' />
          <div className='texts'>
            <span>{user?.username}</span>
          </div>
        </div>
        <button onClick={handleBlock} className='block-user'>
          {isCurrentUserBlocked
            ? 'You are Blocked!'
            : isReceiverBlocked
            ? 'User blocked'
            : 'Block User'}
        </button>
      </div>

      <div className='center'>
        {/* Render messages */}
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id ? 'message own' : 'message'
            }
            key={message.createdAt.toMillis()} // Using a unique key
          >
            <div className='texts'>
              {message.img && <img src={message.img} alt='Message Image' />}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      <div>
        <form
          className='bottom'
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'flex-start',
          }}
          onSubmit={handleSend}
        >
          {/* Preview selected image */}
          {img.url && (
            <div className='message own'>
              <div className='texts'>
                <img src={img.url} alt='Selected to Send' className='img-send' />
              </div>
            </div>
          )}

          <div
            className='bottom'
            style={{ width: '100%', borderTop: 'none', flexWrap: 'wrap' }}
          >
            <div className='icons'>
              <label htmlFor='file'>
                <img src='./img.png' alt='Attach' />
              </label>
              <input
                type='file'
                id='file'
                style={{ display: 'none' }}
                onChange={handleImg}
                disabled={isCurrentUserBlocked || isReceiverBlocked}
              />
            </div>
            <input
              className='text-input'
              type='text'
              placeholder={
                isCurrentUserBlocked || isReceiverBlocked
                  ? 'You cannot send a message'
                  : 'Type a message...'
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isCurrentUserBlocked || isReceiverBlocked}
            />
            <div className='emoji'>
              <img
                src='./emoji.png'
                alt='Emoji Picker'
                onClick={() => setOpen((prev) => !prev)}
              />
              <div className='picker'>
                <EmojiPicker
                  open={open}
                  onEmojiClick={handleEmoji}
                  disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
              </div>
            </div>
            <button
              className='sendButton'
              disabled={isCurrentUserBlocked || isReceiverBlocked || loading}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
