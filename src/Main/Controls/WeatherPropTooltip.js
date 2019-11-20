import React from 'react';
import {UncontrolledTooltip} from 'reactstrap';

//example only
export default function tip() {
  return (<div>
    <p>Somewhere in here is a
      <a href="#" id="UncontrolledTooltipExample">tooltip</a>.</p>
    <tooltip placement="right" target="UncontrolledTooltipExample">
      Hello world!
    </tooltip>
  </div>);
}
