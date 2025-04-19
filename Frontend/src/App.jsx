import './App.css'
import {Routes, Route, Navigate} from 'react-router-dom'

import HomePage from './pages/Home/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import LoadingSpinner from './components/common/LoadingSpinner'
import NotificationPage from './pages/notification/NotificationPage'
import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'

import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import ProfilePage from './pages/Profile/ProfilePage'

function App() {
  //protecting route getting authenticated user
  const { data:authUser, isLoading} = useQuery({
    queryKey: ['authUser'],
    queryFn: async() => {
      try {
				const res = await fetch("/api/auth/getAuthUser");
				const user = await res.json();
				if (user.error) return null;
				if (!res.ok) {
					throw new Error(user.error || "Something went wrong");
				}
				return user;
			} catch (error) {
				throw new Error(error);
			}
		},
		retry: false,
  })

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen w-full'>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser && < Sidebar /> }
      <Routes>
			  <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
				<Route path='/profile/:userName' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster/>
    </div>
  )
}

export default App
