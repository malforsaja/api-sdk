import axios from 'axios';
import isUrl from 'is-url';
import joinUrl from 'proper-url-join';
import queryString from 'query-string';


/**
 * Rejects the request.
 * @return {Promise} error - Returns a Promise with the details for the wrong request.
 */
function rejectValidation(statusCode, module, param) {
  return Promise.reject({
    code: statusCode,
    message: `The ${module} ${param}!`
  });
}

/**
 * @classdesc Represents an API call.
 * @class
 * @abstract
 */
class APICall {
  /**
   * Create a APICall.
   * @constructor
   * @param {string} baseURL - A string with the base URL for requests.
   * @param {Object} [data={}] - An object containing the query parameters.
   */
  constructor(baseURL) {
    if (!isUrl(baseURL)) throw new Error('The base URL provided is not valid');

    this.baseURL = baseURL;
  }

  /**
   * Fetch the information from the API.
   * @return {Promise} - Returns a Promise that, when fulfilled, will either return an JSON Object with the requested
   * data or an Error with the problem.
   */
  send(method, url, data = {}, token) {
    let callURL = joinUrl(this.baseURL, url, { trailingSlash: true });
    axios.defaults.baseURL = this.baseURL;
    axios.defaults.headers.common['Authorization'] = "Bearer " + token;
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    let body = '';

    if (method === 'POST') {
      body = queryString.stringify(data);
    } else if (Object.keys(data).length && data.constructor === Object) {
      callURL = joinUrl(callURL, { trailingSlash: true, query: data });
    }

    return axios(callURL, { method, data: body })
      .then((response) => {
        if (response.status >= 400) { // check for 4XX, 5XX errors
          return Promise.reject({
            status: response.status,
            message: response.data
          });
        }
        response = response;
        if (response.status >= 200 && response.status <= 201) {
          return response.data;
        }
        return {};
      });
  }
}

/**
 * @classdesc Represents the Payment SDK. It allows the user to make every call to the API with a single function.
 * @class
 */
export default class Paymnet {
  /**
   * Create Paymnet SDK.
   * @constructor
   * @param {String} options.baseURL - The URL with the account domain.
   */
  constructor(options) {
    this.api = new APICall(
      options.baseURL
    );
  }

  /**
   * Get all the users.
   * @return {Promise} Users - Returns a Promise that, when fulfilled, will either return an Array with the
   * categories or an Error with the problem.
   */
  getAllUsers(token) {
    return this.api.send('GET', 'users', {}, token);
  }

  /**
   * Login to retrieve token.
   * @param {Object} params={} - An object containing the credentials with which the user intends to login.
   * @param {String} params.username - The username of the user.
   * @param {String} params.password - The password of the user.
   * @return {Promise} Credentials - Returns a Promise that, when fulfilled
   */
  userLogin(params) {
    if (!params.username || !params.password) {
      return rejectValidation('authentication', 'username or password');
    }

    return this.api.send('POST', '/authenticate', params);
  }

  /**
   * Get all the payments.
   * @param {Object} {} - Empty body request.
   * @param {String} token - A string containing the authorised token provided by the API.
   * @return {Promise} Payments - Returns a Promise that, when fulfilled, will either return an Array with the
   * payments or an Error with the problem.
   */
  getPayments(token) {
    return this.api.send('GET', 'payments', {}, token);
  }

  /**
   * Get the payment information according to the id provided.
   * @param {String} id - The id of the desired asset.
   * @param {Object} {} - Empty body request.
   * @param {String} token - A string containing the authorised token provided by the API.
   * @return {Promise} Payment - Returns a Promise that, when fulfilled, will either return an Object with the asset or
   * an Error with the problem.
   */
  findOnePayment(id, token) {
    if (!id || !token) {
      return rejectValidation(400, 'payment', 'id is missing');
    }
    return this.api.send('GET', `payment/${id}`, {}, token);
  }


  /**
   * Approve payment.
   * @param {String} id - The id of the payment.
   * @param {Object} {} - Empty body request.
   * @param {String} token - A string containing the authorised token provided by the API.
   * @return {Promise} Object - Returns a Promise that, when fulfilled, will either return an empty Object in
   * case it's successful or an Error with the problem.
   */
  approvePayment(id, token) {
    if (!id || !token) {
      return rejectValidation(400, 'payments', 'id is missing!');
    }
    return this.api.send('PUT', `payments/${id}/approve`, {}, token);
  }

  /**
   * Cancel payment.
   * @param {String} id - The id of the payment.
   * @param {Object} {} - Empty body request.
   * @param {String} token - A string containing the authorised token provided by the API.
   * @return {Promise} Object - Returns a Promise that, when fulfilled, will either return an empty Object in
   * case it's successful or an Error with the problem.
   */
  cancelPayment(id, token) {
    if (!id) {
      return rejectValidation(400, 'payments', 'id is missing!');
    }
    return this.api.send('PUT', `payments/${id}/cancel`, {}, token);
  }

  /**
   * Create a new Payment
   * @param {Object} params={} - An object containing the data of payment.
   * @param {String} params.payeeId - The payeeId of the payment.
   * @param {String} params.payerId - The payerId of the payment.
   * @param {String} params.paymentSystem - The paymentSystem of the payment.
   * @param {String} params.paymentMethod - The paymentMethod of the payment.
   * @param {Number} params.amount - The amount of the payment.
   * @param {String} params.currency - The currency of the payment.
   * @param {String} params.comment - The comment of the payment.
   * @param {String} token - A string containing the authorised token provided by the API.
   * @return {Promise} Response - Returns a Promise that, when fulfilled, will either return an Object with the
   * response or an Error with the problem.
   */
  createPayment(params, token) {
    return this.api.send('POST', `payments`, params, token);
  }

}