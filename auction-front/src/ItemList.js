import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3';
import ItemRegistry from './contracts/ItemRegistry.json';

function ItemList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function loadItems() {
      const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
      const networkId = await web3.eth.net.getId();
      const itemRegistry = new web3.eth.Contract(
        ItemRegistry.abi,
        ItemRegistry.networks[networkId] && ItemRegistry.networks[networkId].address
      );
      const itemCount = await itemRegistry.methods.getItemCount().call();
      const loadedItems = [];
      for (let i = 0; i < itemCount; i++) {
        const item = await itemRegistry.methods.getItem(i).call();
        loadedItems.push(item);
      }
      setItems(loadedItems);
    }
    loadItems();
  }, []);

  return (
    <div className="container">
      <h1>Itens para Leilão</h1>
      <Link to="/create-auction"><button>Adicionar Novo Item</button></Link>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <Link to={`/item/${index}`}>
              <img src={item.image} alt={item.title} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
              <p>{item.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemList;
