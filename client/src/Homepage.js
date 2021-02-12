import React, { Component } from "react";
import Image from "./Image.js";

class Homepage extends Component {
    state = {
        loaded: false,
        imageId: null,
        images: []
    }

    async componentDidMount() 
    {
        const contract = this.props.contract;
        const imageId = await contract.methods.imageId().call();
        const image = await contract.methods.images(0).call();
        console.log(image);
        this.state.images.push(<Image key={0} hash={image.IPFShash} description={image.description} author={image.author} likes={0} account={this.props.account} contract={this.props.contract} token={this.props.token}/>);
        this.setState({ imageId, loaded: true });
        /*contract.events.ImageUploaded().on('data', async (event) => {
            console.log(event.returnValues);
        });*/
    }

    render() 
    {
        if (!this.state.loaded) {
            return (
                <div className="loading"></div>
            );
        } else {
            return (
                <div id="homepage" className="container">
                    <div className="row justify-content-center">
                        {this.state.images.length ? this.state.images : ""}
                    </div>
                </div>
            );
        }
    }
}

export default Homepage;