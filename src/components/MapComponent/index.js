import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const ClickEventHandler = ({ onClick }) => {
    useMapEvents({
        click(e) {
            onClick(e.latlng)
        },
    });
    return null;
};

const MapComponent = ({ setCoordinates }) => {
    const [coordinates, setLocalCoordinates] = useState(null);

    const handleMapClick = (latlng) => {
        setLocalCoordinates(latlng); 
        setCoordinates({ latitude: latlng.lat, longitude: latlng.lng });
    };

    const customIcon = new L.Icon({
        iconUrl: '/images/popup-icon.png',
        iconSize: [46, 40],
        iconAnchor: [23, 40], 
        popupAnchor: [0, -41],
    });

    return (
        <div>
            <MapContainer
                center={[51.505, -0.09]} 
                zoom={13}
                style={{ height: '400px', width: '100%', marginTop: '30px'}}
            >
                <TileLayer
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                    attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <ClickEventHandler onClick={handleMapClick} />
                {coordinates && (
                    <Marker position={coordinates} icon={customIcon}>
                        <Popup>
                            You clicked at {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            
        </div>
    );
};

export default MapComponent;
