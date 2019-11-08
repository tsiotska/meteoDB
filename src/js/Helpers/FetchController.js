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
  constructor(loaderVisibility) { //loadingStarted, loadingFinished, Progress,
    this.loaderVisibility = loaderVisibility;
    this.Status = status.UNDEFINED;
    this.Result = null;
    this.Errors = null;
  }

  clear = () => {
    this.Status = status.UNDEFINED;
    this.Result = this.Errors = null;
  };


  Get = (link) => {
    this.loaderVisibility(true);
    console.log(link);
    return axios.get(link)
      .then((response) => {
        console.log("FetchController: ");
        console.log(response);
        this.Status = response.data.code;
        this.Result = response.data.response;
        this.Errors = response.data.error;
        this.loaderVisibility(false);
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      })
  }
}
