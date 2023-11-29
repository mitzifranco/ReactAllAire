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
/*import Dropdown from 'react-bootstrap/Dropdown';*/
import 'bootstrap/dist/css/bootstrap.min.css';


Amplify.configure(config);

function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestData, setLatestData] = useState({});
  const [apiUrl, setApiUrl] = useState('http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/all');
  const [error, setError] = useState(null);



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
    setLoading(true);
    setError(null); // Reset error state on new fetch
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data && data.sensors.length > 0) {
          const transformedData = transformSensorData(data.sensors);
          setSensorData(transformedData);
          setLatestData(transformedData[transformedData.length - 1] || {});
        } else {
          setError("No data available for this selection.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch sensor data:", err);
        setError("An error occurred while fetching data.");
        setLoading(false);
      });
  }, [apiUrl]);
  
  

  const changeApiUrl = (url) => {
    setApiUrl(url);
    setLoading(true); 
  };

  const handleSelect = (selectedKey) => {
    setActiveTab(selectedKey);
  };

  const renderHomeDashboard = () => {
    const alarmStatus = (value) => value === 0 ?
      <span style={{ color: 'green' }}>Normal</span> :
      <span style={{ color: 'red' }}>Warning</span>;

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


  const calculateAverages = (data) => {
    const sum = data.reduce((acc, item) => {
      Object.keys(item).forEach(key => {
        if (typeof item[key] === 'number') {
          acc[key] = (acc[key] || 0) + item[key];
        }
      });
      return acc;
    }, {});

    const averages = {};
    Object.keys(sum).forEach(key => {
      if (key !== 'rawTs') {
        averages[key] = sum[key] / data.length;
      }
    });

    return averages;
  };

  const generateSensorDescriptions = (averages) => {
    return {
      Temperature: `The average temperature is ${averages.Temperature.toFixed(2)}°C. Temperatures around 21-23°C are generally considered comfortable. ${
        averages.Temperature > 25 ? 'Higher temperatures may cause discomfort or increased energy costs for cooling.' : 'Lower temperatures might require heating for comfort.'
      }`,

      Humidity: `The average humidity is ${averages.Humidity.toFixed(2)}%. Ideal indoor humidity levels are usually between 30-50%. ${
        averages.Humidity > 50 ? 'High humidity can lead to mold growth and may worsen allergies.' : 'Low humidity can cause dry skin and irritate respiratory conditions.'
      }`,

      CO2: `The average CO2 level is ${averages['Carbon Dioxide'].toFixed(2)} ppm. Normal indoor levels are typically between 400-1000 ppm. ${
        averages['Carbon Dioxide'] > 1000 ? 'Higher levels can cause stuffiness and drowsiness, and indicate poor ventilation.' : 'Levels within this range suggest good air quality.'
      }`,

      IAQ: {
        'PM2.5': `Average PM2.5 is ${averages['PM2.5'].toFixed(2)} μg/m³. 
         ${averages['PM2.5'] > 35 ? 'Higher levels can affect heart and lung health.' : 'Lower levels indicate good air quality.'
        }`,
        'PM1.0': `Average PM1.0 is ${averages['PM1.0'].toFixed(2)} μg/m³. Smaller particals; high levels can impact air quality.`,
        'PM10': `Average PM10 is ${averages['PM10'].toFixed(2)} μg/m³. Higher levels can cause respetory issues.`
      }
    };
  };

  
  const renderChart = () => {
    const dropdown = (
      <div className="dropdown-container">
        <select onChange={(e) => changeApiUrl(e.target.value)} value={apiUrl}>
          <option value='http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/today'>Today</option>
          <option value='http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/yesterday'>Yesterday</option>
          
          <option value='http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/last-week'>Last Week</option>
        </select>
      </div>
    );

    if (loading) {
      return <p>Loading...</p>;
    }
    
    if (error) {
      return <p>{error}</p>; // Display the error message
    }
    
  
    const averages = calculateAverages(sensorData);
    const descriptions = generateSensorDescriptions(averages);
    const sensorDescription = descriptions[activeTab];
  
    const renderDescription = (description) => {
      if (typeof description === 'string') {
        const splitDescription = description.split('. ');
        return (
          <div>
            <p>{splitDescription[0]}.</p>
            <p>{splitDescription[1]}</p>
          </div>
        );
      } else if (typeof description === 'object') {
        return Object.entries(description).map(([key, value]) => <p key={key}>{value}</p>);
      }
    };
  
    // const dropdown = (
    //   <div className="dropdown-container">
    //     <select onChange={(e) => changeApiUrl(e.target.value)} value={apiUrl}>
    //       <option value='http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/today'>Today</option>
    //       <option value='http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/yesterday'>Yesterday</option>
          
    //       <option value='http://allaire-api.us-east-1.elasticbeanstalk.com/sensor/last-week'>Last Week</option>
    //     </select>
    //   </div>
    // );
  
    return (
      <div className="chart-container">
        {activeTab === 'Temperature' && (
          <>
            <h3>Temperature Data</h3>
            {dropdown}
            <ChartComponent data={sensorData} dataKeys={[{ key: "Temperature", unit: "°C" }]} />
            {renderDescription(sensorDescription)}
          </>
        )}
        {activeTab === 'Humidity' && (
          <>
            <h3>Humidity Data</h3>
            {dropdown}
            <ChartComponent data={sensorData} dataKeys={[{ key: "Humidity", unit: "%" }]} />
            {renderDescription(sensorDescription)}
          </>
        )}
        {activeTab === 'CO2' && (
          <>
            <h3>CO2 Levels</h3>
            {dropdown}
            <ChartComponent data={sensorData} dataKeys={[{ key: "Carbon Dioxide", unit: "ppm" }]} />
            {renderDescription(sensorDescription)}
          </>
        )}
        {activeTab === 'IAQ' && (
          <>
            <h3>Indoor Air Quality Data</h3>
            {dropdown}
            <ChartComponent
              data={sensorData}
              dataKeys={[
                { key: "PM2.5", unit: "μg/m³" },
                { key: "PM1.0", unit: "μg/m³" },
                { key: "PM10", unit: "μg/m³" }
              ]}
            />
            {renderDescription(descriptions.IAQ)}
          </>
        )}
      </div>
    );
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
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip content={<CustomTooltip />} />
          <Legend align="right" verticalAlign="top" layout="horizontal" wrapperStyle={{ paddingRight: '10px', paddingBottom: '10px' }} />
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
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
