Here’s a comprehensive `README.md` file for your GitHub project, which explains the trading bot setup using Binance WebSocket, moving average crossovers, MongoDB integration for trade storage, and other key components. 

---

# Binance Trading Bot

This project is a trading bot that uses real-time market data from the Binance Futures WebSocket API to implement a simple moving average crossover strategy. It automatically buys and sells based on short-term and long-term moving averages and stores the trade history in a MongoDB database.

## Features
- **Real-Time Data**: The bot connects to Binance's WebSocket API and listens for live candlestick data.
- **Moving Average Crossover Strategy**: Implements a simple trading strategy based on the crossing of short-term and long-term moving averages (10-period and 50-period).
- **Automatic Trading**: The bot places simulated buy and sell orders based on moving average signals.
- **Profit/Loss Calculation**: Tracks profit/loss for each trade and maintains a running total of your balance.
- **MongoDB Integration**: Stores all trade history (buy price, sell price, profit/loss, quantity) in a MongoDB database.
  
## Prerequisites

### Software and Tools:
- [Node.js](https://nodejs.org/en/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or hosted MongoDB instance)
- Binance Futures API WebSocket (No API keys are required for WebSocket data)

### Node.js Dependencies:
- `express`: Web framework for handling routes (future extension)
- `ws`: WebSocket library for connecting to Binance's WebSocket API
- `axios`: For making HTTP requests (if you plan to integrate REST API in the future)
- `mongoose`: MongoDB ODM for managing trade data in the database

## Setup

1. **Clone the Repository**:

    ```bash
    git clone https://github.com/yourusername/binance-trading-bot.git
    cd binance-trading-bot
    ```

2. **Install Dependencies**:

    Install the necessary packages by running:

    ```bash
    npm install
    ```

3. **Configure MongoDB**:

    Make sure you have MongoDB installed and running locally, or use a MongoDB Atlas cloud instance. In the file `src/database/connection.js`, adjust the `mongoURI` to match your MongoDB connection string:

    ```javascript
    const mongoURI = "mongodb://localhost:27017/Trading";
    ```

4. **Run the Bot**:

    Start the bot with the following command:

    ```bash
    node index.js
    ```

    If everything is configured correctly, the bot will start receiving live data from Binance and print buy/sell signals, trade details, and profit/loss to the console.

## How It Works

### 1. **WebSocket Data Handling**:
   The bot connects to Binance's WebSocket for 1-minute candlestick data (`btcusdt@kline_1m`). Each candlestick contains the open, high, low, close (OHLC) prices and is stored in the `ohlcData` array for use in calculating moving averages.

   ```javascript
   const depthWs = new WebSocket(`wss://fstream.binance.com/stream?streams=btcusdt@kline_1m`);
   ```

### 2. **Moving Average Calculation**:
   The bot calculates the **10-period short-term** and **50-period long-term** moving averages using the closing prices of the candles in `ohlcData`.

   ```javascript
   const shortPeriod = 10;
   const longPeriod = 50;
   
   const shortMA = calculateMovingAverage(ohlcData, shortPeriod);
   const longMA = calculateMovingAverage(ohlcData, longPeriod);
   ```

### 3. **Trading Logic**:
   - **Buy Signal**: If the short-term moving average crosses above the long-term moving average and no position is open, the bot simulates a "buy" at the current closing price.
   - **Sell Signal**: If the short-term moving average crosses below the long-term moving average while holding a position, the bot simulates a "sell" and calculates the profit or loss for the trade.

   ```javascript
   if (lastShortMA < lastLongMA && shortMA > longMA && !isInPosition) {
       entryPrice = ohlcData[ohlcData.length - 1].close;
       // Execute buy order
   }
   
   if (lastShortMA > lastLongMA && shortMA < longMA && isInPosition) {
       const currentPrice = ohlcData[ohlcData.length - 1].close;
       // Execute sell order
   }
   ```

### 4. **Profit/Loss Calculation**:
   After each sell, the bot calculates the profit or loss by comparing the buy price and sell price, and updates the total balance.

   ```javascript
   const profitLoss = (currentPrice - position.entryPrice) * position.quantity;
   totalProfitLoss += profitLoss;
   ```

### 5. **MongoDB Integration**:
   The bot saves each trade (buy and sell) in a MongoDB collection for future reference. It stores the `buyPrice`, `sellPrice`, `quantity`, and `profit/loss`.

   ```javascript
   const trade = new Trade({
       orderId: position.orderId,
       buyprice: position.entryPrice,
       quantity: position.quantity,
       sellprice: currentPrice,
       profit: profitLoss,
       createdAt: new Date()
   });
   trade.save(); // Save the trade to the database
   ```

## File Structure

```bash
.
├── index.js              # Main entry point of the bot
├── src
│   ├── database
│   │   └── connection.js # MongoDB connection setup
│   ├── schema
│   │   └── tradestore.js # Mongoose schema for trade data
├── package.json          # Project dependencies and scripts
└── README.md             # This documentation file
```

## MongoDB Schema

The MongoDB schema for storing trades:

```javascript
const TradeSchema = new Schema({
    orderId: String,
    buyprice: Number,
    quantity: Number,
    sellprice: Number,
    profit: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
```

## Future Improvements

- **REST API Integration**: Place real orders using Binance’s REST API for actual trading.
- **Risk Management**: Implement stop-loss and take-profit strategies.
- **More Indicators**: Add more technical indicators to improve trading decisions.
- **Backtesting**: Implement a backtesting engine to test strategies on historical data.
- **Paper Trading Mode**: Add a simulation mode to test strategies without real money.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Feel free to submit pull requests or open issues for improvements or suggestions.

---

This `README.md` provides all the necessary information for setting up and running your Binance trading bot. It also highlights areas for future improvements and the main functionality of the bot.
