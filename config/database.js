var mongoose = require("mongoose");
var dbUri = "<your-mongo-db-uri>";

mongoose.Promise = global.Promise;
mongoose.connect(dbUri)
    .then(() => {
        console.log(">> Mongoose connected ...");
    })
    .catch(error => console.log(`Mongoose connection error: ${error.message}`));