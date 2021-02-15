import React, { Component } from "react";
import { Link }  from "react-router-dom";

class Image extends Component {
    state = {
        processing: false,
    }

    constructor(props) {
        super(props);
        this.likeImage = this.likeImage.bind(this);
    }

    async likeImage(e)
    {
        if (e.currentTarget.className === "enabled" && !this.state.processing) {
            this.setState({ processing: true });
            try {
                await this.props.token.methods.approve(this.props.contract._address, (10 ** 18).toString()).send({ from: this.props.account });
                await this.props.contract.methods.likeImage(0).send({ from: this.props.account });
            } catch (e) {
            }
            this.setState({ processing: false });
        }
    }

    render() 
    {
        const data = this.props.data;

        return (
            <div className="image-container">
                <img className="image" src={`https://ipfs.infura.io/ipfs/${data.IPFShash}`} alt=""/>
                <div className="image-info">
                    <div className="image-info-left">
                        <div className="image-info-desc">
                            {data.description}
                        </div>
                    </div>
                    <div className="image-info-right">
                        <span className={!data.isLiked ? "enabled" : "disabled"} onClick={this.likeImage}>
                            &#10084;
                        </span>
                        <span className="likes">
                            {data.likes}
                        </span>
                    </div>
                    <div className="image-info-author">
                        author: 
                        <Link className="address" to={`/images/${data.author}`}> 
                            {data.author}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default Image;