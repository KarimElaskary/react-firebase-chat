import './userInfo.css'
import { useUserStore } from '../../../context/userStore'
import { auth } from '../../../lib/firebase'
import { useChatStore } from '../../../context/chatStore'

const Userinfo = () => {
  const { currentUser } = useUserStore()
  const { resetChat } = useChatStore()

  const handleLogout = () => {
    auth.signOut()
    resetChat()
  }

  return (
    <div className='userInfo'>
      <div className='user'>
        <img src={currentUser.avatar || './avatar.png'} alt='' />
        <h2>{currentUser.username}</h2>
      </div>
      <button className='logout' onClick={handleLogout}>
        Log out
      </button>
    </div>
  )
}

export default Userinfo
