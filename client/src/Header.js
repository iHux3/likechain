import React, { Component } from "react";
import { Link }  from "react-router-dom";

class Header extends Component {
    render() 
    {
        return (
            <header id="header">
                <div className="container h-100">
                    <div className="row h-100 align-items-center">
                        <div className="col-2">
                            <h1> 
                                <Link to={"/"}>
                                    LikeChain
                                </Link>
                            </h1>
                        </div>
                        <div className="col-10 text-right">
                            <ul className="list-inline">
                                <li className="list-inline-item">
                                    <Link to={`/${this.props.account}`}>
                                        Images
                                    </Link>
                                </li>
                                <li className="list-inline-item">
                                    <Link to={`/${this.props.account}/farm`}>
                                        Farm
                                    </Link>
                                </li>
                                <li className="list-inline-item">
                                    <Link to={`/about`}>
                                        About
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>
        );
    }
}

export default Header;