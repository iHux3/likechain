const path = require("path");
const HDWalletProvider = require("truffle-hdwallet-provider");
const secrets = require("./secrets.json");

module.exports = {
    contracts_build_directory: path.join(__dirname, "client/src/contracts"),
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*"
        },
        ropsten: {
            provider: new HDWalletProvider(secrets.wallet, `https://ropsten.infura.io/v3/${secrets.infura}`),
            network_id: 3
        }
    } ,
    compilers: {
        solc: {
        version: "^0.7.6",
            settings: {
                optimizer: {
                enabled: false
                }
            }
        }
    },
    mocha: {
        reporter: 'eth-gas-reporter',
        reporterOptions: {}
    }
};
