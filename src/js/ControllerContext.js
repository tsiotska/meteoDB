
export default class ControllerContext {
    resetContext = () => {
        this._time =
            this._years =
            this._months =
            this._days =
            this._offset =
            this._limit =
            this._pack =
            this._buffer =
            this._nearest =
            this._hasNeighbours = null;
    }


    get time() {
        return this._time === null
            ? ''
            : this._time;
    }

    set time(value) {
        this._time = value;
    }

    get year() {
        return this._years === null
            ? ''
            : this._years;
    }

    set year(value) {
        this._years = value;
    }

    get months() {
        return this._months === null
            ? ''
            : this._months;
    }

    set months(value) {
        this._months = value;
    }

    get days() {
        return this._days === null
            ? ''
            : this._days;
    }

    set days(value) {
        this._days = value;
    }



    YieldsToWeatherRequest = () => {
        return (this.year || this.time.dateSet)
    }

    withYears = (value) => {
        this._time = null;
        this._years = value;
        return this;
    }


    withMonths = (value) => {
        this._months = null;
        this._months = value;
        return this;
    }


    withDays = (value) => {
        this._days = null;
        this._days = value;
        return this;
    }

    // nearest N stations related to current (one or each in poly) 
    // uses Kd-tree or R-tree
    withNearest = (value) => {
        this._nearest = value;
        return this;
    }

    // with an exterior buffer for polygon 
    withBuffer = (value) => {
        this._buffer = value;
        return this;
    }

    // all stations from neighbor countries (limited by 'limit' param)
    withNeighbors = (value) => {
        this._hasNeighbours = value;
        return this;
    }

    // link for file
    withPack = (flag) => {
        this._pack = flag;
        return this;
    }

    withTimeRange = (value) => {
        this._years = null;
        this._time = value;
        return this;
    }

    withOffset = (value) => {
        this._offset = value;
        return this;
    }

    withLimit = (value) => {
        this._limit = value;
        return this;
    }

}
