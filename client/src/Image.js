import React, { Component } from "react";
import { Link }  from "react-router-dom";

class Image extends Component {
    constructor(props) {
        super(props);
        this.likeImage = this.likeImage.bind(this);
    }

    async likeImage(e)
    {
        try {
            await this.props.token.methods.approve(this.props.contract._address, (10 ** 18).toString()).send({ from: this.props.account });
            console.log("ALLOWED");
            await this.props.contract.methods.likeImage(0).send({ from: this.props.account });
            console.log("DONE")
        } catch (e) {

        }
    }

    render() 
    {
        return (
            <div className="image-container">
                <img className="image" src={`https://ipfs.infura.io/ipfs/${this.props.hash}`} alt=""/>
                <div className="image-info">
                    <div className="image-info-left">
                        <div className="image-info-desc">
                            {this.props.description}
                        </div>
                    </div>
                    <div className="image-info-right">
                        <span className="enabled" onClick={this.likeImage}>
                            &#10084;
                        </span>
                        <span className="likes">
                            {this.props.likes}
                        </span>
                    </div>
                    <div className="image-info-author">
                        author: 
                        <Link className="address" to={`/images/${this.props.author}`}> 
                            {this.props.author}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default Image;