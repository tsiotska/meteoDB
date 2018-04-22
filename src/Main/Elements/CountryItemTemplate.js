import React from 'react';

export default(props) => {
  const handler = function(e) {
    e.preventDefault();
    props.SetQuery(props.e.Item1);
    return false;
  }
  const e = props.e;
  return (<li className="list-group-item d-flex justify-content-between align-items-center">
    <a href="" onClick={handler}>{e.Item1 || "Unknown"}</a>
  </li>);
};
