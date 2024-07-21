async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const Auction = await ethers.getContractFactory("Auction");
    const auction = await Auction.deploy();

    console.log("Auction contract deployed to:", auction.address);

    // Salve o endereço do contrato para uso no frontend
    const fs = require('fs');
    const configPath = 'frontend/config/config.py';
    let configFile = fs.readFileSync(configPath, 'utf8');
    configFile = configFile.replace('ENDEREÇO_DO_CONTRATO', auction.address);
    fs.writeFileSync(configPath, configFile);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
