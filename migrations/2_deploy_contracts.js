const Auction = artifacts.require("Auction");

module.exports = function (deployer, network, accounts) {
  const biddingTime = 600;
  const beneficiary = accounts[0];
  deployer.deploy(Auction, biddingTime, beneficiary);
};
