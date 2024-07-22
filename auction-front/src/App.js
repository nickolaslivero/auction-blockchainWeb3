import React, { useState, useEffect } from 'react';
import Auction from './Auction';
import Web3 from 'web3';
import './index.css';

function App() {
  const [accounts, setAccounts] = useState([]);
  const [highestBid, setHighestBid] = useState('0');
  const [highestBidder, setHighestBidder] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");

  useEffect(() => {
    async function load() {
      if (!Auction) {
        console.error("Contrato não encontrado.");
        return;
      }
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccounts(accounts);

        const highestBid = await Auction.methods.highestBid().call();
        setHighestBid(highestBid);

        const highestBidder = await Auction.methods.highestBidder().call();
        setHighestBidder(highestBidder);

        console.log('Accounts:', accounts);
        console.log('Highest Bid:', highestBid);
        console.log('Highest Bidder:', highestBidder);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
    load();
  }, []);

  const placeBid = async () => {
    setErrorMessage('');
    const bidValueInWei = web3.utils.toWei(bidAmount, 'ether');

    // Validação: Verificar se o valor do lance é maior que o lance atual
    if (parseInt(bidValueInWei) <= parseInt(highestBid)) {
      setErrorMessage('O valor do lance deve ser maior que o lance atual.');
      return;
    }

    try {
      await Auction.methods.bid().send({
        from: accounts[0],
        value: bidValueInWei
      });

      const highestBid = await Auction.methods.highestBid().call();
      setHighestBid(highestBid);

      const highestBidder = await Auction.methods.highestBidder().call();
      setHighestBidder(highestBidder);

      console.log('New Highest Bid:', highestBid);
      console.log('New Highest Bidder:', highestBidder);
    } catch (error) {
      console.error('Error placing bid:', error.message);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="container">
      <h1>Leilão</h1>
      <p>Lance Atual: {web3.utils.fromWei(highestBid, 'ether')} Ether</p>
      <p>Maior Licitante: {highestBidder}</p>
      <input
        type="text"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        placeholder="Valor do lance em Ether"
      />
      <button onClick={placeBid}>Dar Lance</button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default App;
