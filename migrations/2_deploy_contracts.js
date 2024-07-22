const ItemRegistry = artifacts.require("ItemRegistry");
const ItemAuction = artifacts.require("ItemAuction");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(ItemRegistry);
  const itemRegistryInstance = await ItemRegistry.deployed();
  
  await deployer.deploy(ItemAuction, 0, accounts[0]);
};
