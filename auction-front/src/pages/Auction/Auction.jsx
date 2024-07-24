import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import AuctionSystem from '../../contracts/AuctionSystem.json';
import '../../index.css';

function Auction() {
  const { auctionId } = useParams();
  const navigate = useNavigate();

  const [auction, setAuction] = useState({});
  const [account, setAccount] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [bidHistory, setBidHistory] = useState([]);
  
  const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");

  const fetchAuction = async () => {
    try {
      const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionSystem.networks[networkId];

      if (!deployedNetwork) {
        console.log('Contrato não encontrado na rede selecionada.');
        return;
      }
      const contractAddress = deployedNetwork.address;
      const auctionSystem = new web3.eth.Contract(AuctionSystem.abi, contractAddress);
      const auction = await auctionSystem.methods.getAuction(auctionId).call();
      setAuction(auction);

      const bidHistory = await auctionSystem.methods.getBidHistory(auctionId).call();
      setBidHistory(bidHistory);
    } catch (err) {
      console.log('Erro ao buscar os leilões: ' + err.message);
    }
  };

  const fetchAccount = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
  };

  const handleCloseAuction = async () => {
    if (typeof window.ethereum === 'undefined') {
      setErrorMessage('Metamask não está instalado.');
      return;
    }

    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = AuctionSystem.networks[networkId];

    if (!deployedNetwork) {
      console.log('Contrato não encontrado na rede selecionada.');
      return;
    }
    const contractAddress = deployedNetwork.address;
    const auctionSystem = new web3.eth.Contract(AuctionSystem.abi, contractAddress);
    await auctionSystem.methods.closeAuction(auctionId).send({
      from: account,
      gas: 6721975
    });

    navigate('/');
  };

  const handleBid = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        setErrorMessage('Metamask não está instalado.');
        return;
      }

      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionSystem.networks[networkId];

      if (!deployedNetwork) {
        setErrorMessage('Contrato não encontrado na rede selecionada.');
        return;
      }

      const contractAddress = deployedNetwork.address;
      const auctionSystem = new web3.eth.Contract(AuctionSystem.abi, contractAddress);

      await auctionSystem.methods.bid(auctionId).send({
        from: account,
        value: web3.utils.toWei(bidAmount, 'ether'),
        gas: 6721975
      });

      setSuccessMessage('Lance realizado com sucesso!');
      fetchAuction();
    } catch (err) {
      setErrorMessage('Erro ao dar lance: ' + err.message);
    }
  };

  useEffect(() => {
    fetchAuction();
    fetchAccount();
  }, []);

  return (
    <div className="container">
      <button onClick={() => navigate('/')}>Voltar para Lista de Itens</button>
      <h1>Leilão</h1>
      {account && auction.owner && account.toLowerCase() === auction.owner.toLowerCase() && (
        <button onClick={handleCloseAuction}>Fechar Leilão</button>
      )}
      <div className="item-info">
        <h2>{auction.name}</h2>
        <img src={auction.imageURL} alt={auction.name} />
        <p>{auction.description}</p>
      </div>
      <p>Lance Atual: {web3.utils.fromWei((auction.highestBid || '0'), 'ether')} Ether</p>
      <p>Maior Licitante: {auction.highestBidder}</p>
      <input
        type="text"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        placeholder="Valor do lance em Ether"
      />
      <button onClick={handleBid}>Dar Lance</button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <h2>Histórico de Lances</h2>
      <ul>
        {bidHistory.map((bid, index) => (
          <li key={index}>
            Licitante: {bid.bidder} - Valor: {web3.utils.fromWei(bid.amount, 'ether')} Ether
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Auction;
