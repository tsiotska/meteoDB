import React, { Component } from 'react';
export default class FlyoutContainer extends Component {

    render() {
        let position = this.props.position ? this.props.position : "left";
        let className = this.props.className ? this.props.className : "";
        let active = this.props.isExpanded ? "active" : "";
        return (
            <div className={"d-flex flyout " + [active, position, className].join(" ")}>
                <div className="flyout-content">
                    {this.props.children}
                </div>
            </div>
        )
    }
}