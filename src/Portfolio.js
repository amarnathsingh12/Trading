const connectToMongo = require('../src/database/connection');
const Trade = require('../src/schema/tradestore');

connectToMongo();

async function generateReport() {
    try {

        const trades = await Trade.find({});

        // Initialize report variables
        let totalProfitLoss = 0;

        // Print header
        console.log("=== Trade Summary Report ===");
        console.log("Order ID\tBuy Price\tQuantity\tSell Price\tProfit/Loss\tDate");

        // Process each trade
        trades.forEach(trade => {
            totalProfitLoss += trade.profit;
            console.log(`${trade.orderId}\t${trade.buyprice}\t${trade.quantity}\t${trade.sellprice}\t${trade.profit}\t${trade.createdAt}`);
        });

        // Print final profit/loss statement
        console.log("\n=== Final Profit/Loss Statement ===");
        console.log(`Total Profit/Loss: ${totalProfitLoss.toFixed(2)}`);

    } catch (error) {
        console.error("Error fetching trades:", error);
    }
}

// Execute the report generation
generateReport();
