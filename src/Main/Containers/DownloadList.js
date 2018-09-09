import React from 'react';
import {baseUrl} from 'js/const'
import Station from 'Main/Elements/StationTemplate'

export default class DownloadList extends React.Component {
  GetItem(e, key, miss) {
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
  GetListElem = (i, key, name) => {
    let lkey = 0;

    let Missing = name.includes("Miss")
    return <div className="col-auto mx-auto my-4" key={key}>
      <div className="mx-auto justify-content-center row">{
          i.data.map(
            (item) => (item.id || item.item)
            ? this.GetItem(item, ++lkey, Missing)
            : null)
        }</div>
    </div>;
  }
  Revolution = (elem, key) => {

    return elem.data[0] && elem.data[0].item
      ? this.GetListElem(elem, key, "Available Data Stations")
      : this.GetListElem(elem, key, "Missing Data Stations")
  }
  WrapR(name, e, data, id) {
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
  MainContainer = (e) => {
    let key = 0,
      id = 0;
    let d = e || this.props.list;
    if (d.data) {
      return d.data.map((elem) => this.Revolution(elem, ++key))
    } else if (Array.isArray(d)) {
      return d.map((elem) => {
        var data = elem.data.map((elem_in) => this.WrapR(elem.item, elem_in.item, this.Revolution(elem_in, ++key), ++id));

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
    if (this.props.list) 
      if (this.props.list === nextProps.list) 
        return false;
  return true;
  }
  render() {
    return (<div className="tab-pane fade" id="nav-dwn_list" role="tabpanel" aria-labelledby="nav-dwn_list-tab">
      {this.MainContainer()}
    </div>)
  }
}
