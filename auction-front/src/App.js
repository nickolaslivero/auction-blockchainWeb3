import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import CreateAuction from './pages/CreateAuction/CreateAuction';
import Auction from './pages/Auction/Auction';
import MetaMaskAuth from './pages/MetaMaskAuth/MetaMaskAuth';

function App() {
  return (
    <Router>
      <MetaMaskAuth>
        <Routes>
          <Route path="/create-auction" element={<CreateAuction />} />
          <Route path="/auction/:auctionId" element={<Auction />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </MetaMaskAuth>
    </Router>
  );
}

export default App;