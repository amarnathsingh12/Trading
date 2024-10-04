const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const mongoURI = "mongodb://localhost:27017/Trading"
const connectToMongo = async () => {
    mongoose.connect(mongoURI).then(() => {
            console.log("connected to database")
        }).catch((err) => {
            console.log(err);
        });
};

module.exports = connectToMongo;