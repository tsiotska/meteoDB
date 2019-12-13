import React from "react"; 
import { connect } from "react-redux";


export class StationsResultView extends React.Component {
    render() {
        return (<div className={"" + this.props.className}>
            <h2>Stations results</h2>
            <div className="container overflow-auto stations-view">
                {this.props.stations}
            </div>
        </div>);
    }
}

const mapStateToProps = state => ({
    stations: state.dataReducer.stations,
});

export default connect(mapStateToProps)(StationsResultView);