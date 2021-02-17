import React, { Component } from "react";
import Image from "./Image.js";
import { Link }  from "react-router-dom";
import Utils from "./Utils.js";

class Images extends Component {
    state = {
        address: "",
        value: "",
        validAddress: true,
        images: []
    }

    constructor(props) 
    {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.state.address = Utils.getParam(1);
        this.state.value = Utils.getParam(1);

        this.unregisterListener = this.props.history.listen(async () => {
            const address = Utils.getParam(1);
            if (address !== this.state.address) {
                this.state.address = address;
                this.state.value = address;
                this.loadImages();
            }
        });

        this.eventListener = this.props.contract.events.ImageLiked().on("data", async (res) => {
            const id = res.returnValues.id;
            const user = res.returnValues.user;

            const fnc = (image) => {
                if (image.id == id) {
                    image.likes++;
                    if (user == this.props.account) {
                        image.isLiked = true;
                    }
                }
            }

            this.state.images.forEach(fnc);
            this.forceUpdate();
        });
    }

    componentWillUnmount()
    {
        this.unregisterListener();
        this.eventListener.unsubscribe();
    }

    async componentDidMount()
    {
        this.loadImages();
    }

    async loadImages() 
    {
        const isAddress = this.props.web3.utils.isAddress(this.state.address);
        if (isAddress) {
            this.setState({ validAddress: true });
            const imageIds = await this.props.contract.methods.getUserImages(this.state.address).call();
            const images = [];
            await Promise.all(imageIds.map(id => this.loadImage(images, id)));
            this.setState({ images });
        } else {
            this.setState({ validAddress: false, images: [] });
        }
    }
    
    async loadImage(selected, id)
    {
        const image = await this.props.contract.methods.images(id).call();
        image.id = id;
        image.isLiked = await this.props.contract.methods.isLiked(id).call();
        selected.push(image);
    }
    
    handleChange(e)
    {
        this.setState({ value: e.target.value });
    }

    handleClick(e) 
    {
        if (this.state.value == this.state.address) {
            e.preventDefault();
            this.loadImages();
        }
    }

    render() 
    {
        const images = this.state.images.map(image => <Image key={image.id} data={image} contract={this.props.contract} 
            token={this.props.token} account={this.props.account} />);
        
        return (
            <div id="images" className="container main">
                <div id="images-top">
                    <h1 className="h1-title center"> 
                        <span> SHOW IMAGES BY ADDRESS </span>
                        <hr></hr>
                    </h1>
                    <form id="address-form" className="row">
                        <input onChange={this.handleChange} className="col-9" id="address-input" value={this.state.value} type="text" placeholder="address..." autoComplete="off"/>
                        <Link onClick={this.handleClick} id="address-button" className="col-3 button" to={`/images/${this.state.value}`}>
                            SHOW
                        </Link>
                        {!this.state.validAddress &&
                            <div className="form-info"> please enter a valid address </div>
                        }
                    </form>
                </div>
                <div className="row justify-content-center">
                    {images}
                </div>
            </div>
        )
    }
}

export default Images;