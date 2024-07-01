import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar';

import Home from './Home';
import AddStudio from './AddStudio';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/AddStudio" element={<AddStudio/>}/>
      </Routes>
    </Router>
  );
}

export default App;
