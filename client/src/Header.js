import React, { Component } from "react";
import { Link }  from "react-router-dom";

class Header extends Component {
    render() {
        return (
            <header id="header" >
                <div className="container h-100">
                    <div class="row h-100 align-items-center">
                        <div class="col-2">
                            
                        <h1> LikeChain </h1>
                        </div>
                        <div class="col-10">
                        <div id="navbar">
                            <nav className="h-100 navbar navbar-expand-sm justify-content-end">
                                <div>
                                    <ul className="navbar-nav">
                                        <li className="nav-item">
                                            <a className="nav-link" href="#">Link 1</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" href="#">Link 2</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" href="#">Link 3</a>
                                        </li>
                                    </ul>
                                </div>
                            </nav>
                        </div>
                        </div>
                    </div>
                </div>
                
            </header>
        );
    }
}

export default Header;