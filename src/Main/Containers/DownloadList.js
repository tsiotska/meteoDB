import React from 'react';
import {baseUrl} from 'js/const'
import Station from 'Main/Elements/StationTemplate'

export default class DownloadList extends React.Component {
  getItem(e, key, miss) {
    let name,
      link,
      isDwn = !1;
    if (e.item) {
      name = e.item.ctry_full + "_" + e.item.stname + "_" + e.item.id + ".json";
      link = e.data;
      e = e.item;
      isDwn = true;
    }

    return (<Station key={key} id={key} props={e} click={false} DownLink={isDwn
        ? baseUrl + link + "?saveas=" + name // don't miss query '?' identifier!!
        : null}/>);
  }
  getListElem = (i, key, name) => {
    let lkey = 0;

    let Missing = name.includes("Miss")
    return <div className="col-auto mx-auto my-4" key={key}>
      <div className="mx-auto justify-content-center row">{
          i.data.map(
            (item) => (item.id || item.item)
            ? this.getItem(item, ++lkey, Missing)
            : null)
        }</div>
    </div>;
  }
  revolution = (elem, key) => {

    return elem.data[0] && elem.data[0].item
      ? this.getListElem(elem, key, "Available Data Stations")
      : this.getListElem(elem, key, "Missing Data Stations")
  }
  wrapR(name, e, data, id) {
    let year = this.props.year;
    year = year
      ? '_' + year
      : ''
    return (<div className="col-auto" key={id}>
      <h3 className="text-center">{
          e.includes("Miss")
            ? e.slice(1, e.length - 1)
            : <a href={baseUrl + e + "?saveas=" + name + year + '.json'}>Available Zipped Json Files</a>
        }</h3>
      <div className="dataw">{data}</div>
    </div>)
  }
  mainContainer = (e) => {
    let key = 0, id = 0;
    let d = e || this.props.list;
    if (d.data) {
      return d.data.map((elem) => this.revolution(elem, ++key))
    } else if (Array.isArray(d)) {
      return d.map((elem) => {
        var data = elem.data.map((elem_in) => this.wrapR(elem.item, elem_in.item, this.revolution(elem_in, ++key), ++id));

        return (<div className="container my-4 py-3" key={++id}>
          <h3>{"Data for " + elem.item}</h3>
          <div className=" container overex">
            {data}</div>
        </div>);
      })
    }
    return null
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !(this.props.list && this.props.list === nextProps.list)
  }
  render() {
    return (<div className="tab-pane fade" id="nav-dwn_list" role="tabpanel" aria-labelledby="nav-dwn_list-tab">
      {this.mainContainer()}
    </div>)
  }
}
