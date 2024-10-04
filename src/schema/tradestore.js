const mongoose = require('mongoose');
const { Schema } = mongoose;

const TradeSchema = new Schema({
    orderId: {
        type: String,
    },
    buyprice: {
        type: Number,
    },
    quantity: {
        type: Number,
    },
    sellprice: {
        type: Number,
    },
    profit: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the creation date
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
const Trade = mongoose.model('tradeschema', TradeSchema);
Trade.createIndexes();
module.exports = Trade