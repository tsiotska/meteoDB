import React from "react"; 
import { classJoin } from "../../js/const";
import { connect } from "react-redux";

export class StatisticsAggregationComponent extends React.Component {
    render() {
        return (<div className={classJoin(this.props.className)}>
            <h2>Analize aggregated result</h2>
            <div className="container">
                <div>[Stats inputs]</div>
            </div>
        </div>);
    }
}


const mapStateToProps = state => ({
    weather: state.dataReducer.weather
});

export default connect(mapStateToProps)(StatisticsAggregationComponent);