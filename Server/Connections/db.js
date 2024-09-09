//server/connection/
const mongoose = require('mongoose');
const connectionString = process.env.CONNECTIONSTRING;
mongoose.connect(connectionString).then(()=>{
    console.log("MongoDB Connection Established");
    
}).catch((error)=>{
    console.log(`mongoDB Connection error, ${error}`);
    
})