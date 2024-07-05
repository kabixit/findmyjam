import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar';

import Home from './Home';
import AddStudio from './AddStudio';
import StartJam from './StartJam';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/AddStudio" element={<AddStudio/>}/>
        <Route path="/StartJam" element={<StartJam/>}/>
      </Routes>
    </Router>
  );
}

export default App;
