import { useState } from "react";
import { motion } from "framer-motion";
import countryCodeToFlag from "../utils/countryFlags";
import WeatherIcon from "./WeatherIcon";
const WeatherCard = ({
  weather,
  unit,
  displayedCity,
  currentLocationCity,
  airQuality,
  uvIndex,
  alerts,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCompassPopup, setShowCompassPopup] = useState(false);
  if (
    !weather ||
    !weather.main ||
    !weather.weather ||
    !weather.wind ||
    !weather.sys
  ) {
    return (
      <motion.div
        className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="text-center text-gray-600">Loading weather data...</p>
      </motion.div>
    );
  }
  const {
    name,
    main,
    weather: weatherDetails,
    wind,
    visibility,
    sys,
  } = weather;
  const tempUnit = unit === "metric" ? "°C" : "°F";
  const speedUnit = unit === "metric" ? "m/s" : "mph";
  let displayName = displayedCity || name;
  let countryCode = "";
  if (typeof displayedCity === "string") {
    countryCode = displayedCity.split(", ").pop();
  } else if (displayedCity && displayedCity.lat && displayedCity.lon) {
    displayName = currentLocationCity || name;
    countryCode = currentLocationCity
      ? currentLocationCity.split(", ").pop()
      : "";
  }
  const flag = countryCode ? countryCodeToFlag(countryCode) : "";
  const formatTime = (timestamp) => {
    const adjustedTime = timestamp + (sys.timezone || 0);
    return new Date(adjustedTime * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const getAirQualityDescription = (aqi) => {
    switch (aqi) {
      case 1:
        return "Good";
      case 2:
        return "Fair";
      case 3:
        return "Moderate";
      case 4:
        return "Poor";
      case 5:
        return "Very Poor";
      default:
        return "Unknown";
    }
  };
  const getUVIndexInfo = (uvi) => {
    if (uvi <= 2) return { description: "Low", color: "text-green-600" };
    if (uvi <= 5) return { description: "Moderate", color: "text-yellow-600" };
    if (uvi <= 7) return { description: "High", color: "text-orange-600" };
    if (uvi <= 10) return { description: "Very High", color: "text-red-600" };
    return { description: "Extreme", color: "text-purple-600" };
  };
  const getCardinalDirection = (degrees) => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };
  const WindCompass = ({ degrees, speed, speedUnit }) => {
    if (degrees === undefined || degrees === null) {
      return (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
            <span className="text-gray-500 text-xs">N/A</span>
          </div>
          <p className="text-sm text-gray-600">Wind Direction</p>
          <p className="font-semibold">
            {speed} {speedUnit}
          </p>
        </div>
      );
    }
    const cardinal = getCardinalDirection(degrees);
    const rotation = degrees;
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="30"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            <text
              x="32"
              y="8"
              textAnchor="middle"
              className="text-xs font-bold fill-gray-600"
            >
              N
            </text>
            <text
              x="56"
              y="34"
              textAnchor="middle"
              className="text-xs font-bold fill-gray-600"
            >
              E
            </text>
            <text
              x="32"
              y="60"
              textAnchor="middle"
              className="text-xs font-bold fill-gray-600"
            >
              S
            </text>
            <text
              x="8"
              y="34"
              textAnchor="middle"
              className="text-xs font-bold fill-gray-600"
            >
              W
            </text>
            <g transform={`rotate(${rotation} 32 32)`}>
              <path
                d="M32 12 L28 20 L32 16 L36 20 Z"
                fill="#3b82f6"
                stroke="#1e40af"
                strokeWidth="1"
              />
              <line
                x1="32"
                y1="16"
                x2="32"
                y2="45"
                stroke="#3b82f6"
                strokeWidth="2"
              />
            </g>
          </svg>
        </div>
        <p className="text-sm text-gray-600">Wind Direction</p>
        <p className="font-semibold">
          {cardinal} ({degrees}°)
        </p>
        <p className="text-sm text-gray-600">Wind Speed</p>
        <p className="font-semibold">
          {speed} {speedUnit}
        </p>
      </div>
    );
  };
  return (
    <motion.div
      className="bg-gray-100 rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <h2 className="text-2xl font-bold mb-4">
        {flag && <span className={`mr-2 ${flag}`}></span>}
        {displayName}
      </h2>
      {alerts && alerts.length > 0 && (
        <div className="mb-4">
          {alerts.map((alert, index) => (
            <motion.div
              key={index}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {alert.event}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{alert.description}</p>
                    {alert.start && alert.end && (
                      <p className="mt-1">
                        <strong>Duration:</strong>{" "}
                        {new Date(alert.start * 1000).toLocaleString()} -{" "}
                        {new Date(alert.end * 1000).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-4xl font-bold">
            {Math.round(main.temp)}
            {tempUnit}
          </p>
          <p className="text-lg capitalize">{weatherDetails[0].description}</p>
        </div>
        <WeatherIcon
          iconCode={weatherDetails[0].icon}
          size={80}
          description={weatherDetails[0].description}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-4">
        <div>
          <p className="text-sm text-gray-600">Feels like</p>
          <p className="font-semibold">
            {Math.round(main.feels_like)}
            {tempUnit}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Humidity</p>
          <p className="font-semibold">{main.humidity}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Pressure</p>
          <p className="font-semibold">{main.pressure} hPa</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Visibility</p>
          <p className="font-semibold">{(visibility / 1000).toFixed(1)} km</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Sunrise</p>
          <p className="font-semibold">{formatTime(sys.sunrise)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Sunset</p>
          <p className="font-semibold">{formatTime(sys.sunset)}</p>
        </div>
        {uvIndex && typeof uvIndex === "number" && !isNaN(uvIndex) && (
          <div>
            <p className="text-sm text-gray-600">UV Index</p>
            <p className={`font-semibold ${getUVIndexInfo(uvIndex).color}`}>
              {uvIndex} - {getUVIndexInfo(uvIndex).description}
            </p>
          </div>
        )}
        <div>
          <button
            onClick={() => setShowCompassPopup(true)}
            aria-label="Open wind compass details"
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-sm"
          >
            Wind Compass
          </button>
        </div>
        {airQuality && airQuality.list && airQuality.list[0] && (
          <div className="col-span-full">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-label={`Air quality details, currently ${isExpanded ? "expanded" : "collapsed"}`}
              className="w-full text-left p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Air Quality</p>
                  <p className="font-semibold">
                    {getAirQualityDescription(airQuality.list[0].main.aqi)}
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4"
              >
                <div>
                  <p className="text-sm text-gray-600">PM2.5</p>
                  <p className="font-semibold">
                    {airQuality.list[0].components.pm2_5} µg/m³
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">PM10</p>
                  <p className="font-semibold">
                    {airQuality.list[0].components.pm10} µg/m³
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CO</p>
                  <p className="font-semibold">
                    {airQuality.list[0].components.co} µg/m³
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NO₂</p>
                  <p className="font-semibold">
                    {airQuality.list[0].components.no2} µg/m³
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">O₃</p>
                  <p className="font-semibold">
                    {airQuality.list[0].components.o3} µg/m³
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">SO₂</p>
                  <p className="font-semibold">
                    {airQuality.list[0].components.so2} µg/m³
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
      {showCompassPopup && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowCompassPopup(false)}
        >
          <motion.div
            role="dialog"
            aria-labelledby="wind-compass-title"
            aria-modal="true"
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 id="wind-compass-title" className="text-lg font-semibold">
                Wind Compass
              </h3>
              <button
                onClick={() => setShowCompassPopup(false)}
                aria-label="Close wind compass popup"
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <WindCompass
              degrees={wind.deg}
              speed={wind.speed}
              speedUnit={speedUnit}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
export default WeatherCard;
