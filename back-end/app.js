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
    res.send('<h1>All Aire API :)</h1><h4>Click the options below to see the current information in DynamoDB</h4><a href="http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/all">Get ALL of the information from our sensors</a><br /><br /><a href="http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/today">Get all of the information TODAY from our sensors</a><br /><br /><a href="http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/yesterday">Get all the information YESTERDAY from our sensors</a><br /><br /><a href="http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/last-week">Get all of the information LAST WEEK from our sensors</a>');
})

app.listen(port, () =>{
    console.log('Demo app is up and listenting to port: ' + port);
})
