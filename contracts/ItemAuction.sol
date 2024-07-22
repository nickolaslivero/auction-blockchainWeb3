// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ItemAuction {
    address public owner;
    uint256 public itemId;
    address public highestBidder;
    uint256 public highestBid;
    mapping(address => uint256) public pendingReturns;
    bool public ended;

    event HighestBidIncreased(address bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);

    constructor(uint256 _itemId, address _owner) {
        owner = _owner;
        itemId = _itemId;
    }

    function bid() public payable {
        require(!ended, "Auction already ended");
        require(msg.value > highestBid, "There already is a higher bid");

        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function withdraw() public returns (bool) {
        uint256 amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;

            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    function auctionEnd() public {
        require(msg.sender == owner, "You are not the owner");
        require(!ended, "Auction end has already been called");

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        payable(owner).transfer(highestBid);
    }
}
