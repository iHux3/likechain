import React, { Component } from "react";

class Category extends Component {
    render() 
    {
        if (this.props.images.length) {
            return (
                <section>
                    <h1 className="homepage-title"> 
                        <span> {this.props.text} </span>
                        <hr></hr>
                    </h1>
                    <div className="images row justify-content-center">
                        {this.props.images}
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