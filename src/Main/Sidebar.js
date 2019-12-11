import React, { Component } from 'react';
import { Button } from 'reactstrap';
import $ from 'jquery';

const { Provider, Consumer } = React.createContext();

export default class Sidebar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            localContext:
            {
                active: null,
                isExpanded: false
            }
        }
    }

    componentDidUpdate() {
        $('[data-toggle="tooltip"]').tooltip();
    }

    componentDidMount() {
        $('[data-toggle="tooltip"]').tooltip();
    }


    SetActive = (e) => {
        let context = this.state.localContext;
        if (context.active === e)
            this.setState({ localContext: { isExpanded: false, active: null } })
        else
            this.setState({ localContext: { isExpanded: true, active: e } })
    }
    render() {
        let className = this.props.className ? this.props.className : "";
        const items = [<div key="-" className="logo-container"><div className="logo-container-inner" /></div>]

        items.push(<Button key="back-to-map" className={"sidebar-item fa fa-arrow-left " + (this.state.localContext.isExpanded ? "" : "fade")}
            onClick={() => this.SetActive(this.state.localContext.active)}><span /><p>to map</p></Button>)

        this.props.children.forEach((value, index) => {
            items.push(<Button color="outline" key={index} className={"sidebar-item " + value.props.iconClassName +
                (this.state.localContext.active === value.props.title ? " active" : "")}
                data-item-id={value.props.title}
                data-toggle="tooltip" data-html="true" data-trigger="hover"
                data-placement="left" title={"<div className='tooltip-info'> " + value.props.title + "</div>"}
                onClick={(e) => this.SetActive(e.target.getAttribute('data-item-id'))}><span /> </Button>)
        })
        const childrenWithProps = React.Children.map(this.props.children, (child, index) =>
            <Consumer key={"item" + index}>{value => React.cloneElement(child, {
                isExpanded: this.state.localContext.isExpanded && child.props.title === value.active
            })}</Consumer>
        );

        return (
            <div className={"sidebar " + className}>
                <div className="sidebar-asside">
                    {items}
                    <span key="ind" className="sidebar-indicator" />
                </div>
                <div className="sidebar-content">
                    <div className="sidebar-content-inner">
                        <Provider value={this.state.localContext}>
                            {childrenWithProps}
                        </Provider>
                    </div>
                </div>
            </div>
        )
    }
}
