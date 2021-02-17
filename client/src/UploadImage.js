import React, { Component } from "react";
import $ from "jquery";

import ipfsClient from "ipfs-http-client";
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'http' });

class UploadImage extends Component {
    state = {
        fileName: "no file",
        imageBuffer: null,
        processing: false
    }

    constructor(props) 
    {
        super(props);
        this.chooseImage = this.chooseImage.bind(this);
        this.submit = this.submit.bind(this);
    }

    chooseImage(e) 
    {
        e.preventDefault();
        const file = e.target.files[0];
        if (file) {
            const reader = new window.FileReader();
            reader.readAsArrayBuffer(file);
            reader.onloadend = () => this.setState({ imageBuffer: Buffer(reader.result) });
            this.setState({ fileName: file.name });
        } else {
            this.setState({ fileName: "no file", imageBuffer: null});
        }
    }

    async submit(e)
    {
        e.preventDefault();

        if (!this.state.processing && this.state.imageBuffer) {
            this.setState({ processing: true });
            const description = $("#input-description").val();
            const res = await ipfs.add(this.state.imageBuffer);
            try {
                await this.props.contract.methods.uploadImage(res.path, description).send({ from: this.props.account });
                $("#input-description").val("");
                this.setState({ imageBuffer: null, fileName: "no file" });
            } catch (e) {
            }
            this.setState({ processing: false });
        }
    }

    render() 
    {
        return (
            <div className="container main">
                <h1 className="h1-title center"> 
                    <span> UPLOAD IMAGE </span>
                    <hr></hr>
                </h1>
                <div id="upload-image" className="row align-items-center justify-content-center">
                    <div className="text-center">
                        <form onSubmit={this.submit} className="text-left">
                            <div id="form-top">
                                <label id="choose-image" className="h5">
                                    CHOOSE IMAGE
                                    <input type="file" accept=".jpg, .png, .jpeg, .gif" onChange={this.chooseImage}/>
                                </label>
                                <span title={this.state.fileName} id="image-chosen"> {this.state.fileName} </span>
                            </div>
                            <div id="image-description">
                                <div className="h5"> Image description: </div>
                                <textarea className="form-control" rows="3" maxLength="100" id="input-description" type="text"></textarea>
                            </div>
                            {!this.state.processing ?
                                <label id="upload-button" className={"button w-100 text-center" + (!this.state.imageBuffer && " disabled")}>
                                    UPLOAD IMAGE
                                    <input type="submit"/>
                                </label>
                            :
                                <label id="upload-button" className="button w-100 text-center">
                                    <div className="loader"></div>
                                    <input type="submit"/>
                                </label>
                            }
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default UploadImage;