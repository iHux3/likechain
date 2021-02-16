import React, { Component } from "react";
import Category from "./Category.js";

class Homepage extends Component {
    state = {
        imageCount: 4,
        loaded: false,
        images: {
            recentlyLiked: [],
            recentlyAdded: [],
            mostLiked: [],
            random: []
        }
    }

    async componentDidMount() 
    {
        await Promise.all([
            this.getRecentlyLiked(), 
            this.getRecentlyAdded(),
            this.getTopImages(),
            this.getRandomImages()
        ]);
        this.setState({ loaded: true });
    }

    async getRecentlyLiked()
    {
        const _images = await  this.props.contract.methods.getRecentlyLiked().call();
        const images = _images ? [..._images] : [];
        const selectedIds = [];
        while (images.length > 0 && selectedIds.length < this.state.imageCount) {
            const index = Math.floor(Math.random() * images.length);
            const id = images[index];
            images.splice(images.indexOf(id), 1);
            selectedIds.push(id);
        }
        await this.loadImages(selectedIds, "recentlyLiked");
    }

    async getRecentlyAdded()
    {
        const imagesTotal = await  this.props.contract.methods.imageId().call();
        const selectedIds = [];
        for (let i = imagesTotal; i > imagesTotal - this.state.imageCount && i > 0; i--) {
            const id = i - 1;
            selectedIds.push(id);
        }  
        await this.loadImages(selectedIds, "recentlyAdded");
    }

    async getTopImages()
    {
        const _images = await this.props.contract.methods.getTopImages().call();
        const images = _images ? [..._images] : [];
        const selectedIds = [];
        while (images.length > 0 && selectedIds.length < this.state.imageCount) {
            const index = Math.floor(Math.random() * images.length);
            const id = images[index];
            images.splice(images.indexOf(id), 1);
            selectedIds.push(id);
        }
        await this.loadImages(selectedIds, "mostLiked");
    }

    async getRandomImages()
    {
        const imagesTotal = await  this.props.contract.methods.imageId().call();
        const selectedIds = [];
        if (imagesTotal > this.state.imageCount) {
            const takenIds = [];
            for (let i = 0; i < this.state.imageCount; i++) {
                let id;
                do {
                    id = Math.floor(Math.random() * imagesTotal);
                } while (takenIds.includes(id));
                takenIds.push(id);
                selectedIds.push(id);
            }
        } else {
            for (let i = 0; i < imagesTotal; i++) {
                const id = i;
                selectedIds.push(id);
            }
        }
        await this.loadImages(selectedIds, "random");
    }

    async loadImage(selected, id)
    {
        const image = await this.props.contract.methods.images(id).call();
        image.id = id;
        image.isLiked = await this.props.contract.methods.isLiked(id).call();
        selected.push(image);
    }

    async loadImages(selectedIds, key)
    {
        const selected = [];
        await Promise.all(selectedIds.map(id => this.loadImage(selected, id)));
        this.state.images[key] = selected;
    }

    render() 
    {
        if (!this.state.loaded) {
            return (
                <div className="loading"></div>
            );
        } else {
            return (
                <div id="homepage" className="container main">
                    <Category images={this.state.images.recentlyLiked} text={"RECENTLY LIKED"} contract={this.props.contract} 
                        token={this.props.token} account={this.props.account} />
                    <Category images={this.state.images.recentlyAdded} text={"RECENTLY ADDED"} contract={this.props.contract} 
                        token={this.props.token} account={this.props.account} />
                    <Category images={this.state.images.mostLiked} text={"MOST LIKED"} contract={this.props.contract} 
                        token={this.props.token} account={this.props.account}/>
                    <Category images={this.state.images.random} text={"RANDOM"} contract={this.props.contract} 
                        token={this.props.token} account={this.props.account}/>
                </div>
            );
        }
    }
}

export default Homepage;