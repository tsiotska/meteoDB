import $ from 'jquery';
import axios from 'axios';

let status = {
  OK: 100,
  SERVER_ERROR: 88,
  DEPRECATED: 66,
  NOT_FOUND: 33,
  INVALID_REQUEST: 32,
  UNDEFINED: 1,
  GENERIC_ERROR: 0
};

export default class FetchController {
  constructor(loadingStarted, loadingFinished, Progress) {
    this.state = {
      Status: status.UNDEFINED,
      Result: null,
      Errors: null,
      ProgressCallback: Progress,
      loaderOption: {
        xhr: this.onFetchAjax,
        beforeSend: loadingStarted,
        complete: loadingFinished,
        success: (data) => data,
        error: () => null
      }
    }
  }

  clear = () => {
    this.state.Status = status.UNDEFINED;
    this.state.Result = this.state.Errors = null;
  };

  onFetchAjax = () => {
    this.clear();
    let xhr = new window.XMLHttpRequest(), lenx = 0;

    xhr.onreadystatechange = function () {
      if (this.readyState === this.HEADERS_RECEIVED) {
        lenx = Number.parseInt(xhr.getResponseHeader('Content-Length'), 10);
      }
    };

    xhr.addEventListener("progress", (evt) => {

      if (lenx !== 0 && this.state.ProgressCallback) {
        console.log("I am progressing...");
        this.state.ProgressCallback(evt.loaded * 100 / lenx);
      }
    }, false);
    return xhr;
  };


  Get = (link) => {
    console.log(link);

    return axios.get(link, this.state.loaderOption)
      .then((response) => {
        console.log("FetchController: ");
        console.log(response);
        this.state.Status = response.data.code;
        this.state.Result = response.data.response;
        this.state.Errors = response.data.error;
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      })

    /* return $.ajax(link, this.state.loaderOption).done((data) => {
       console.log("FetchController data");
       console.log(data);
       this.state.Status = data.code;
       this.state.Result = data.result;
       this.state.Errors = data.error;
   });*/
  }
}
