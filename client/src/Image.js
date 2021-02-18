import React, { Component } from "react";
import { Link }  from "react-router-dom";

class Image extends Component {
    state = {
        processing: false,
        approving: false
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
                this.setState({ approving: true });
                await this.props.token.methods.approve(this.props.contract._address, (10 ** 18).toString()).send({ from: this.props.account });
                this.setState({ approving: false });
                await this.props.contract.methods.likeImage(this.props.data.id).send({ from: this.props.account });
            } catch (e) {
            }
            this.setState({ processing: false, approving: false });
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
                        <span className={(!data.isLiked ? "enabled" : "disabled") + (this.state.processing ? " processing" : "")} onClick={this.likeImage}>
                            &#10084;
                        </span>
                        <span className="likes">
                            {data.likes}
                        </span>
                        {this.state.approving &&
                            <span className="status">
                                approving...
                            </span>
                        }
                        {this.state.processing && !this.state.approving &&
                            <span className="status">
                                processing...
                            </span>
                        }
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