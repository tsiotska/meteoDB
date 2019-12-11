import React from "react";
import DatePicker from '../Controls/DatePicker';
import { Input } from "reactstrap";

export default class WeatherAggregationComponent extends React.Component {
    render() {
        return (<div className={"" + this.props.className}>
            <h2>Stations results</h2>
            <div className="container">
                [stations results]
            </div>
        </div>);
    }
}
