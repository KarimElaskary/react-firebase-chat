import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import './signIn.css';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const SignIn = () => {
  const [email, setEmail] = useState(''); // State for email input
  const [password, setPassword] = useState(''); // State for password input
  const [loading, setLoading] = useState(false); // State to handle loading status

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent form submission from reloading the page
    setLoading(true); // Set loading to true while the authentication process is running

    try {
      // Attempt to sign in with the provided email and password
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Log in successful'); // Show success notification
    } catch (err) {
      toast.error('Log in failed: ' + err.message); // Show error notification with error message
    } finally {
      setLoading(false); // Reset loading state after the authentication attempt
    }
  };

  return (
    <div className='container-login'>
      <form onSubmit={handleLogin} className='log-in'>
        <h1>Welcome</h1>
        <input
          type='email'
          placeholder='Email'
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type='password'
          placeholder='Password'
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button disabled={loading}>
          {loading ? 'Loading...' : 'Sign In'} {/* Show "Loading..." text when the button is disabled */}
        </button>
        <h3>Or</h3>
        <Link to={'/sign-up'} className='Link'>
          Create Account
        </Link>
      </form>
    </div>
  );
};

export default SignIn;
