import React from 'react';

export default(props) => {

  const handler = (e) => {
    e.preventDefault();
    props.onRefreshClick();
    props.setQuery(props.e.name);
    props.onSearchClick();
    return false;
  }, e = props.e;

  return (<li className="list-group-item mx-auto w-75 d-flex justify-content-between align-items-center">
    <a href="#!" onClick={handler}>{e.name || "Unknown"}</a>
    <h4>
      <span className="badge badge-primary">{e.value}</span>
    </h4>
  </li>);
};
