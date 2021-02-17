import React, { Component } from "react";
import Image from "./Image.js";

class Category extends Component {
    constructor(props)
    {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e)
    {
        this.props.update(true);
    }

    render() 
    {
        const images = this.props.images.map(image => <Image key={image.id} data={image} contract={this.props.contract} 
            token={this.props.token} account={this.props.account} />);

        if (this.props.images.length) {
            return (
                <section>
                    <h1 className="h1-title"> 
                        <span> {this.props.text} </span>
                        <span onClick={this.handleClick} className="reload"> &#x21bb; </span>
                        <hr></hr>
                    </h1>
                    <div className="images row justify-content-center">
                        {images}
                    </div>
                </section>
            );
        } else {
            return (
                <section></section>
            )
        }
    }
}

export default Category;