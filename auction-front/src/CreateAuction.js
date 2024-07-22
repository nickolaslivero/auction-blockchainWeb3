import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import bigInt from 'big-integer';
import ItemRegistry from './contracts/ItemRegistry.json';
import ItemAuction from './contracts/ItemAuction.json';

function CreateAuction() {
  const [itemInfo, setItemInfo] = useState({
    title: '',
    description: '',
    image: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");

  const createAuction = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!itemInfo.title || !itemInfo.description || !itemInfo.image) {
      setErrorMessage('Todos os campos são obrigatórios.');
      return;
    }

    try {
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const itemRegistry = new web3.eth.Contract(
        ItemRegistry.abi,
        ItemRegistry.networks[networkId].address
      );

      await itemRegistry.methods.registerItem(
        itemInfo.title,
        itemInfo.description,
        itemInfo.image
      ).send({
        from: accounts[0],
        gas: 6721975 // Limite de gás suficiente
      });

      const itemCount = await itemRegistry.methods.getItemCount().call();
      const itemId = bigInt(itemCount).subtract(bigInt(1)); // Use bigInt

      const auction = new web3.eth.Contract(ItemAuction.abi);
      const auctionInstance = await auction.deploy({
        data: ItemAuction.bytecode,
        arguments: [itemId.toString(), accounts[0]] // Certifique-se de que os argumentos estão corretos
      }).send({
        from: accounts[0],
        gas: 6721975 // Limite de gás suficiente
      });

      await itemRegistry.methods.setAuctionAddress(itemId.toString(), auctionInstance.options.address).send({
        from: accounts[0],
        gas: 6721975 // Limite de gás suficiente
      });

      setSuccessMessage('Leilão criado com sucesso!');
      navigate('/');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleChange = (e) => {
    setItemInfo({ ...itemInfo, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <h1>Cadastrar Item para Leilão</h1>
      <div>
        <input
          type="text"
          name="title"
          value={itemInfo.title}
          onChange={handleChange}
          placeholder="Título do Item"
        />
        <input
          type="text"
          name="description"
          value={itemInfo.description}
          onChange={handleChange}
          placeholder="Descrição do Item"
        />
        <input
          type="text"
          name="image"
          value={itemInfo.image}
          onChange={handleChange}
          placeholder="Link da Imagem do Item"
        />
        <button onClick={createAuction}>Cadastrar Leilão</button>
        <button onClick={() => navigate('/')}>Voltar para Lista de Itens</button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      </div>
    </div>
  );
}

export default CreateAuction;
