## This will be our back-end for the proj
This back-end uses Node.js and Express.js

## To run this locally
Open a new terminal and make sure you are in the .../back-end file
run in the terminal "npm install" to install the neccessary modules locally
Next, run 'node app.js' and the app will be running
Go to the url: http://localhost:9000/
add /sensor/all to the end of the localhost url to get all the data in dynamoDB

We are using port 9000 to not conflict with the front-end port of 3000
Make sure these are never the same.

# AWS Elastic Link:
http://allaire-api.us-east-1.elasticbeanstalk.com/
http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/all
Note if you make any changes then they will only show locally until you update it all the way through to elastic.
