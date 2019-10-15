import React from 'react';

export default(props) => {
  console.log(props)
  const handler = (e) => {
    e.preventDefault();
    console.log("COuntryItemTemplate, e:");
    console.log(e);

    props.setQuery(props.e);
    return false;
  }, e = props.e;
  return (<li className="list-group-item mx-auto w-50 d-flex justify-content-between align-items-center">
    <a href="" onClick={handler}>{e || "Unknown"}</a>
    <h4>
      <span className="badge badge-primary">{e}</span>
    </h4>
  </li>);
};
