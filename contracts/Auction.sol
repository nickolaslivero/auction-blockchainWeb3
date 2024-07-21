// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Auction {
    address public owner;
    uint public highestBid;
    address public highestBidder;
    bool public ended;

    mapping(address => uint) public bids;

    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    constructor() {
        owner = msg.sender;
    }

    function bid() public payable {
        require(!ended, "Auction already ended.");
        require(msg.value > highestBid, "There already is a higher bid.");

        if (highestBid != 0) {
            bids[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function withdraw() public returns (bool) {
        uint amount = bids[msg.sender];
        if (amount > 0) {
            bids[msg.sender] = 0;

            if (!payable(msg.sender).send(amount)) {
                bids[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    function endAuction() public {
        require(msg.sender == owner, "You are not the owner.");
        require(!ended, "Auction already ended.");

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        payable(owner).transfer(highestBid);
    }
}
