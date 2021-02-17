import React, { Component } from "react";
import { Link }  from "react-router-dom";
import Utils from "./Utils.js";

class Farm extends Component {
    state = {
        address: "",
        value: "",
        validAddress: true,
        harvest: false,
        processing: false,
        data: {}
    }

    constructor(props) 
    {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.harvest = this.harvest.bind(this);

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
            this.state.data.yield = this.props.web3.utils.fromWei(res[0].toString(), "ether");
            this.state.harvest = this.props.account == this.state.address && this.state.data.yield > 0 ? true : false;
            this.forceUpdate();
        } else {
            this.setState({ validAddress: false, data: {} });
        }
    }
    
    handleChange(e) 
    {
        this.setState({ value: e.target.value });
    }

    handleClick(e) 
    {
        if (this.state.value == this.state.address) {
            e.preventDefault();
            this.load();
        }
    }

    async harvest(e)
    {
        if (this.state.harvest && !this.state.processing) {
            this.setState({ processing: true });
            try {
                await this.props.contract.methods.withdrawYield().send({ from: this.props.account });
                await this.load();
            } catch(e) {
                
            }
            this.setState({ processing: false });
        }
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
                        <Link onClick={this.handleClick} id="address-button" className="col-3 button" to={`/farm/${this.state.value}`}>
                            SHOW
                        </Link>
                        {!this.state.validAddress &&
                            <div className="form-info"> please enter a valid address </div>
                        }
                    </form>
                </div>
                {this.state.data.yield &&
                    <div id="farm-bottom">
                        <div className="yield">
                            yield: 
                            <span> {this.state.data.yield} LIKE </span>
                        </div>
                        <div className="totalLikes">
                            total likes: 
                            <span> {this.state.data.totalLikes} </span>
                        </div>
                        {!this.state.processing ?
                            <button onClick={this.harvest} id="harvest" className={"button" + (this.state.harvest ? "" : " disabled")}> 
                                HARVEST 
                            </button>
                        :
                            <button onClick={this.harvest} id="harvest" className={"button" + (this.state.harvest ? "" : " disabled")}> 
                                <div className="loader"></div>
                            </button>   
                        }
                    </div>
                }
            </div>
        )
    }
}

export default Farm;