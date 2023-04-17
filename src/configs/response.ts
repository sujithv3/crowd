module.exports = {
  responseMessage(status: boolean, status_code: number, message: string) {
    return {
      status: status,
      status_code: status_code,
      message: message,
    };
  },
  responseWithData(
    status: boolean,
    status_code: number,
    message: string,
    data: any
  ) {
    return {
      status: status,
      status_code: status_code,
      message: message,
      data: data,
    };
  },
  responseWithToken(
    status: boolean,
    status_code: number,
    message: string,
    token: string
  ) {
    return {
      status: status,
      status_code: status_code,
      message: message,
      token: token,
    };
  },
  responseWithTokenAndRole(status, status_code, message, token, data) {
    return {
      status: status,
      status_code: status_code,
      message: message,
      token: token,
      data: data,
    };
  },
};
