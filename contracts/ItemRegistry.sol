// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ItemRegistry {
    struct Item {
        string title;
        string description;
        string image;
        address auctionAddress;
    }

    Item[] public items;
    mapping(uint256 => address) public itemToOwner;

    function registerItem(
        string memory _title,
        string memory _description,
        string memory _image
    ) public {
        items.push(Item(_title, _description, _image, address(0)));
        uint256 itemId = items.length - 1;
        itemToOwner[itemId] = msg.sender;
    }

    function setAuctionAddress(uint256 _itemId, address _auctionAddress) public {
        require(msg.sender == itemToOwner[_itemId], "Only the item owner can set the auction address");
        items[_itemId].auctionAddress = _auctionAddress;
    }

    function getItem(uint256 _itemId) public view returns (Item memory) {
        return items[_itemId];
    }

    function getItemCount() public view returns (uint256) {
        return items.length;
    }
}
