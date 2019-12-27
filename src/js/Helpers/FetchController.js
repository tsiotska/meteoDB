import axios from 'axios';

let status = {
  OK: 100,
  SERVER_ERROR: 88,
  DEPRECATED: 66,
  ACCESS_DENIED: 60,
  NOT_FOUND: 33,
  INVALID_REQUEST: 32,
  UNDEFINED: 1,
  GENERIC_ERROR: 0
};

class FetchController {
  constructor(loaderVisibility) {
    this.loaderVisibility = loaderVisibility;
    this.Status = status.UNDEFINED;
    this.Result = null;
    this.Errors = null;
  }

  Post = async (link, payload) => {
    this.loaderVisibility(true);
    console.log(link);
    console.log(payload);
    try {
      const options = {
        headers: {
            'Content-Type': 'application/json',
        }
      };
      const response = await axios.post(link, payload, options);
      console.log(response);
      this.Status = response.data.code;
      this.Result = response.data.response;
      this.Errors = response.data.error;
      this.loaderVisibility(false);
      return response.data;
    } catch (error) {
      console.log(error);
    }

    if (this.Errors !== null && this.Errors.length) {
      console.log(this.Errors)
    }
  };

  Get = async (link) => {
    this.loaderVisibility(true);
    console.log(link);

    /* return axios.get(link) .then((response) =>{
       console.log(response);
       this.Status = response.data.code;
       this.Result = response.data.response;
       this.Errors = response.data.error;
       this.loaderVisibility(false);
       return response.data;
     }).catch ((error)=> {
       console.log(error);
     })
     */

    try {
      const response = await axios.get(link);
      console.log(response);
      this.Status = response.data.code;
      this.Result = response.data.response;
      this.Errors = response.data.error;
      this.loaderVisibility(false);
      return response.data;
    } catch (error) {
      console.log(error);
    }
    // TODO: use a human readable error when schema ready
    if (this.Errors !== null && this.Errors.length) {
      console.log(this.Errors)
    }
  };
}


export default FetchController
