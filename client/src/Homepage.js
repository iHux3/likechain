import React, { Component } from "react";
import Category from "./Category.js";
import Utils from "./Utils.js";

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

    constructor(props)  
    {
        super(props);
        this.getRecentlyLiked = this.getRecentlyLiked.bind(this);
        this.getRecentlyAdded = this.getRecentlyAdded.bind(this);
        this.getTopImages = this.getTopImages.bind(this);
        this.getRandomImages = this.getRandomImages.bind(this);
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

            this.state.images.recentlyLiked.forEach(fnc);
            this.state.images.recentlyAdded.forEach(fnc);
            this.state.images.mostLiked.forEach(fnc);
            this.state.images.random.forEach(fnc);
            this.forceUpdate();
        });
    }

    componentWillUnmount()
    {
        this.eventListener.unsubscribe();
    }

    shuffle(array) {
        array.sort(() => Math.random() - 0.5);
      }

    async getRecentlyLiked(update = false)
    {
        const rawImages = await this.props.contract.methods.getRecentlyLiked().call({ from: this.props.account });
        const images = Utils.getImages(rawImages);
        images.sort(() => Math.random() - 0.5);
        images.splice(0, images.length > 4 ? images.length - 4 : 0);
        this.state.images.recentlyLiked = images;
        if (update) this.forceUpdate();
    }

    async getRecentlyAdded(update = false)
    {
        const imagesTotal = await this.props.contract.methods.imageId().call();
        const selectedIds = [];
        for (let i = imagesTotal; i > imagesTotal - this.state.imageCount && i > 0; i--) {
            const id = i - 1;
            selectedIds.push(id);
        }  
        const rawImages = await this.props.contract.methods.getImages(selectedIds).call({ from: this.props.account });
        const images = Utils.getImages(rawImages);
        this.state.images.recentlyAdded = images;
        if (update) this.forceUpdate();
    }

    async getTopImages(update = false)
    {
        const rawImages = await this.props.contract.methods.getTopImages().call({ from: this.props.account });
        const images = Utils.getImages(rawImages);
        images.sort(() => Math.random() - 0.5);
        images.splice(0, images.length > 4 ? images.length - 4 : 0);
        this.state.images.mostLiked = images;
        if (update) this.forceUpdate();
    }

    async getRandomImages(update = false)
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
        const rawImages = await this.props.contract.methods.getImages(selectedIds).call({ from: this.props.account });
        const images = Utils.getImages(rawImages);
        this.state.images.random = images;
        if (update) this.forceUpdate();
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
                        token={this.props.token} account={this.props.account} update={this.getRecentlyLiked}/>
                    <Category images={this.state.images.recentlyAdded} text={"RECENTLY ADDED"} contract={this.props.contract} 
                        token={this.props.token} account={this.props.account} update={this.getRecentlyAdded}/>
                    <Category images={this.state.images.mostLiked} text={"MOST LIKED"} contract={this.props.contract} 
                        token={this.props.token} account={this.props.account} update={this.getTopImages}/>
                    <Category images={this.state.images.random} text={"RANDOM"} contract={this.props.contract} 
                        token={this.props.token} account={this.props.account} update={this.getRandomImages}/>
                </div>
            );
        }
    }
}

export default Homepage;