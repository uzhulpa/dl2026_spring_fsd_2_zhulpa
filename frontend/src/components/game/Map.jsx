import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ onClick, correctPoint, clickPoint, readOnly = false }) => {
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
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler />
      {clickPoint && <Marker position={[clickPoint.lat, clickPoint.lng]} />}
      {correctPoint && <Marker position={[correctPoint.lat, correctPoint.lng]} />}
    </MapContainer>
  );
};

export default Map;