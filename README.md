## this repository contains a sdk build around the API repository of
> https://github.com/malforsaja/express-mongo-jwt

### Clone the repository
> git clone git@github.com:malforsaja/api-sdk.git

### Install the dependencies
> npm install

### Check the "out" folder for the documentation

### Check the config.json file to make the right configurations

### Start testing the library by runnig the command
> npm start

### Usage

```js
const Payment = require('../src/pay-sdk').default;
const configs = require('../config/config.json');

const payment = new Payment(configs);

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
```