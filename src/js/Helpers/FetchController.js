
import $ from 'jquery'

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
    let callback = this.state.ProgressCallback;
    this.clear();
    let xhr = new window.XMLHttpRequest(),
      lenx = 0;

    xhr.onreadystatechange = function() {
      if (this.readyState === this.HEADERS_RECEIVED) {

        lenx = Number.parseInt(xhr.getResponseHeader('Content-Length'), 10);

      }
    };

    xhr.addEventListener("progress", (evt) => {
      if (lenx !== 0 && callback) {
        callback(evt.loaded * 100 / lenx);
      }
    }, false);
    return xhr;
  };


  // Naming conflict -> refactor later
  Get = (link) => {
    return $.ajax(link, this.state.loaderOption).done((data) => {
      console.log("I got some data for you...");
      console.log(data);
      this.state.Status = data.code;
      this.state.Result = data.result;
      this.state.Errors = data.error;
    });
  }
}
