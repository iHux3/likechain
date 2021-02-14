import React, { Component } from "react";

class Category extends Component {
    render() 
    {
        return (
            <section>
                <h1 className="homepage-title"> 
                    <span> {this.props.text} </span>
                    <hr></hr>
                </h1>
                <div className="images row justify-content-center">
                    {this.props.images.length ? this.props.images : ""}
                </div>
            </section>
        );
    }
}

export default Category;