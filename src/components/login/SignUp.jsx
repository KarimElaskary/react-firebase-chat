import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import upload from '../../lib/upload';
import './signUp.css';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const SignUp = () => {
  const [avatar, setAvatar] = useState({ file: null, url: '' });
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form fields
    if (!username || !email || !password) {
      toast.info('Please fill out all fields');
      setLoading(false);
      return;
    }

    try {
      // Check if username already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error('Username already taken');
        setLoading(false);
        return;
      }

      // Create user with email and password
      const res = await createUserWithEmailAndPassword(auth, email, password);
      
      // Upload avatar if provided
      let imgUrl = '';
      if (avatar.file) {
        imgUrl = await upload(avatar.file);
      }

      // Save user data to Firestore
      await setDoc(doc(db, 'users', res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      // Initialize user's chat data
      await setDoc(doc(db, 'userchats', res.user.uid), {
        chats: [],
      });

      toast.success('Account created successfully!');
    } catch (err) {
      toast.error('Failed to create account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container-createaccount'>
      <form onSubmit={handleRegister} className='create-account'>
        <h2>Create Account!</h2>
        <img src={avatar.url || './avatar.png'} alt='User avatar' />
        <label htmlFor='pfp'>Upload an Image</label>
        <input type='file' id='pfp' hidden onChange={handleAvatar} />
        <input
          type='text'
          placeholder='Username'
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button disabled={loading}>{loading ? 'Loading...' : 'Sign Up'}</button>
        <div className='navigation'>
          <h3>Already have an Account?</h3>
          <Link to={'/'} className='Link'>
            Sign In Here!
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
