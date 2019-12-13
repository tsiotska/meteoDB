import React, { Component } from 'react';
import { classJoin } from '../../js/const';
export default class ConditionalContainer extends Component {
    render() {
        let isVisible = this.props.visibleWhen !== undefined ? this.props.visibleWhen : true;

        const childrenWithProps = React.Children.map(this.props.children, (child, _) =>
            React.cloneElement(child, {
                className: classJoin(this.props.className, this.props.containerInnerClass)
            })
        );

        return (
            <div className={classJoin("conditional-container", this.props.containerClassName, (isVisible ? "" : "slideOut"))}>
                {childrenWithProps}
            </div>
        )
    }
}