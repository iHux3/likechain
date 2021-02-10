import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link}  from "react-router-dom";
import LikeChain from "./contracts/LikeChain.json";
import Web3 from "web3";
import Header from "./Header.js";

import 'bootstrap/dist/css/bootstrap.css';
import "./App.css";

class App extends Component {
    state = {
        web3: null,
        account: null,
        network: null,
        contract: null
    }

    async componentDidMount()
    {
        try {
            window.ethereum.enable();
            const web3 = await new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];
            const network = await web3.eth.net.getId();
            const deployedNetwork = LikeChain.networks[network];
            const contract = new web3.eth.Contract(
                LikeChain.abi,
                deployedNetwork && deployedNetwork.address,
            );
            this.setState({ web3, account, network, contract });
        } catch (e) {
            console.log(e);
            alert(`Failed to load web3, accounts, or contract`);
        }

        window.ethereum.on('accountsChanged', accounts => {
            this.setState({ account: accounts[0] });
        });
        window.ethereum.on('networkChanged', networkId => {
            this.setState({ network: networkId });
            console.log(this.state);
        });
    };

    render() {
        return (
            <Router>
                <Header account={this.state.account}/>
                <Switch>
                    <Route exact path="/">
                        home
                    </Route>
                    <Route path="/:address/yield">
                        yield
                    </Route>
                    <Route path="/:address">
                        images
                    </Route>
                </Switch>
            </Router>
        );
    }
}

export default App;