import './addUser.css';
import { db } from '../../../../lib/firebase';
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useState } from 'react';
import { useUserStore } from '../../../../context/userStore';
import { toast } from 'react-toastify';

const AddUser = ({ addMode, setAddMode }) => {
  const [user, setUser] = useState(null); // State to store the searched user

  const { currentUser } = useUserStore(); // Get the current user from the user store

  // Handle search for a user by username
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');

    try {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('username', '==', username));

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data()); // Set the found user in the state
      } else {
        toast.error('User not found');
      }
    } catch (err) {
      toast.error('Error searching for user: ' + err.message);
    }
  };

  // Handle adding the user to the chat
  const handleAdd = async () => {
    setAddMode(!addMode); // Toggle add mode off after adding the user
    const chatRef = collection(db, 'chats');
    const userChatsRef = collection(db, 'userchats');

    try {
      const newChatRef = doc(chatRef); // Create a new chat document reference

      // Create a new chat document in Firestore
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Update the current user's chat list with the new chat
      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: '',
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });

      // Update the added user's chat list with the new chat
      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: '',
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      toast.success('User added successfully');
    } catch (err) {
      toast.error('Error adding user: ' + err.message);
    }
  };

  return (
    <div className='addUser'>
      <form onSubmit={handleSearch}>
        <input type='text' placeholder='Username' name='username' required />
        <button type='submit'>Search</button>
      </form>

      {/* Render the found user details and the add button */}
      {user && (
        <div className='user'>
          <div className='detail'>
            <img src={user.avatar || './avatar.png'} alt='User Avatar' />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
