// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuctionSystem {
    struct Auction {
        uint id;
        string name;
        string description;
        string imageURL;
        address owner;
        address highestBidder;
        uint highestBid;
        bool isActive;
        Bid[] bidHistory;
    }

    struct Bid {
        address bidder;
        uint amount;
    }

    mapping(uint => Auction) public auctions;
    uint[] public auctionIds;
    uint public nextAuctionId;

    event AuctionCreated(uint auctionId, string name, string description, string imageURL);
    event NewBid(uint auctionId, address bidder, uint amount);
    event AuctionClosed(uint auctionId, address winner, uint amount);

    // Cria um novo leilão
    function createAuction(string memory _name, string memory _description, string memory _imageURL) public {
        Auction storage newAuction = auctions[nextAuctionId];
        newAuction.id = nextAuctionId;
        newAuction.name = _name;
        newAuction.description = _description;
        newAuction.imageURL = _imageURL;
        newAuction.owner = msg.sender;
        newAuction.highestBidder = address(0);
        newAuction.highestBid = 0;
        newAuction.isActive = true;
        auctionIds.push(nextAuctionId);
        emit AuctionCreated(nextAuctionId, _name, _description, _imageURL);
        nextAuctionId++;
    }

    // Obter todos os leilões ativos
    function getAllActiveAuctions() public view returns (Auction[] memory) {
        uint activeCount = 0;
        
        // Contar quantos leilões estão ativos
        for (uint i = 0; i < auctionIds.length; i++) {
            if (auctions[auctionIds[i]].isActive) {
                activeCount++;
            }
        }

        Auction[] memory activeAuctions = new Auction[](activeCount);
        uint index = 0;

        // Adicionar leilões ativos ao array
        for (uint i = 0; i < auctionIds.length; i++) {
            if (auctions[auctionIds[i]].isActive) {
                activeAuctions[index] = auctions[auctionIds[i]];
                index++;
            }
        }

        return activeAuctions;
    }

    // Fecha um leilão e transfere o prêmio ao maior licitante
    function closeAuction(uint _auctionId) public {
        Auction storage auction = auctions[_auctionId];

        require(auction.isActive, "Leilao ja esta fechado.");
        require(msg.sender == auction.owner, "Somente o dono do leilao pode fechar o leilao.");

        auction.isActive = false;
        if (auction.highestBidder != address(0)) {
            emit AuctionClosed(_auctionId, auction.highestBidder, auction.highestBid);
        }
    }

    // Retorna informações sobre um leilão específico
    function getAuction(uint _auctionId) public view returns (Auction memory) {
        Auction storage auction = auctions[_auctionId];
        return auction;
    }

    // Faz um lance em um leilão
    function bid(uint _auctionId) public payable {
        Auction storage auction = auctions[_auctionId];

        require(auction.isActive, "Leilao nao esta ativo.");
        require(msg.value > auction.highestBid, "O lance deve ser maior que o maior lance atual.");

        // Se houver um lance anterior, devolver o valor ao anterior maior licitante
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;

        // Registrar o lance no histórico
        auction.bidHistory.push(Bid({
            bidder: msg.sender,
            amount: msg.value
        }));

        emit NewBid(_auctionId, msg.sender, msg.value);
    }

    // Retorna o histórico de lances de um leilão específico
    function getBidHistory(uint _auctionId) public view returns (Bid[] memory) {
        return auctions[_auctionId].bidHistory;
    }
}
