import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import AuctionSystem from '../../contracts/AuctionSystem.json';


const CreateAuction = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    imageURL: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const createAuction = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        setErrorMessage('Metamask não está instalado.');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionSystem.networks[networkId];

      if (!deployedNetwork) {
        setErrorMessage('Contrato não encontrado na rede selecionada.');
        return;
      }

      const contractAddress = deployedNetwork.address;
      const auctionSystem = new web3.eth.Contract(AuctionSystem.abi, contractAddress);

      await auctionSystem.methods.createAuction(
        form.name,
        form.description,
        form.imageURL
      ).send({
        from: account,
        gas: 6721975 
      });

      navigate('/');
    } catch (error) {
      setErrorMessage('Erro ao criar o leilão: ' + error.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <h1>Cadastrar Item para Leilão</h1>
      <div>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Título do Item"
        />
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descrição do Item"
        />
        <input
          type="text"
          name="imageURL"
          value={form.imageURL}
          onChange={handleChange}
          placeholder="Link da Imagem do Item"
        />
        <button onClick={createAuction}>Cadastrar Leilão</button>
        <button onClick={() => navigate('/')}>Voltar para Lista de Itens</button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
    </div>
  );
}

export default CreateAuction;