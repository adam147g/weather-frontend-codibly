import React, { useState, useEffect, useRef } from 'react';
import './locationInput.css';

const LocationInput = ({ onCoordinatesChange, onToggleMap, currentCoordinates }) => {
  const [locationMode, setLocationMode] = useState(null);
  const [manualCoordinates, setManualCoordinates] = useState({ latitude: '', longitude: '' });
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState(null);

  const debounceTimeoutRef = useRef(null);

  const handleLocationModeChange = (mode) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setError(null);

    if (mode === 'manual' && locationMode === 'manual') {
      setShowManualInput(false);
      setLocationMode(null);
      onToggleMap(false);
    }
    else if (mode === 'map' && locationMode === 'map') {
      onToggleMap(false);
      setLocationMode(null);
      setShowManualInput(false);
    }
    else {
      setLocationMode(mode);
      onToggleMap(mode === 'map');
      setShowManualInput(mode === 'manual');

      if (mode === 'geolocation') {
        getLocation();
      } else if (mode === 'map') {
        setManualCoordinates({ latitude: '', longitude: '' });
      } else if (mode === 'manual') {
        if (currentCoordinates) {
          setManualCoordinates({
            latitude: currentCoordinates.latitude.toString(),
            longitude: currentCoordinates.longitude.toString(),
          });
        } else {
          setManualCoordinates({ latitude: '', longitude: '' });
        }
      }
    }
  };

  const getLocation = () => {
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          onCoordinatesChange({ latitude, longitude });
          setManualCoordinates({
            latitude: latitude.toString(),
            longitude: longitude.toString()
          });
        },
        (geoError) => {
          console.error('Błąd geolokalizacji:', geoError.message);
          let errorMessage = 'Błąd geolokalizacji.';
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              errorMessage += ' Odmówiono dostępu do lokalizacji.';
              break;
            case geoError.POSITION_UNAVAILABLE:
              errorMessage += ' Informacje o lokalizacji są niedostępne.';
              break;
            case geoError.TIMEOUT:
              errorMessage += ' Przekroczono czas oczekiwania na lokalizację.';
              break;
            default:
              errorMessage += ' Wystąpił nieznany błąd.';
              break;
          }
          setError(errorMessage);
          onCoordinatesChange(null);
          setManualCoordinates({ latitude: '', longitude: '' });
        }
      );
    } else {
      setError('Twoja przeglądarka nie wspiera geolokalizacji.');
      onCoordinatesChange(null);
      setManualCoordinates({ latitude: '', longitude: '' });
    }
  };

  const handleManualCoordinatesChange = (e) => {
    const { name, value } = e.target;
    setManualCoordinates(prevCoords => ({
      ...prevCoords,
      [name]: value,
    }));

    if (locationMode === 'manual') {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        const currentLat = name === 'latitude' ? value : manualCoordinates.latitude;
        const currentLon = name === 'longitude' ? value : manualCoordinates.longitude;
        handleSubmitManualCoordinates(currentLat, currentLon);
      }, 1000);
    }
  };

  const handleInputBlur = () => {
    if (locationMode === 'manual') {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      handleSubmitManualCoordinates(manualCoordinates.latitude, manualCoordinates.longitude);
    }
  };

  const handleSubmitManualCoordinates = (latValue = null, lonValue = null) => {
    setError(null);

    let lat = parseFloat(latValue !== null ? latValue : manualCoordinates.latitude);
    let lon = parseFloat(lonValue !== null ? lonValue : manualCoordinates.longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Podaj współrzędne w postaci liczb: szerokość geograficzna [-90, 90], długość geograficzna [-180, 180]');
      onCoordinatesChange(null);
    } else {
      onCoordinatesChange({ latitude: lat, longitude: lon });
      setError(null);
    }
  };

  useEffect(() => {
    if (currentCoordinates && locationMode !== 'manual') {
      setManualCoordinates({
        latitude: currentCoordinates.latitude.toString(),
        longitude: currentCoordinates.longitude.toString(),
      });
    } else if (!currentCoordinates && locationMode !== 'manual') {
      setManualCoordinates({ latitude: '', longitude: '' });
    }
  }, [currentCoordinates, locationMode]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="location-input-container">
      <div className="choice">
        <button
          onClick={() => handleLocationModeChange('geolocation')}
          className={locationMode === 'geolocation' ? 'active-button' : ''}
        >
          Obecna lokalizacja
        </button>
        <button
          onClick={() => handleLocationModeChange('manual')}
          className={locationMode === 'manual' ? 'active-button' : ''}
        >
          {locationMode === 'manual' && showManualInput ? 'Zamknij ręczne wprowadzanie' : 'Wprowadź ręcznie'}
        </button>
        <button
          onClick={() => handleLocationModeChange('map')}
          className={locationMode === 'map' ? 'active-button' : ''}
        >
          {locationMode === 'map' ? 'Zamknij mapę' : 'Wybierz z mapy'}
        </button>
      </div>

      <div className={`input-info-container ${showManualInput ? '' : 'hidden'}`}>
        <p className="input-info-text">Wprowadź współrzędne geograficzne ręcznie:</p>
        <label>
          Szerokość geograficzna (szer.) od -90 do 90:
          <input
            type="number"
            name="latitude"
            value={manualCoordinates.latitude}
            onChange={handleManualCoordinatesChange}
            onBlur={handleInputBlur}
          />
        </label>
        <label>
          Długość geograficzna (dł.) od -180 do 180:
          <input
            type="number"
            name="longitude"
            value={manualCoordinates.longitude}
            onChange={handleManualCoordinatesChange}
            onBlur={handleInputBlur}
          />
        </label>
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default LocationInput;