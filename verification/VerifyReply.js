

const failed = (error, msg) => {

    if (!error.error) {

        failedApi = {
            status: 'failed',
            message: msg,
            error: error
        }
        return failedApi;
    }

    return error;
}
  


  module.exports = {
    failed
};

