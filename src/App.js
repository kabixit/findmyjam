import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar';

import Home from './Home';
import Login from './Login';
import SignUp from './SignUp';
import Onboarding from './OnBoarding';
import JoinJam from './JoinJam';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login/>}/>
        <Route path="/SignUp" element={<SignUp/>}/>
        <Route path="/OnBoarding" element={<Onboarding/>}/>
        <Route path="/JoinJam" element={<JoinJam/>}/>
      </Routes>
    </Router>
  );
}

export default App;
