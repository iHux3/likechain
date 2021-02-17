import React, { Component } from "react";
import { Link }  from "react-router-dom";
import Utils from "./Utils.js";

class Farm extends Component {
    state = {
        address: "",
        value: "",
        validAddress: true,
        data: {}
    }

    constructor(props) 
    {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state.address = Utils.getParam(1);
        this.state.value = Utils.getParam(1);

        this.unregisterListener = this.props.history.listen(async () => {
            const address = Utils.getParam(1);
            if (address !== this.state.address) {
                this.state.address = address;
                this.state.value = address;
                this.load();
            }
        });
    }
    componentWillUnmount()
    {
        this.unregisterListener();
    }

    async componentDidMount()
    {
        this.load();
    }

    async load() 
    {
        const address = this.state.address;
        const isAddress = this.props.web3.utils.isAddress(address);
        if (isAddress) {
            this.setState({ validAddress: true });
            const user = await this.props.contract.methods.users(address).call();
            this.state.data.totalLikes = user.likedCount;
            const res = await this.props.contract.methods.calculateYield(address, Math.round(Date.now() / 1000)).call();
            this.state.data.yield = res[0].toString();
            this.forceUpdate();
        } else {
            this.setState({ validAddress: false });
        }
    }
    
    handleChange(e) {
        this.setState({ value: e.target.value });
    }

    render() 
    {
        return (
            <div id="farm" className="container main">
                <div id="farm-top">
                    <h1 className="h1-title center"> 
                        <span> SHOW YIELD BY ADDRESS </span>
                        <hr></hr>
                    </h1>
                    <form id="address-form" className="row">
                        <input onChange={this.handleChange} className="col-9" id="address-input" value={this.state.value} type="text" placeholder="address..." autoComplete="off"/>
                        <Link id="address-button" className="col-3 button" to={`/farm/${this.state.value}`}>
                            SHOW
                        </Link>
                        {!this.state.validAddress &&
                            <div className="form-info"> please enter a valid address </div>
                        }
                    </form>
                </div>
                <div className="row justify-content-center">
                    {this.state.data.yield}
                </div>
            </div>
        )
    }
}

export default Farm;