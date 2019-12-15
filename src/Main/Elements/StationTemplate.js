import React from 'react';

export default (props) => {

    const e = props.props;
    console.log(props.props)
    return (<div onClick={ () => props.click(e) } id={'XMarker' + props.id}
                 className="cur_station m-2 d-flex flex-column">
      <div className='st_card col-auto d-flex w_cont flex-column  b-0 st_item text-center'>
        <div className='w_header   d-flex mx-auto   justify-content-center'>
          <div className='w_dt-header px-3 flex-row col-auto mb-0 w_s text-center'>
            <div className='text-center'>
            <span className='badge mx-2 my-1 badge-secondary' data-toggle='tooltip' data-placement='right' title=''
                  data-original-title='ІD станції'>ID: {e.id || "N/A"}
            </span>
              <span className='badge mx-2 my-1 badge-secondary' data-toggle='tooltip' data-placement='right' title=''
                    data-original-title='ІD станції у WBAN'>WBAN: {e.wban || "N/A"}
            </span>
            </div>
            {
              props.DownLink
                ? <a className="st_dwn" href={props.DownLink}>Дані</a>
                : null
            }
          </div>
        </div>
        <div className='card-body p-1 pt-2'>
          <h4 className='st_header m-1 card-title'>{e.ctry_full}</h4>
          <div className='d-flex flex-column justify-content-center'>
            <h5 className='st_city  card-text'>{e.stname}</h5>
            {/* <p className='st_id  card-text'>{e.id}</p> */}
          </div>
          {
            e.lat
              ? <div className='d-flex justify-content-center'>
                <p className='st_lat m-0   card-text'>{e.lat}</p>
                <p className='st_lon ml-2 card-text'>{e.lon}</p>
              </div>
              : null
          }

          {
            e.elev
              ? <p className='card-text m-0'>
                <small className='text-muted st_elev'>{e.elev}</small>
              </p>
              : null
          }
        </div>
      </div>
      {
        e.beg
          ?
          <div
            className='st_ra d-flex w_footer justify-content-center  px-4 flex-row mx-auto mb-0 w_s w-75 text-center'>
            <p className='m-0 mr-2'>{e.beg}</p>
            <span>-</span>
            <p className='m-0 ml-2'>{e.end}</p>
          </div>
          : null
      }
    </div>);
  }
