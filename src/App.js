import logo from './logo.svg';
import {Amplify, API} from 'aws-amplify'
import config from './aws-exports'
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

Amplify.configure(config);

function App() {
  // Sample data for temperature
  const tempData = [
      { name: 'Jan', Temperature: 20 },
    { name: 'Feb', Temperature: 21 },
    { name: 'Mar', Temperature: 19 },
    { name: 'Apr', Temperature: 23 },
    { name: 'May', Temperature: 22 },
  ];
  
  // Sample data for humidity
  const humidityData = [
    { name: 'Jan', Humidity: 30 },
    { name: 'Feb', Humidity: 35 },
    { name: 'Mar', Humidity: 33 },
    { name: 'Apr', Humidity: 32 },
    { name: 'May', Humidity: 31 },
  ];

  // Sample data for CO2
  const co2Data = [
    { name: 'Jan', CO2: 400 },
    { name: 'Feb', CO2: 420 },
    { name: 'Mar', CO2: 430 },
    { name: 'Apr', CO2: 440 },
    { name: 'May', CO2: 460 }  ];

  // Sample data for IAQ
  const iaqData = [
    { name: 'Jan', CO: 0.2, NO2: 0.1, PM2_5: 15 },
    { name: 'Feb', CO: 0.3, NO2: 0.1, PM2_5: 16 },
    { name: 'Mar', CO: 0.4, NO2: 0.1, PM2_5: 17 },
    { name: 'Apr', CO: 0.3, NO2: 0.1, PM2_5: 16 },
    { name: 'May', CO: 0.4, NO2: 0.1, PM2_5: 17 },
     ];
//asssssssss
//hellllloooooooooooooooooooooooooo
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <div className="App">
            <header className="App-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <h2>My App Content</h2>
                <button className="sign-out-button" onClick={signOut}>Sign out</button>
              </div>
              
              {/* Temperature Data */}
              <div>
                <h3>Temperature Data</h3>
                <LineChart width={400} height={300} data={tempData}>
                  <Line type="monotone" dataKey="Temperature" stroke="#8884d8" />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </div>

              {/* Humidity Data */}
              <div>
                <h3>Humidity Data</h3>
                <LineChart width={400} height={300} data={humidityData}>
                  <Line type="monotone" dataKey="Humidity" stroke="#8884d8" />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </div>

              {/* CO2 Data */}
              <div>
                <h3>CO2 Data</h3>
                <LineChart width={400} height={300} data={co2Data}>
                  <Line type="monotone" dataKey="CO2" stroke="#8884d8" />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </div>

              {/* IAQ Data */}
              <div>
                <h3>Indoor Air Quality Data</h3>
                <LineChart width={400} height={300} data={iaqData}>
                  <Line type="monotone" dataKey="CO" stroke="#8884d8" />
                  <Line type="monotone" dataKey="NO2" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="PM2_5" stroke="#ffc658" />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </div>

            </header>
          </div>
        </main>
      )}
    </Authenticator>
  );  
}

export default withAuthenticator(App);
