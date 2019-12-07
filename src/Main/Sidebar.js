import React, { Component } from 'react';
import { Button } from 'reactstrap';
import $ from "jquery";
/* import Nav from './NavbarTop'; */

export default class Sidebar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isExpanded: false
        }
    }
    SetActive = (e) => {
        // TODO: open/close
        console.log(e)
        this.setState({ active: e.props.title })
    }
    render() {
        let className = this.props.className ? this.props.className : "";
        console.log(this.props.children)

        const items = [<div className="logo"></div>]
        if (this.state.isExpanded) {
            items.push(<Button>Back to Map</Button>)
        }

        this.props.children.forEach((value) => {
            items.push(<Button color="outline" onClick={(e) => this.SetActive(e.target)}> {value.props.title}</Button>)
        })

        return (
            <div className={"sidebar " + className}>
                <div className="sidebar-asside">
                    {/* <Nav /> */}
                    {items}
                </div>
                <div className="sidebar-content">
                    <div className="sidebar-content-inner">
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }
}