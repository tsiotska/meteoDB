import React from 'react';
export default class PageNavItem extends React.Component {
  render() {
    return (<li className={"page-item " +
      (this.props.active ? 'active' : '') +
      (this.props.disabled ? 'disabled' : '')
    }>
      <a className="page-link" href={this.props.href} onClick={this.props.onclick}>{this.props.text}</a>
    </li>);
  }
}
