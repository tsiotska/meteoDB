import React from 'react';

export default(props) => {

  const handler = (e) => {
    console.log(props);
    e.preventDefault();
    props.setQuery(props.e.name);
    return false;
  }, e = props.e;

  return (<li className="list-group-item mx-auto w-50 d-flex justify-content-between align-items-center">
    <a href="" onClick={handler}>{e.name || "Unknown"}</a>
    <h4>
      <span className="badge badge-primary">{e.value}</span>
    </h4>
  </li>);
};
