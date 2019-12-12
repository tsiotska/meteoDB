import React from "react";
import DatePicker from '../Controls/DatePicker';
import { Input } from "reactstrap";
import  { classJoin } from "../../js/const";

export default class StatisticsAggregationComponent extends React.Component {
    render() {
        return (<div className={classJoin(this.props.className)}>
            <h2>Analize aggregated result</h2>
            <div className="container">
                <div>[Stats inputs]</div>
            </div>
        </div>);
    }
}
