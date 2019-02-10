
const failed = (statusCode, message, data, params) => {

    let failedRequest = data;
  
    if (data) {
      //If there was a error from the API request
      if(!(data.statusCode)) {
        failedRequest = Object.assign({
          statusCode: statusCode,
          params: params
        }, data);
      }
  
      //IF there is an error sent from the TeamSpeak File
      if (!(data.message)) {
  
        failedRequest = {
          statusCode: statusCode,
          status: 'failed',
          message: message,
          error: data,  
          params: params
        }
      }
    
      //If Data is null
    } else {
      
      failedRequest = {
        statusCode: statusCode,
        status: 'FaiL',
        message: message,
        error: data,  
        params: params
      }
    }
  
    return failedRequest;
  
  }
  
  const success = (message, data) => {
  
       api = {
          status: 'success',
          message: message,
          server: data
        }
  
        return api;
  
  }


  module.exports = {
    failed,
    success
};

