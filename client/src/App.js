import React, { Component } from "react";
import LikeChain from "./contracts/LikeChain.json";
import Web3 from "web3";

import "./App.css";

class App extends Component {
    state = {
        web3: null,
    }

    async componentDidMount()
    {
        try {
            const web3 = await new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            console.log(networkId)
            const deployedNetwork = LikeChain.networks[networkId];
            console.log(deployedNetwork)
            const instance = new web3.eth.Contract(
                LikeChain.abi,
                deployedNetwork && deployedNetwork.address,
            );
            console.log(instance);
            this.setState({ 
                web3, 
                accounts, 
                contract: instance 
            });
        } catch (e) {
            console.log(e);
            alert(`Failed to load web3, accounts, or contract. Check console for details.`);
        }
    };

    render() {
        if (!this.state.web3) return <div> Loading Web3, accounts, and contract... </div>;

        return (
            <h1>Good to Go!</h1>
        );
    }
}

export default App;