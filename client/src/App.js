import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route }  from "react-router-dom";
import LikeChain from "./contracts/LikeChain.json";
import LikeToken from "./contracts/LikeToken.json";
import Web3 from "web3";
import Header from "./Header.js";
import UploadImage from "./UploadImage.js";
import Homepage from "./Homepage.js";

import "bootstrap/dist/css/bootstrap.css";
import "./App.css";

class App extends Component {
    state = {
        web3: null,
        account: null,
        network: null,
        contract: null,
        token: null,
        loading: true
    }

    componentDidMount()
    {
        this.connect();
    };

    async connect() {
        try {
            window.ethereum.enable();
            const web3 = await new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];
            const network = await web3.eth.net.getId();
            const deployedNetwork = LikeChain.networks[network];
            const deployedNetworkToken = LikeToken.networks[network];
            const contract = new web3.eth.Contract(LikeChain.abi, deployedNetwork && deployedNetwork.address);
            const token = new web3.eth.Contract(LikeToken.abi, deployedNetworkToken && deployedNetworkToken.address);
            this.setState({ web3, account, network, contract, token, loading: false });
        } catch (e) {
            console.log(e);
            alert(`Failed to load web3, accounts, or contract`);
        }

        window.ethereum.on("accountsChanged", accounts => {
            this.setState({ account: accounts[0] });
        });
        window.ethereum.on("networkChanged", network => {
            const deployedNetwork = LikeChain.networks[network];
            const deployedNetworkToken = LikeToken.networks[network];
            const contract = new this.state.web3.eth.Contract(LikeChain.abi, deployedNetwork && deployedNetwork.address);
            const token = new this.state.web3.eth.Contract(LikeToken.abi, deployedNetworkToken && deployedNetworkToken.address);
            this.setState({ network, contract, token });
        });
    }

    render() 
    {
        return (
            <Router>
                <Header account={this.state.account}/>
                {!this.state.loading &&
                    (this.state.contract._address && this.state.account ? 
                        <Switch>
                            <Route exact path="/">
                                <Homepage account={this.state.account} contract={this.state.contract} token={this.state.token}/>
                            </Route>
                            <Route path="/upload">
                                <UploadImage account={this.state.account} contract={this.state.contract}/>
                            </Route>
                            <Route path="/images/:address">
                                images
                            </Route>
                            <Route path="/farm/:address">
                                farm
                            </Route>
                        </Switch>
                    :
                        <div className="error-page"> 
                            {this.state.account ? 
                                <h2> PLEASE CHOOSE THE CORRECT NETWORK IN YOUR METAMASK WALLET </h2>
                            :
                                <div>
                                    <h2>
                                        PLEASE CONNECT YOUR METAMASK WALLET FIRST
                                    </h2> 
                                    <button className="connect button" onClick={async (e) => this.connect()}>
                                        CONNECT
                                    </button>
                                </div>
                            }
                        </div>
                    )
                }
            </Router>
        );
    }
}

export default App;