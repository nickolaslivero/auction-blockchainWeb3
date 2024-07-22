import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import ItemRegistry from './contracts/ItemRegistry.json';
import ItemAuction from './contracts/ItemAuction.json';
import './index.css';

function Home() {
  const { itemId } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [highestBid, setHighestBid] = useState('0');
  const [highestBidder, setHighestBidder] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [bidHistory, setBidHistory] = useState([]);
  const [itemInfo, setItemInfo] = useState({
    title: '',
    description: '',
    image: ''
  });

  const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!ItemRegistry || !ItemAuction) {
        console.error("Contrato não encontrado.");
        return;
      }
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccounts(accounts);

        const networkId = await web3.eth.net.getId();
        const itemRegistry = new web3.eth.Contract(
          ItemRegistry.abi,
          ItemRegistry.networks[networkId] && ItemRegistry.networks[networkId].address
        );
        const item = await itemRegistry.methods.getItem(itemId).call();
        setItemInfo({
          title: item.title,
          description: item.description,
          image: item.image
        });

        const auction = new web3.eth.Contract(
          ItemAuction.abi,
          item.auctionAddress
        );
        const highestBid = await auction.methods.highestBid().call();
        setHighestBid(highestBid);

        const highestBidder = await auction.methods.highestBidder().call();
        setHighestBidder(highestBidder);

        updateBidHistory(auction);

        console.log('Accounts:', accounts);
        console.log('Highest Bid:', highestBid);
        console.log('Highest Bidder:', highestBidder);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }

    load();
  }, [itemId]);

  const updateBidHistory = async (auctionContract) => {
    const bidEvents = await auctionContract.getPastEvents('HighestBidIncreased', {
      fromBlock: 0,
      toBlock: 'latest'
    });
    setBidHistory(bidEvents);
  };

  const placeBid = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    const bidValueInWei = web3.utils.toWei(bidAmount, 'ether');

    if (parseInt(bidValueInWei) <= parseInt(highestBid)) {
      setErrorMessage('O valor do lance deve ser maior que o lance atual.');
      return;
    }

    try {
      const networkId = await web3.eth.net.getId();
      const itemRegistry = new web3.eth.Contract(
        ItemRegistry.abi,
        ItemRegistry.networks[networkId] && ItemRegistry.networks[networkId].address
      );
      const item = await itemRegistry.methods.getItem(itemId).call();
      const auction = new web3.eth.Contract(
        ItemAuction.abi,
        item.auctionAddress
      );

      await auction.methods.bid().send({
        from: accounts[0],
        value: bidValueInWei
      });

      const highestBid = await auction.methods.highestBid().call();
      setHighestBid(highestBid);

      const highestBidder = await auction.methods.highestBidder().call();
      setHighestBidder(highestBidder);

      updateBidHistory(auction);

      setSuccessMessage('Lance realizado com sucesso!');
      console.log('New Highest Bid:', highestBid);
      console.log('New Highest Bidder:', highestBidder);
    } catch (error) {
      console.error('Error placing bid:', error.message);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="container">
      <button onClick={() => navigate('/')}>Voltar para Lista de Itens</button>
      <h1>Leilão</h1>
      <div className="item-info">
        <h2>{itemInfo.title}</h2>
        <img src={itemInfo.image} alt={itemInfo.title} />
        <p>{itemInfo.description}</p>
      </div>
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
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <h2>Histórico de Lances</h2>
      <ul>
        {bidHistory.map((bid, index) => (
          <li key={index}>
            Licitante: {bid.returnValues.bidder} - Valor: {web3.utils.fromWei(bid.returnValues.amount, 'ether')} Ether
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
