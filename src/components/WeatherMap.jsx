import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lon) {
      map.setView([center.lat, center.lon], 10);
    }
  }, [center, map]);
  return null;
};
const WeatherMap = ({ location, weather }) => {
  const getCoordinates = () => {
    if (
      location &&
      typeof location === "object" &&
      location.lat &&
      location.lon
    ) {
      return { lat: location.lat, lon: location.lon };
    }
    if (weather && weather.coord) {
      return { lat: weather.coord.lat, lon: weather.coord.lon };
    }
    return { lat: 51.505, lon: -0.09 };
  };
  const center = getCoordinates();
  return (
    <div className="bg-gray-100 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Weather Map</h3>
      <div className="h-96 w-full rounded-lg overflow-hidden relative">
        <MapContainer
          center={[center.lat, center.lon]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
          role="img"
          aria-label={`Weather map showing location at latitude ${center.lat.toFixed(2)}, longitude ${center.lon.toFixed(2)}`}
        >
          <MapUpdater center={center} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <Marker
            position={[center.lat, center.lon]}
            aria-label={`Location marker at latitude ${center.lat.toFixed(2)}, longitude ${center.lon.toFixed(2)}`}
          />
        </MapContainer>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Map showing the current weather location.
      </p>
    </div>
  );
};
export default WeatherMap;
