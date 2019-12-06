import React, { Component } from 'react';
import { Button } from 'reactstrap';
import $ from "jquery";

export default class FlyoutContainer extends Component {

    render() {
        let position = this.props.position ? this.props.position : "left";
        let className = this.props.className ? this.props.className : "";
        let title = this.props.title ? this.props.title : "";
        return (
            <div className={"d-flex flyout " + position + " " + className}>
                <Button className="flyout-flag" onClick={(e) => {
                    if ($(e.target).parent().hasClass("active"))
                        $(e.target).parent().toggleClass("active")
                    else {
                        $('.flyout').removeClass("active");
                        $(e.target).parent().toggleClass("active")
                    }
                }
                }>{title}{/* <span /><span /> */}</Button>
                <div className="flyout-content">
                    {this.props.children}
                </div>
            </div>
        )
    }
}