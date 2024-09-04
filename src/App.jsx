import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer } from 'react-toastify';

import Chat from './components/chat/Chat';
import List from './components/list/List';
import SignIn from './components/login/SignIn';
import SignUp from './components/login/SignUp';

import { auth } from './lib/firebase';
import { useUserStore } from './context/userStore';
import { useChatStore } from './context/chatStore';

import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS for notifications

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    // Listen for authentication state changes (login/logout)
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid); // Fetch user info when user state changes
    });

    // Clean up the subscription on component unmount
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  // Display a loading indicator while user data is being fetched
  if (isLoading) return <div className='loading'>Loading...</div>;

  return (
    <div className='container'>
      <BrowserRouter>
        {currentUser ? (
          <>
            {/* Show List if no chat is selected, otherwise show Chat */}
            {!chatId && <List />}
            {chatId && <Chat />}
          </>
        ) : (
          <Routes>
            {/* Routes for SignIn and SignUp components */}
            <Route path='/' element={<SignIn />} />
            <Route path='/sign-up' element={<SignUp />} />
          </Routes>
        )}
      </BrowserRouter>
      {/* Toast notifications for user feedback */}
      <ToastContainer
        position='bottom-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
      />
    </div>
  );
};

export default App;
