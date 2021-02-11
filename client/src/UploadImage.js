import React, { Component } from "react";
import $ from "jquery";

import ipfsClient from "ipfs-http-client";
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'http' });

class UploadImage extends Component {
    state = {
        loaded: false,
        fileName: "no file",
        imageBuffer: null
    }

    constructor(props) 
    {
        super(props);
        this.chooseImage = this.chooseImage.bind(this);
        this.submit = this.submit.bind(this);
    }

    async componentDidMount() 
    {
        const contract = this.props.contract;
        const imageId = await contract.methods.imageId().call();
        console.log(Date.now());
        for (let i = 0; i <= 1000; i++){
            const imageId = await contract.methods.imageId().call();
        }
        console.log(Date.now());
        const images = null;
        console.log(imageId);
        this.setState({ imageId, images, loaded: true });
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

        if (this.state.imageBuffer) {
            const description = $("#input-description").val();
            const res = await ipfs.add(this.state.imageBuffer);
            console.log(res);
            try {
                await this.props.contract.methods.uploadImage(description, res.path).send({ from: this.props.account });
                console.log("DONE")
            } catch (e) {
                console.log(e);
            }
        }
    }

    render() 
    {
        if (!this.state.loaded) {
            return (
                <div className="loading"></div>
            );
        } else {
            return (
                <div className="container">
                    <div id="upload-image" className="row align-items-center justify-content-center">
                        <div className="text-center">
                            <form onSubmit={this.submit} className="text-left">
                                <div id="form-top">
                                    <label id="choose-image" className="h5">
                                        CHOOSE IMAGE
                                        <input type="file" accept=".jpg, .png, .jpeg, .gif" onChange={this.chooseImage}/>
                                    </label>
                                    <span id="image-chosen"> {this.state.fileName} </span>
                                </div>
                                <div id="image-description">
                                    <div className="h5"> Image description: </div>
                                    <textarea className="form-control" rows="3" maxLength="100" id="input-description" type="text"></textarea>
                                </div>
                                <label id="upload-button" className="button w-100 text-center">
                                    UPLOAD IMAGE
                                    <input type="submit"/>
                                </label>
                            </form>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default UploadImage;