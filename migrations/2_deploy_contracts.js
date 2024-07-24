const AuctionSystem = artifacts.require("AuctionSystem");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(AuctionSystem);
  
  const auctionSystemInstance = await AuctionSystem.deployed();

  console.log('AuctionSystem deployed at:', auctionSystemInstance.address);
};