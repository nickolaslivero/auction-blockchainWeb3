module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Qualquer rede (usada para o Ganache)
    },
  },
  compilers: {
    solc: {
      version: "0.8.0", // Versão do compilador Solidity
    },
  },
};
