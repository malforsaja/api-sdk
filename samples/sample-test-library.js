
const Payment = require('../src/pay-sdk').default;
const configs = require('../config/config.json');

const payment = new Payment(configs);

// you have to retrieve a token using the function userLogin() by providing username and password, 
// then use this token for granting access to other requests.

let token;
payment.userLogin({
  username: "serious_business",
  password: "suchPassw0rdSecure"
})
  .then((data) => {
    token = data.authToken;
    console.log('login: ', data);
    return token;
  }).then(token => {
    return payment.createPayment(
      {
        "payeeId": "fc1941f3-7912-4b3d-8fdb-dcb9733aa999", 
        "payerId": "0499274e-9325-43b1-9cff-57c957e9a333",
        "paymentSystem": "ingenico", 
        "paymentMethod": "mastercard", 
        "amount": 1000.42, 
        "currency": "EUR",
        "comment": "Salary for April"
      }, token)
      .then((data) => {
        console.log('data: ', data);
      })
      .catch((error) => {
        console.log('err: ', error.response.data);
        
      });
  })
  .catch((error) => {
    console.log('err: ', error);
  });


