const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});
const sns = new AWS.SNS();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'ESP8266_T';
const snsTopicArn = 'arn:aws:sns:us-east-1:623481064187:AllAireNotifs'; 

//function to GET items recorded today
//works with item I created but double check to make sure with a full data item
router.get('/today', async (req, res) => {
    try {
      const currentTimeMillis = new Date().getTime();
      const startOfTodayTimestamp = new Date().setHours(0, 0, 0, 0);
  
      const params = {
        TableName: dynamodbTableName,
        FilterExpression: '#ts >= :startOfToday',
        ExpressionAttributeNames: {
          '#ts': 'ts',
        },
        ExpressionAttributeValues: {
          ':startOfToday': startOfTodayTimestamp,
        },
      };
  
      const result = await dynamodb.scan(params).promise();
      res.json({ sensors: result.Items });
    } catch (error) {
      console.error('Failed to fetch data from today:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

//function to GET items recorded yesterday AND today
//works with item I created but double check to make sure with a full data item
router.get('/yesterdayAndToday', async (req, res) => {
    try {
      const currentTimeMillis = new Date().getTime();
      const yesterdayTimestamp = currentTimeMillis - (24 * 60 * 60 * 1000);
      console.log(currentTimeMillis)
      console.log(yesterdayTimestamp)
  
      const params = {
        TableName: dynamodbTableName,
        FilterExpression: '#ts >= :startOfYesterday AND #ts < :startOfToday',
        ExpressionAttributeNames: {
          '#ts': 'ts',
        },
        ExpressionAttributeValues: {
          ':startOfYesterday': yesterdayTimestamp,
          ':startOfToday': currentTimeMillis,
        },
      };
  
      const result = await dynamodb.scan(params).promise();
      res.json({ sensors: result.Items });
    } catch (error) {
      console.error('Failed to fetch data from yesterday:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});
//end

//function to GET methods created ONLY yesterday
//NOT today
//test not sure if it works
router.get('/yesterday', async (req, res) => {
    try {
      const currentTimeMillis = new Date().getTime();
      const startOfTodayMillis = new Date().setHours(0, 0, 0, 0);
      const startOfYesterdayMillis = startOfTodayMillis - (24 * 60 * 60 * 1000);
  
      const params = {
        TableName: dynamodbTableName,
        FilterExpression: '#ts >= :startOfYesterday AND #ts < :startOfToday',
        ExpressionAttributeNames: {
          '#ts': 'ts', // Adjusted to 'ts'
        },
        ExpressionAttributeValues: {
          ':startOfYesterday': startOfYesterdayMillis,
          ':startOfToday': startOfTodayMillis,
        },
      };
  
      const result = await dynamodb.scan(params).promise();
      res.json({ sensors: result.Items });
    } catch (error) {
      console.error('Failed to fetch data from yesterday:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

//function to GET all data recorded last week ONLY
//does not get data from this week
//new code for last week... can't rlly test if it works bc I don't remember when we last put ins
router.get('/last-week', async (req, res) => {
    try {
      const currentTimeMillis = new Date().getTime();
      const startOfThisWeekMillis = new Date().setHours(0, 0, 0, 0);
      const startOfLastWeekMillis = startOfThisWeekMillis - (7 * 24 * 60 * 60 * 1000);
  
      const params = {
        TableName: dynamodbTableName,
        FilterExpression: '#ts >= :startOfLastWeek AND #ts < :startOfThisWeek',
        ExpressionAttributeNames: {
          '#ts': 'ts', // Adjusted to 'ts'
        },
        ExpressionAttributeValues: {
          ':startOfLastWeek': startOfLastWeekMillis,
          ':startOfThisWeek': startOfThisWeekMillis,
        },
      };
  
      const result = await dynamodb.scan(params).promise();
      res.json({ sensors: result.Items });
    } catch (error) {
      console.error('Failed to fetch data from last week (excluding current week):', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

//GETS ALL data
router.get('/all', async (req, res) => {
    const params = {
        TableName: dynamodbTableName
    };

    try {
        const allSensors = await scanDynamoRecords(params, []);
        const body = {
            sensors: allSensors
        };

        // Check for dirty sensors with "Filter" or "SmokeDetector" field equal to 1
        const dirtyFilterSensors = allSensors.filter(sensor => sensor && sensor.Filter === 1);
        const dirtySmokeDetectorSensors = allSensors.filter(sensor => sensor && sensor.SmokeDetector === 1);

        if (dirtyFilterSensors.length > 0) {
            // Send SNS email for dirty "Filter"
            sendSNSEmail("Filter");
        }

        if (dirtySmokeDetectorSensors.length > 0) {
            // Send SNS email for dirty "SmokeDetector"
            sendSNSEmail("SmokeDetector");
        }

        res.json(body);
    } catch (error) {
        console.error('ERROR logged in GET ALL Method', error);
        res.status(500).send(error);
    }
});

//sends the Email
function sendSNSEmail(triggeredField) {
    // Get the current date and time
    const currentDateTime = new Date().toLocaleString();

    // Customize the message with the current date and time
    let message;
    if (triggeredField === "Filter") {
        message = `Alert: The filter sensor has a dirty filter! Please change the filter as soon as possible to maintain great air quality. Triggered at ${currentDateTime}`;
    } else if (triggeredField === "SmokeDetector") {
        message = `Alert: The smoke detector sensor has been triggered! This means smoke or carbon monoxide is present in your home. Get out and stay out! Triggered at ${currentDateTime}`;
    } 
    //it'll send seperate messages if both are triggered which is better
    /*else if(triggeredField === "Filter" & triggeredField === "SmokeDetector"){
        message = `Alert: BOTH The smoke detector sensor and filter sensor have been triggered! This means smoke or carbon monoxide is present in your home. Get out and stay out! Please change the filter after fire has been cleared to maintain great air quality. Triggered at ${currentDateTime}`;
    }*/
    else {
        // Handle other cases if needed
        message = `Alert: Unknown sensor triggered! Triggered at ${currentDateTime}`;
    }

    // Send SNS email with the customized message
    const subject = `Sensor Alert - ${triggeredField}`;
    const params = {
        Message: message,
        Subject: subject,
        TopicArn: snsTopicArn
    };

    sns.publish(params, (err, data) => {
        if (err) {
            console.error('Error publishing message to SNS:', err);
        } else {
            console.log('Message published to SNS successfully:', data);
        }
    });
}


async function scanDynamoRecords(scanParams, itemArray) {
    try {
        const dynamoData = await dynamodb.scan(scanParams).promise();
        itemArray = itemArray.concat(dynamoData.Items);
        if (dynamoData.LastEvaluatedKey) {
            scanParams.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
            return await scanDynamoRecords(scanParams, itemArray);
        }
        return itemArray;
    } catch (error) {
        throw new Error(error);
    }
}


module.exports = router;