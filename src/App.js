import React, { useState, useEffect, useContext } from 'react';
import { getWeatherForecast, getWeeklySummary } from './services/weatherService';
import ForecastWeather from './components/ForecastWeather';
import WeeklySummary from './components/WeeklySummary';
import ThemeToggle from './components/ThemeToggle'; 
import LocationInput from './components/LocationInput';
import MapComponent from './components/MapComponent'; 
import './App.css'; 
import { DarkModeContext } from './context/DarkModeContext';

const App = () => {
  const [coordinates, setCoordinates] = useState(null);
  const [forecastWeather, setForecastWeather] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false); 
  const [loading, setLoading] = useState(false);

  const { darkMode } = useContext(DarkModeContext);

  useEffect(() => {
    document.body.classList.toggle('light-mode', !darkMode); 
    document.body.classList.toggle('dark-mode', darkMode); 
  }, [darkMode]);

   useEffect(() => {
    if (coordinates) {
      const { latitude, longitude } = coordinates;
      const fetchWeather = async () => {
        setLoading(true);
        setError(null);
        try {
          const forecast = await getWeatherForecast(latitude, longitude);
          setForecastWeather(forecast);
        } catch (error) {
          console.error('Błąd podczas pobierania prognozy:', error.message);
          setError('Błąd podczas pobierania prognozy pogody. Sprawdź współrzędne.');
          setForecastWeather(null); 
        }
        try {
          const summary = await getWeeklySummary(latitude, longitude);
          setWeeklySummary(summary);
        } catch (error) {
          console.error('Błąd podczas pobierania podsumowania:', error.message);
          setError(prev => prev ? prev + ' Błąd podsumowania.' : 'Błąd podczas pobierania podsumowania pogody. Sprawdź współrzędne.');
          setWeeklySummary(null); 
        } finally {
          setLoading(false);
        }
      };
      fetchWeather();
    } else {
        setForecastWeather(null);
        setWeeklySummary(null);
        setError(null); 
        setLoading(false);
    }
  }, [coordinates]);

  const handleCoordinatesUpdate = (newCoords) => {
    if (newCoords === null) {
      setCoordinates(null);
      return;
    }

    const lat = parseFloat(newCoords.latitude);
    const lon = parseFloat(newCoords.longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Podaj współrzędne w postaci liczb: szerokość geograficzna [-90, 90], długość geograficzna [-180, 180]');
      setCoordinates(null);
    } else {
      setCoordinates({ latitude: lat, longitude: lon });
      setError(null);
    }
  };

  return (
    <div className={`App ${darkMode ? 'dark' : 'light'}`}>
      <ThemeToggle/>
      <LocationInput 
        onCoordinatesChange={handleCoordinatesUpdate} 
        onToggleMap={setShowMap} 
        currentCoordinates={coordinates} 
      />

      {showMap && (
        <div className="map-container-wrapper">
          <MapComponent setCoordinates={handleCoordinatesUpdate} />
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}

      {coordinates ? (
        <>
          <p id='coordinates-title'><strong>Współrzędne geograficzne:</strong></p>
          <p id='coordinates'>
            {coordinates.latitude !== 0
              ? `${parseFloat(Math.abs(coordinates.latitude).toPrecision(7))}° ${coordinates.latitude < 0 ? 'S' : 'N'}`
              : ''}
            {coordinates.latitude !== 0 && coordinates.longitude !== 0 ? ' / ' : ''}
            {coordinates.longitude !== 0
              ? `${parseFloat(Math.abs(coordinates.longitude).toPrecision(7))}° ${coordinates.longitude < 0 ? 'W' : 'E'}`
              : ''}
          </p>
        </>
      ) : (
        !error && !loading && <p>Wybierz lokalizację, aby zobaczyć prognozę pogody.</p>
      )}

      <h1>Prognoza pogody</h1>
      {loading && coordinates ? (
        <p>Ładowanie prognozy pogody...</p>
      ) : forecastWeather && !error ? (
        <ForecastWeather forecastWeather={forecastWeather} />
      ) : (
        coordinates && !error && <p>Brak danych prognozy pogody.</p>
      )}

      {loading && coordinates ? (
        <p>Ładowanie podsumowania pogody...</p>
      ) : weeklySummary && !error ? (
        <WeeklySummary weeklySummary={weeklySummary} />
      ) : (
        coordinates && !error && <p>Brak danych podsumowania pogody.</p>
      )}
    </div>
  );
};


export default App;