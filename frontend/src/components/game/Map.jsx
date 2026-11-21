import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ onClick, onMapReady, correctPoint, clickPoint, readOnly = false }) => {
  const MapAutoFit = () => {
    const map = useMap();

    useEffect(() => {
      if (!clickPoint || !correctPoint) return;

      const bounds = [
        [clickPoint.lat, clickPoint.lng],
        [correctPoint.lat, correctPoint.lng],
      ];

      map.fitBounds(bounds, {
        padding: [32, 32],
        maxZoom: 10,
      });
    }, [map, clickPoint, correctPoint]);

    return null;
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (!readOnly && onClick) {
          onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      className="game-map"
      whenReady={() => {
        if (onMapReady) onMapReady();
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler />
      <MapAutoFit />
      {clickPoint && <Marker position={[clickPoint.lat, clickPoint.lng]} />}
      {correctPoint && <Marker position={[correctPoint.lat, correctPoint.lng]} />}
    </MapContainer>
  );
};

export default Map;