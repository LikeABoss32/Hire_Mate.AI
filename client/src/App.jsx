import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'
import InterviewPage from './pages/InterviewPage'
import InterviewHistory from './pages/InterviewHistory'
import InterviewReport from './pages/InterviewReport'
import GDPage from './pages/GDPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminReport from './pages/AdminReport'

export const ServerUrl  = "https://hiremateserver-ai.onrender.com"

function App() {

  const dispatch = useDispatch()
  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/user/current-user",
          { withCredentials: true }
        );
  
        dispatch(setUserData(result.data));
      } catch (error) {
        console.log("User not logged in");
        dispatch(setUserData(null));
      }
    };
  
    getUser();
  }, [dispatch]);

  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/auth' element={<Auth/>}/>
      <Route path='/interview' element={<InterviewPage/>}/>
      <Route path='/history' element={<InterviewHistory/>}/>
      <Route path='/report/:id' element={<InterviewReport/>}/>
      <Route path='/gd' element={<GDPage/>}/>
      <Route path='/admin' element={<AdminLogin/>}/>
      <Route path='/admin/dashboard' element={<AdminDashboard/>}/>
      <Route path='/admin/report/:id' element={<AdminReport/>}/>
    </Routes>
  )
}

export default App
