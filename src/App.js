import logo from './logo.svg';
import {Amplify, API} from 'aws-amplify'
import config from './aws-exports'
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

Amplify.configure(config);

function App() {
    const tempData = [
      { name: 'Jan', Temperature: 20 },
      { name: 'Feb', Temperature: 21 },
      { name: 'Mar', Temperature: 19 },
      { name: 'Apr', Temperature: 23 },
      { name: 'May', Temperature: 22 },
    ];
  
  
    const humidityData = [
      { name: 'Jan', Humidity: 30 },
      { name: 'Feb', Humidity: 35 },
      { name: 'Mar', Humidity: 33 },
      { name: 'Apr', Humidity: 32 },
      { name: 'May', Humidity: 31 },
    ];
  
  
    return (
      <Authenticator>
        {({ signOut, user }) => (
          <main>
            <div className="App">
              <div></div>
              <header className="App-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <h2>My App Content</h2>
                  <button className="sign-out-button" onClick={signOut}>Sign out</button>
                </div>
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
               
                <div>
                  <h3>Humidity Data</h3>
                  <BarChart width={400} height={300} data={humidityData}>
                    <Bar dataKey="Humidity" fill="#8884d8" />
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                  </BarChart>
                </div>
              </header>
            </div>
          </main>
        )}
      </Authenticator>
    );  
}

export default withAuthenticator(App);
