
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

class FetchController{
  constructor(loaderVisibility) {
    this.loaderVisibility = loaderVisibility;
    this.Status = status.UNDEFINED;
    this.Result = null;
    this.Errors = null;
  }

  clear = () => {
    this.Status = status.UNDEFINED;
    this.Result = this.Errors = null;
  };

  Get = async (link) => {
   this.loaderVisibility(true);
    console.log(link);
    try {
      const response = await axios.get(link);
      console.log("FetchController: ");
      console.log(response);
      this.Status = response.data.code;
      this.Result = response.data.response;
      this.Errors = response.data.error;
      this.loaderVisibility(false);
      return response.data;
    }
    catch (error) {
      console.log(error);
    }
  };
}


export default FetchController