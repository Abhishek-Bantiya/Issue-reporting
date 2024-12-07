import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Logout from './components/Logout';
import Issues from './components/Issues';
import Notifications from './components/Notifications';
import Insights from './components/Insights';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <ToastContainer />
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/logout' element={<Logout />} />
          <Route path='/' element={<ProtectedRoute><><Header /><Issues /></></ProtectedRoute>} />
          <Route path='/notifications' element={<ProtectedRoute><><Header /><Notifications /></></ProtectedRoute>} />
          <Route path='/insights' element={<ProtectedRoute><><Header /><Insights /></></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
