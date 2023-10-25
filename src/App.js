
import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import config from './aws-exports';
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import logoImage from './img/AllAireUpdated.png';

Amplify.configure(config);
function App() {
  const [activeTab, setActiveTab] = useState('Temperature');
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
  const co2Data = [
   { name: 'Jan', CO2: 400 },
    { name: 'Feb', CO2: 420 },
    { name: 'Mar', CO2: 430 },
    { name: 'Apr', CO2: 440 },
    { name: 'May', CO2: 460 },
  ];
  const iaqData = [
    { name: 'Jan', CO: 0.2, NO2: 0.1, PM2_5: 15 },
    { name: 'Feb', CO: 0.3, NO2: 0.1, PM2_5: 16 },
    { name: 'Mar', CO: 0.4, NO2: 0.1, PM2_5: 17 },
    { name: 'Apr', CO: 0.3, NO2: 0.1, PM2_5: 16 },
    { name: 'May', CO: 0.4, NO2: 0.1, PM2_5: 17 },
  ];

  const handleSelect = (selectedKey) => {
    setActiveTab(selectedKey);
  };
  const renderChart = () => {
    switch (activeTab) {
      case 'Temperature':
        return renderTemperatureChart();
      case 'Humidity':
        return renderHumidityChart();
      case 'CO2':
        return renderCO2Chart();
      case 'IAQ':
        return renderIAQChart();
      default:
        return <div>Select a tab to view data</div>;
    }
  };
  const renderChartComponent = (data, dataKey, title) => (
  <div>
    <h3>{title}</h3>
    <LineChart width={400} height={300} data={data}>
      <Line type="monotone" dataKey={dataKey} stroke="#8884d8" />
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
    </LineChart>
  </div>
);
// Specific functions to render each type of chart
const renderTemperatureChart = () => renderChartComponent(tempData, "Temperature", "Temperature Data");
const renderHumidityChart = () => renderChartComponent(humidityData, "Humidity", "Humidity Data");
const renderCO2Chart = () => renderChartComponent(co2Data, "CO2", "CO2 Data");
const renderIAQChart = () => (
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
);
return (
  <Authenticator>
    {({ signOut, user }) => (
      <main>
        <div className="App">
          <header className="App-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Navbar className="navbar">
              <Container>
                <Navbar.Brand>
                  <img
                    src={logoImage}
                    className="brand-logo"
                    alt="AllAire" 
                  />
                  <span className="brand-name">AllAire</span>
                </Navbar.Brand>
              </Container>
              </Navbar>
              <button className="sign-out-button" onClick={signOut}>
                Sign out
              </button>
            </div>
            <div></div>
            {/* Updated Nav component */}
            <Nav className="my-custom-nav justify-content-center nav-spacing" variant="pills" defaultActiveKey="Temperature" onSelect={handleSelect}>
              <Nav.Item className="justified-nav-item">
                <Nav.Link eventKey="Temperature">Temperature</Nav.Link>
              </Nav.Item>
              <Nav.Item className="justified-nav-item">
                <Nav.Link eventKey="Humidity">Humidity</Nav.Link>
              </Nav.Item>
              <Nav.Item className="justified-nav-item">
                <Nav.Link eventKey="CO2">CO2 Levels</Nav.Link>
              </Nav.Item>
              <Nav.Item className="justified-nav-item">
                <Nav.Link eventKey="IAQ">Indoor Air Quality</Nav.Link>
              </Nav.Item>
            </Nav>
            {/* Chart rendering based on selected tab */}
            {renderChart()}
          </header>
        </div>
      </main>
    )}
  </Authenticator>
);
}
export default withAuthenticator(App);
