const express = require('express');
const app = express();
const port = process.env.PORT || 9000;
const sensorRouter = require('./routes/sensor');


const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration

app.use(express.json());
app.use('/sensor', sensorRouter);
app.use(cors());

app.get('/', (req, res) => {
    res.send('<h1>All Aire API</h1> <h4>The API is now up and running! :)</h4><h4>Add /sensor/all to get the current information in DynamoDB</h4>');
})

app.listen(port, () =>{
    console.log('Demo app is up and listenting to port: ' + port);
})
