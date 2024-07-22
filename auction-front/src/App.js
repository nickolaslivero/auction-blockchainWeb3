import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ItemList from './ItemList';
import CreateAuction from './CreateAuction';
import Home from './Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/create-auction" element={<CreateAuction />} />
        <Route path="/item/:itemId" element={<Home />} />
        <Route path="/" element={<ItemList />} />
      </Routes>
    </Router>
  );
}

export default App;
