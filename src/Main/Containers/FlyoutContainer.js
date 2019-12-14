import React, { Component } from 'react';
import { classJoin } from '../../js/const';
export default class FlyoutContainer extends Component {

    render() {
        let position = this.props.position ? this.props.position : "left";
        let className = this.props.className ? this.props.className : "";
        let isVisible = this.props.isVisible !== undefined ? this.props.isVisible : true;
        let active = this.props.isExpanded && isVisible ? "active" : "";

        const childrenWithProps = React.Children.map(this.props.children, (child, _) =>
            React.cloneElement(child, {
                className: classJoin(child.props.className, this.props.containerInnerClass)
            })
        );

        return (
            <div className={classJoin("d-flex flyout", active, position, className)}>
                <div className="flyout-content">
                    <div className="flyout-content-inner">
                        {childrenWithProps}
                    </div>
                </div>
            </div>
        )
    }
}