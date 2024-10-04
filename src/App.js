const crypto = require('crypto');
require('dotenv').config();
// 'resolve.fallback: { "crypto": require.resolve("crypto-browserify") }'
async function getPrice(symbol){
  try{
    const pricefetch = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    const pricebody = await pricefetch.json();
    return parseFloat(pricebody.price);
  }catch(error){
    console.error('Error', error);
    throw error;
  }
}

async function makeTrade(symbol, price, action, quantity){
try {
  const apiKey = process.env.APIKey;
  const secretKey = process.env.SecretKey;
  const endpoint = 'https://api.binance.com/api/v3/order';
  const timestamp = Date.now();
  const params ={
    symbol,
    side: action,
    type:"LIMIT",
    quantity,
    price,
    timestamp,
    timeForce: 'GTC'
  };

  let queryString = Object.keys(params).map(key=>`${key}=${encodeURIComponent(params[key])}`).join('&');
  const signature = crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');

  queryString += '&signature='+signature;

  const url = endpoint+'?'+queryString;
  const request = await fetch(url,{
    method:'POST',
    header:{
      'apikey': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const response = await request.json();
  return response;


} catch (error) {
  console.error('Error', error);
  throw error;
}
}

(async()=>{
  const symbol = "SHIBUSDT";
  const price = getPrice(symbol);
  const action = "BUY" //SELL;
  const quantity = Math.round(5/price);
  const transaction = makeTrade(symbol, price, action, quantity);
  console.log(transaction)
})()