import React, { useEffect, useState } from 'react';
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
import { ResponsiveContainer } from 'recharts';

Amplify.configure(config);

function App() {
  const [activeTab, setActiveTab] = useState('Temperature');
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Updated transformSensorData function to include PM1.0 and PM10
  const transformSensorData = (rawData) => {
    return rawData.map(item => ({
      ts: new Date(item.ts).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }),
      Temperature: item.Temperature,
      Humidity: item.Humidity,
      'Carbon Dioxide': item['Carbon Dioxide'],
      'PM2.5': item['PM2.5'],
      'PM1.0': item['PM1.0'], // Added PM1.0
      'PM10': item['PM10'],   // Added PM10
    }));
  };

  // Fetch sensor data from the backend
  useEffect(() => {
    fetch('http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/all')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const transformedData = transformSensorData(data.sensors);
        setSensorData(transformedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch sensor data:", err);
        setLoading(false);
      });
  }, []);

  // Function to handle tab selection
  const handleSelect = (selectedKey) => {
    setActiveTab(selectedKey);
  };

  // Mapping of tab names to Y-axis titles for dynamic labeling
  const yAxisTitleMap = {
    "Temperature": "Temperature (°C)",
    "Humidity": "Humidity (%)",
    "Carbon Dioxide": "CO2 (ppm)",
    "PM2.5": "Particles (µg/m³)",
    "PM1.0": "Particles (µg/m³)",
    "PM10": "Particles (µg/m³)"
  };

  // Function to render a chart component
  const renderChartComponent = (data, dataKeys, title) => {
    const yAxisTitle = yAxisTitleMap[dataKeys[0]];
  
    return (
      <div>
        <h3>{title}</h3>
        <ResponsiveContainer width={600} height={300}>
          <LineChart 
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }} // Adjust left value as needed
          >
            {dataKeys.map(key => (
              <Line key={key} type="monotone" dataKey={key} stroke="#8884d8" />
            ))}
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="ts" />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']} 
              label={{ 
                value: yAxisTitle, 
                angle: -90, 
                position: 'insideLeft', 
                style: { textAnchor: 'middle' },
                offset: -10 
              }} 
            />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  

  // Function to render charts based on active tab
  const renderChart = () => {
    if (loading) {
      return <p>Loading...</p>;
    }

    switch (activeTab) {
      case 'Temperature':
        return renderChartComponent(sensorData, ["Temperature"], "Temperature Data");
      case 'Humidity':
        return renderChartComponent(sensorData, ["Humidity"], "Humidity Data");
      case 'CO2':
        return renderChartComponent(sensorData, ["Carbon Dioxide"], "CO2 Data");
      case 'IAQ':
        return renderChartComponent(sensorData, ["PM2.5", "PM1.0", "PM10"], "Indoor Air Quality Data");
      default:
        return <div>Select a tab to view data</div>;
    }
  };

  // Main render return statement
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
              {renderChart()}
            </header>
          </div>
        </main>
      )}
    </Authenticator>
  );
}

export default withAuthenticator(App);
