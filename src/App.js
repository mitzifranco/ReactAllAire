import React, { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import config from './aws-exports';
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

import { Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import logoImage from './img/AllAireUpdated.png';

Amplify.configure(config);

function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestData, setLatestData] = useState({});

  const transformSensorData = (rawData) => {
    return rawData.map(item => ({
      rawTs: new Date(item.ts),
      formattedTs: new Date(item.ts).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }),
      Temperature: item.Temperature,
      Humidity: item.Humidity,
      'Carbon Dioxide': item['Carbon Dioxide'],
      'PM2.5': item['PM2.5'],
      'PM1.0': item['PM1.0'],
      'PM10': item['PM10'],
      SmokeDetector: item.SmokeDetector,
      Filter: item.Filter
    }))
    .sort((a, b) => a.rawTs - b.rawTs);
  };


  useEffect(() => {
    fetch('http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/all')
      .then(response => response.json())
      .then(data => {
        const transformedData = transformSensorData(data.sensors);
        setSensorData(transformedData);
        setLatestData(transformedData[transformedData.length - 1] || {});
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch sensor data:", err);
        setLoading(false);
      });
  }, []);

  const handleSelect = (selectedKey) => {
    setActiveTab(selectedKey);
  };

  const renderHomeDashboard = () => {
    const alarmStatus = (value) => value === 0 ? 
      <span style={{color: 'green'}}>Normal</span> : 
      <span style={{color: 'red'}}>Warning</span>;
  
    return (
      <div className="dashboard-container">
        <div className="dashboard-bubble">
          <h3 className="dashboard-title">Today's Info</h3>
          <div className="dashboard-row">
            <span className="dashboard-text">Temperature:</span>
            <span className="dashboard-data">{latestData.Temperature} °C</span>
          </div>
          <div className="dashboard-row">
            <span className="dashboard-text">Humidity:</span>
            <span className="dashboard-data">{latestData.Humidity} %</span>
          </div>
          <div className="dashboard-row">
            <span className="dashboard-text">CO2 Levels:</span>
            <span className="dashboard-data">{latestData['Carbon Dioxide']} ppm</span>
          </div>
          <div className="dashboard-row">
            <span className="dashboard-text">Indoor Air Quality:</span>
            <span className="dashboard-data">PM2.5: {latestData['PM2.5']}, PM1.0: {latestData['PM1.0']}, PM10: {latestData['PM10']}</span>
          </div>
        </div>
  
        <div className="dashboard-bubble">
          <h3 className="dashboard-title">Alarms</h3>
          <div className="dashboard-row">
            <span className="dashboard-text">Smoke Detector:</span>
            <span className="dashboard-data">{alarmStatus(latestData.SmokeDetector)}</span>
          </div>
          <div className="dashboard-row">
            <span className="dashboard-text">Air Filter:</span>
            <span className="dashboard-data">{alarmStatus(latestData.Filter)}</span>
          </div>
        </div>
      </div>
    );
  };
  

  const renderChart = () => {
    if (loading) {
      return <p>Loading...</p>;
    }

    switch (activeTab) {
      case 'Temperature':
        return <ChartComponent data={sensorData} dataKeys={[{ key: "Temperature", unit: "°C" }]} title="Temperature Data" />;
      case 'Humidity':
        return <ChartComponent data={sensorData} dataKeys={[{ key: "Humidity", unit: "%" }]} title="Humidity Data" />;
      case 'CO2':
        return <ChartComponent data={sensorData} dataKeys={[{ key: "Carbon Dioxide", unit: "ppm" }]} title="CO2 Data" />;
      case 'IAQ':
        return <ChartComponent data={sensorData} dataKeys={[{ key: "PM2.5", unit: "μg/m³" }, { key: "PM1.0", unit: "μg/m³" }, { key: "PM10", unit: "μg/m³", color: "#d88484" }]} title="Indoor Air Quality Data" />;
      default:
        return <div>Select a tab to view data</div>;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="tooltip-entry">
              {`${entry.name}: ${entry.value}${entry.unit || ''}`}
            </p>
          ))}
        </div>
      );
    }
  
    return null;
  };
  
  
  const ChartComponent = ({ data, dataKeys, title }) => (
    <div>
      <h3>{title}</h3>
      <ResponsiveContainer width={950} height={300}>
        <LineChart data={data} margin={{ top: 5, right: 100, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="formattedTs" padding={{ left: 30, right: 30 }} />
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
          <Tooltip content={<CustomTooltip />} />
          <Legend align="center" verticalAlign="top" layout="vertical" />
          {dataKeys.map(({ key, unit }, index) => {
          let strokeColor = "#8884d8"; 
          if (key === "PM10") {
            strokeColor = "#d88484"; 
          } else if (index % 2 === 0) {
            strokeColor = "#8884d8"; 
          } else {
            strokeColor = "#82ca9d"; 
          }
          return (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={`${key} (${unit})`}
              stroke={strokeColor}
              activeDot={key === "PM10" ? { r: 8 } : {}}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
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
                      <img src={logoImage} className="brand-logo" alt="AllAire" />
                      <span className="brand-name">AllAire</span>
                    </Navbar.Brand>
                  </Container>
                </Navbar>
                <button className="sign-out-button" onClick={signOut}>
                  Sign out
                </button>
              </div>
              <Nav className="my-custom-nav justify-content-center nav-spacing" variant="pills" defaultActiveKey="Home" onSelect={handleSelect}>
                <Nav.Item className="justified-nav-item">
                  <Nav.Link eventKey="Home">Home</Nav.Link>
                </Nav.Item>
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
              {activeTab === 'Home' ? renderHomeDashboard() : renderChart()}
            </header>
          </div>
        </main>
      )}
    </Authenticator>
  );
}

export default withAuthenticator(App);
