import Web3 from 'web3';
import auctionArtifact from './Auction.json';

const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");

const networkId = Object.keys(auctionArtifact.networks)[0];
let Auction = null;

if (networkId) {
  Auction = new web3.eth.Contract(
    auctionArtifact.abi,
    auctionArtifact.networks[networkId].address
  );
} else {
  console.error("Contrato não implantado na rede atual");
}

export default Auction;
