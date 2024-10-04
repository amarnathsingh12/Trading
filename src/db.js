const connectToMongo = require('../src/database/connection');
const Trade = require('../src/schema/tradestore');
const express = require('express')
const WebSocket = require('ws');

connectToMongo();

const app = express()
app.use(express.json())

const depthWs = new WebSocket(`wss://fstream.binance.com/stream?streams=btcusdt@kline_1m`);
let ohlcData = [];
let positions = [];
let balance = 10000000; // Starting balance in USDT
let totalProfitLoss = 0;
let tradeHistory = [];
let isInPosition = false;
let entryPrice = 0;

depthWs.on('message', function incoming(data) {
    const result = JSON.parse(data);
        const { o, h, l, c, t } = result.data.k;
        const candle = {
            open: parseFloat(o),
            high: parseFloat(h),
            low: parseFloat(l),
            close: parseFloat(c),
            time: new Date(t)
        };

        ohlcData.push(candle);
        if (ohlcData.length > 100) {
            ohlcData.shift();
        }

        calculateSignals();
});



const calculateMovingAverage = (data, period) => {
    if (data.length < period) return null;
    const sum = data.slice(-period).reduce((acc, candle) => acc + candle.close, 0);
    return sum / period;
}

//    Moving average crossover algorithm for Buy and sell condition

const calculateSignals = () => {
    const shortPeriod = 10;
    const longPeriod = 50;

    const shortMA = calculateMovingAverage(ohlcData, shortPeriod);
    const longMA = calculateMovingAverage(ohlcData, longPeriod);
    console.log(shortMA,longMA)
    if (shortMA && longMA) {
        const lastShortMA = calculateMovingAverage(ohlcData.slice(0, -1), shortPeriod);
        const lastLongMA = calculateMovingAverage(ohlcData.slice(0, -1), longPeriod);

        if (lastShortMA < lastLongMA && shortMA > longMA && !isInPosition) {
            entryPrice = ohlcData[ohlcData.length - 1].close;
            const quantity = balance / entryPrice;
            positions.push({orderId: `buy-${Date.now()}`, entryPrice, quantity });
            balance -= entryPrice * quantity;
            isInPosition = true;
            
            console.log(`Buy at ${entryPrice}, Quantity: ${quantity}`);
        }

        if (lastShortMA > lastLongMA && shortMA < longMA && isInPosition) {
            const currentPrice = ohlcData[ohlcData.length - 1].close;
            const position = positions.pop();
            const profitLoss = (currentPrice - position.entryPrice) * position.quantity;
            totalProfitLoss += profitLoss;
            balance += currentPrice * position.quantity;
            isInPosition = false;

            const trade = new Trade({
                orderId: position.orderId,
                buyprice: position.entryPrice,
                quantity: position.quantity,
                sellprice: currentPrice,
                profit: profitLoss,
                createdAt: new Date()
            });
            trade.save(); // Save the trade to the database
            console.log(`Sell at ${currentPrice}, Profit/Loss: ${profitLoss}`);
        }
    }
}
