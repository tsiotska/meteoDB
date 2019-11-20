import React, {Component} from 'react';

export default class CountCircle extends Component {
  render() {
    let resp = this.props.response;

    return (<p className="text-center card-text">{(
          (resp.code === 33) //not found code
          ? "NOT FOUND"
          : " Found: " + (
            ((resp.response && !resp.response[2]) || 'Nothing') //!resp.data.response.Item2
            ? resp.response.length
            : resp.response.length))
      }
    </p>);
  }
}
