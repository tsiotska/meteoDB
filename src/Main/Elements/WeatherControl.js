import React, {Component} from 'react';
import $ from 'jquery';

export default class WeatherControl extends Component {
  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  classVisibilityConverter = (e) => {
    return e === true ? "" : "disabled";
  };

  render() {
    const e = this.props.data;

    return (<div className="col-sm col-lg-6 d-flex flex-column  weath my-2">
      <div className="w_header   d-flex mx-auto   justify-content-center">
        <div className="w_dt-header px-4 flex-row col-auto mb-0 w_s text-center">
          <h4 className="my-1 mr-3 ml-2">{e.date}</h4>
        </div>
      </div>

      <div className="row mx-auto  w_cont justify-content-center p-3">
        <div className="w_out">
          <div className="w_selector"><input type="checkbox"/>
            <span className="w_mark"/>
          </div>
        </div>
        <div className="w_fx col-xs col-xs-12 align-self-center">
          <div className=" d-flex">
            <i className="wi wi-stars wi-fw"/>
            <p data-toggle="tooltip" data-placement="right" title="" data-original-title="Видимість">{e.vis.val}</p>
            <p>
              <span className="badge badge-primary badge-pill" data-toggle="tooltip" data-placement="right" title=""
                    data-original-title="Кількість вимірювань">{e.vis.flag}</span>
            </p>
          </div>
          <div className="d-flex">
            <i className="wi wi-raindrops wi-fw"/>
            <p data-toggle="tooltip" data-placement="right" title="" data-original-title="Опади">{e.prcp.val}mm</p>
            <p>
              <span className="badge badge-primary badge-pill" data-toggle="tooltip" data-placement="right" title=""
                    data-original-title="Кількість вимірювань">{e.prcp.flag}</span>
            </p>
          </div>
          <div className="d-flex">
            <i className="wi  wi-cloud-down wi-fw"/>
            <p data-toggle="tooltip" data-placement="right" title="" data-original-title="Глибина снігу">{e.sndp}mm</p>
          </div>
          <div className="d-flex">
            <i className="wi wi-horizon wi-fw"/>
            <i className="wi wi-barometer wi-fw"/>
            <p data-toggle="tooltip" data-placement="right" title=""
               data-original-title="Атмосферний тиск на рівні моря">{e.slp.val}mm</p>
            <p>
              <span className="badge badge-primary badge-pill" data-toggle="tooltip" data-placement="right" title=""
                    data-original-title="Кількість вимірювань">{e.slp.flag}</span>
            </p>
          </div>
          <div className="d-flex">
            <p data-toggle="tooltip" data-placement="right" title="" data-original-title="Атмосферний тиск на станції">
              <i className="wi wi-small-craft-advisory wi-fw"/>
              <i className="wi wi-barometer wi-fw"/>{e.stp.val}</p>
            <p>
              <span className="badge badge-primary badge-pill" data-toggle="tooltip" data-placement="right" title=""
                    data-original-title="Кількість вимірювань">{e.stp.flag}</span>
            </p>
          </div>
        </div>
        <div className="col-xs  align-self-center">
          <div className="col-auto d-flex">
            <i className="wi wi-strong-wind wi-fw"/>
            <p data-toggle="tooltip" data-placement="right" title=""
               data-original-title="Швидкість вітру">{e.wdsp.val}</p>
            <p>
              <span className="badge badge-primary badge-pill" data-toggle="tooltip" data-placement="right" title=""
                    data-original-title="Кількість вимірювань">{e.wdsp.flag}</span>
            </p>
          </div>
          <div className="col-auto d-flex" data-toggle="tooltip" data-placement="right" title=""
               data-original-title="Максимальна швидкість вітру">
            <i className="wi wi-hurricane wi-fw"></i>
            <p>{e.wmax}</p>
          </div>
          <div className="col-auto d-flex" data-toggle="tooltip" data-placement="right" title=""
               data-original-title="Пориви вітру">
            <i className="wi wi-dust wi-fw"></i>
            <p>{e.gust}</p>
          </div>
        </div>
        <div className="col-4 w_gaudge_wrap">
          <div className="w_gaudge">
            <div className="col-auto w_max">
              <p data-toggle="tooltip" data-placement="right" title=""
                 data-original-title="Максимальна температура">{e.max.val}<i className="wi wi-celsius"></i>
              </p>
              <span className="badge badge-primary badge-pill" data-toggle="tooltip" data-placement="right" title=""
                    data-original-title="Кількість вимірювань">*</span>
            </div>
            <div className="col-auto w_aver">
              <p data-toggle="tooltip" data-placement="right" title=""
                 data-original-title="Середня температура">{e.temp.val}<i className="wi wi-celsius"></i>
              </p>
              <span className="badge badge-primary badge-pill" data-toggle="tooltip" data-placement="right" title=""
                    data-original-title="Кількість вимірювань">{e.temp.flag}</span>
            </div>
            <div className="col-auto w_dewp">
              <p data-toggle="tooltip" data-placement="right" title="" data-original-title="Точка роси">{e.dewp.val}<i
                className="wi wi-celsius"></i>
              </p>
              <span className="badge badge-primary badge-pill" data-toggle="tooltip" data-placement="right" title=""
                    data-original-title="Кількість вимірювань">{e.dewp.flag}</span>
            </div>
            <div className="col-auto w_min">
              <p data-toggle="tooltip" data-placement="right" title=""
                 data-original-title="Мінімальна температура">{e.min.val}<i className="wi wi-celsius"></i>
              </p>
              <span className="badge badge-primary badge-pill" data-toggle="tooltip" data-placement="right" title=""
                    data-original-title="Кількість вимірювань">{e.min.flag}</span>
            </div>
          </div>
        </div>
        <div className="text-center w-100">
          <span className="badge m-2 badge-secondary" data-toggle="tooltip" data-placement="right" title=""
                data-original-title="ІD станції">ID: {e.id}</span>
          <span className="badge m-2 badge-secondary" data-toggle="tooltip" data-placement="right" title=""
                data-original-title="ІD станції у WBAN">WBAN: {e.wban}</span>
        </div>
      </div>

      <div className="w_footer  d-flex mx-auto flex-column justify-content-center">
        <div className=" mt-0 w_s text-center">
          <i className={"wi wi-fog wi-fw" + this.classVisibilityConverter(e.frshtt.f)} data-toggle="tooltip"
             data-placement="right" title="" data-original-title="Туман"></i>
          <i className={"wi wi-rain  wi-fw " + this.classVisibilityConverter(e.frshtt.r)} data-toggle="tooltip"
             data-placement="right" title="" data-original-title="Дощ"></i>
          <i className={"wi wi-snow wi-fw " + this.classVisibilityConverter(e.frshtt.s)} data-toggle="tooltip"
             data-placement="right" title="" data-original-title="Сніг або крижані пелети"></i>
          <i className={"wi wi-hail wi-fw " + this.classVisibilityConverter(e.frshtt.h)} data-toggle="tooltip"
             data-placement="right" title="" data-original-title="Град"></i>
          <i className={"wi wi-thunderstorm wi-fw " + this.classVisibilityConverter(e.frshtt.th)} data-toggle="tooltip"
             data-placement="right" title="" data-original-title="Грім"></i>
          <i className={"wi wi-tornado wi-fw " + this.classVisibilityConverter(e.frshtt.tr)} data-toggle="tooltip"
             data-placement="right" title="" data-original-title="Торнадо"></i>
        </div>
      </div>
    </div>);
  };
}
