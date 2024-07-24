import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3';
import AuctionSystem from '../../contracts/AuctionSystem.json';

function Home() {
  const [auctions, setAuctions] = useState([]);
  const [error, setError] = useState('');

  const fetchAuctions = async () => {
    try {
      const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionSystem.networks[networkId];

      if (!deployedNetwork) {
        setError('Contrato não encontrado na rede selecionada.');
        return;
      }

      const contractAddress = deployedNetwork.address;
      const auctionSystem = new web3.eth.Contract(AuctionSystem.abi, contractAddress);

      const auctions = await auctionSystem.methods.getAllActiveAuctions().call();

      setAuctions(auctions);
    } catch (err) {
      setError('Erro ao buscar os leilões: ' + err.message);
    }
  };

  const renderAuctions = (auction, index) => {
    return (
      <Link key={`${auction.id}-${index}`} to={`/auction/${auction.id}`}>
        <img src={auction.imageURL} alt={auction.name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
        <p>{auction.name}</p>
      </Link>
    );
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return (
    <div className="container">
      <h1>Itens para Leilão</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Link to="/create-auction"><button>Adicionar Novo Item</button></Link>
      <ul>
        {auctions.map(renderAuctions)}
      </ul>
    </div>
  );
}

export default Home;