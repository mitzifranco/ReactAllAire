const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'ESP8266_T';

//the following does not work... it is just a GET request for a specific sensor
//ex. API/sensor/clock and it would return ONE full row in dynamoDB
//there is an issue being returned saying the schema does not match
//def is an issue with clock/ts (might have to put in every variable name not sure)
//either way it's not neccessary so we should b fine
router.get('/', async(req,res) => {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            'clock': req.query.clock,
            'ts': req.query.ts
        }
    }
    await dynamodb.get(params).promise().then(response => {
        res.json(response.Item);
    }, error => {
        console.error('ERROR logged in GET Method', error);
        res.status(500).send(error);
    }) 
})

//the following is a GET ALL method so it will return everything in dynamoDB
//API/sensor/all to call it
router.get('/all', async(req,res) => {
    const params = {
        TableName: dynamodbTableName
    }
    try {
        const allSensors = await scanDynamoRecords(params, []);
        const body = {
            sensors: allSensors
        }
        res.json(body);
    } catch(error){
        console.error('ERROR logged in GET ALL Method', error);
        res.status(500).send(error);
    }
})

async function scanDynamoRecords(scanParams, itemArray){
    try{
        const dynamoData = await dynamodb.scan(scanParams).promise();
        itemArray = itemArray.concat(dynamoData.Items);
        if(dynamoData.LastEvaluatedKey){
            scanParams.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
            return await scanDynamoRecords(scanParams, itemArray);
        }
        return itemArray;
    } catch(error){
        throw new Error(error)
    }
}

module.exports = router;