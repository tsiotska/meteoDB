import React, { Component } from 'react';
import { classJoin } from '../../js/const';
export default class FlyoutContainer extends Component {

    render() {
        let position = this.props.position ? this.props.position : "left";
        let className = this.props.className ? this.props.className : "";
        let active = this.props.isExpanded ? "active" : "";

        const childrenWithProps = React.Children.map(this.props.children, (child, index) =>
            React.cloneElement(child, {
                className: classJoin(child.props.className, this.props.containerInnerClass)
            })
        );

        return (
            <div className={"d-flex flyout " + [active, position, className].join(" ")}>
                <div className="flyout-content">
                    <div className="flyout-content-inner">
                        {childrenWithProps}
                    </div>
                </div>
            </div>
        )
    }
}