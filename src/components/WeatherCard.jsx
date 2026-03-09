import { useState, useEffect } from "react";
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
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (weather && weather.dt) {
      setLastUpdated(new Date(weather.dt * 1000));
    }
  }, [weather]);

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

  const formatLastUpdated = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAirQualityDescription = (aqi) => {
    switch (aqi) {
      case 1:
        return {
          text: "Good",
          color: "bg-green-100 text-green-800",
          icon: "✓",
        };
      case 2:
        return {
          text: "Fair",
          color: "bg-yellow-100 text-yellow-800",
          icon: "○",
        };
      case 3:
        return {
          text: "Moderate",
          color: "bg-orange-100 text-orange-800",
          icon: "!",
        };
      case 4:
        return { text: "Poor", color: "bg-red-100 text-red-800", icon: "!!" };
      case 5:
        return {
          text: "Very Poor",
          color: "bg-purple-100 text-purple-800",
          icon: "!!!",
        };
      default:
        return {
          text: "Unknown",
          color: "bg-gray-100 text-gray-800",
          icon: "?",
        };
    }
  };

  const getUVIndexInfo = (uvi) => {
    if (uvi <= 2)
      return {
        description: "Low",
        color: "text-green-600",
        bg: "bg-green-100",
      };
    if (uvi <= 5)
      return {
        description: "Moderate",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    if (uvi <= 7)
      return {
        description: "High",
        color: "text-orange-600",
        bg: "bg-orange-100",
      };
    if (uvi <= 10)
      return {
        description: "Very High",
        color: "text-red-600",
        bg: "bg-red-100",
      };
    return {
      description: "Extreme",
      color: "text-purple-600",
      bg: "bg-purple-100",
    };
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

  // Generate mock hourly data for demonstration (in production, use forecast.hourly)
  const generateHourlyData = () => {
    const hours = [];
    const now = new Date();
    for (let i = 0; i < 8; i++) {
      const hour = new Date(now.getTime() + i * 3 * 60 * 60 * 1000);
      hours.push({
        time: hour.toLocaleTimeString([], { hour: "numeric", hour12: true }),
        temp: Math.round(main.temp + (Math.random() - 0.5) * 6),
        pop: Math.round(Math.random() * 60),
        icon: weatherDetails[0].icon,
      });
    }
    return hours;
  };

  const hourlyData = generateHourlyData();
  const aqiInfo =
    airQuality && airQuality.list && airQuality.list[0]
      ? getAirQualityDescription(airQuality.list[0].main.aqi)
      : null;
  const uvInfo =
    uvIndex && typeof uvIndex === "number" && !isNaN(uvIndex)
      ? getUVIndexInfo(uvIndex)
      : null;

  const WindCompass = ({ degrees, speed, speedUnit }) => {
    if (degrees === undefined || degrees === null) {
      return (
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
            <span className="text-gray-500 text-sm">N/A</span>
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
        <div className="relative w-20 h-20 sm:w-16 sm:h-16">
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
              className="text-sm font-bold fill-gray-600"
            >
              N
            </text>
            <text
              x="56"
              y="34"
              textAnchor="middle"
              className="text-sm font-bold fill-gray-600"
            >
              E
            </text>
            <text
              x="32"
              y="60"
              textAnchor="middle"
              className="text-sm font-bold fill-gray-600"
            >
              S
            </text>
            <text
              x="8"
              y="34"
              textAnchor="middle"
              className="text-sm font-bold fill-gray-600"
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
      className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 mb-6 relative border border-white/30 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Header with city name and last updated */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-gray-800 drop-shadow-sm">
            {flag && <span className={`mr-2 ${flag}`}></span>}
            {displayName}
          </h2>
        </div>
        {lastUpdated && (
          <span className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded-full">
            Updated {formatLastUpdated(lastUpdated)}
          </span>
        )}
      </div>

      {/* Weather Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="mb-4">
          {alerts.map((alert, index) => (
            <motion.div
              key={index}
              className="bg-red-100/90 backdrop-blur-sm border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-2 shadow-lg"
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

      {/* Main weather display */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-6xl font-bold text-gray-800 drop-shadow-sm">
            {Math.round(main.temp)}
            <span className="text-3xl">{tempUnit}</span>
          </p>
          <p className="text-xl capitalize text-gray-700">
            {weatherDetails[0].description}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Feels like {Math.round(main.feels_like)}
            {tempUnit}
          </p>
        </div>
        <WeatherIcon
          iconCode={weatherDetails[0].icon}
          size={100}
          description={weatherDetails[0].description}
        />
      </div>

      {/* Hourly forecast */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Next 8 Hours
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {hourlyData.map((hour, index) => (
            <div
              key={index}
              className="flex-shrink-0 bg-gray-100/80 rounded-xl p-3 text-center min-w-[70px] border border-gray-200"
            >
              <p className="text-xs text-gray-600">{hour.time}</p>
              <div className="my-1">
                <WeatherIcon iconCode={hour.icon} size={32} description="" />
              </div>
              <p className="text-sm font-bold text-gray-800">
                {hour.temp}
                {tempUnit}
              </p>
              {hour.pop > 0 && (
                <p className="text-xs text-blue-600">{hour.pop}%</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weather metrics grid with color badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-gray-100/80 rounded-xl p-3 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Humidity
          </p>
          <p className="text-lg font-bold text-gray-800">{main.humidity}%</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(main.humidity, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-100/80 rounded-xl p-3 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Pressure
          </p>
          <p className="text-lg font-bold text-gray-800">
            {main.pressure} <span className="text-xs font-normal">hPa</span>
          </p>
        </div>

        <div className="bg-gray-100/80 rounded-xl p-3 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Visibility
          </p>
          <p className="text-lg font-bold text-gray-800">
            {(visibility / 1000).toFixed(1)}{" "}
            <span className="text-xs font-normal">km</span>
          </p>
        </div>

        <div className="bg-gray-100/80 rounded-xl p-3 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Wind</p>
          <p className="text-lg font-bold text-gray-800">
            {wind.speed} {speedUnit}
          </p>
          <button
            onClick={() => setShowCompassPopup(true)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {getCardinalDirection(wind.deg)} →
          </button>
        </div>

        <div className="bg-gray-100/80 rounded-xl p-3 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Sunrise
          </p>
          <p className="text-lg font-bold text-gray-800">
            {formatTime(sys.sunrise)}
          </p>
          <span className="text-xs">🌅</span>
        </div>

        <div className="bg-gray-100/80 rounded-xl p-3 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Sunset
          </p>
          <p className="text-lg font-bold text-gray-800">
            {formatTime(sys.sunset)}
          </p>
          <span className="text-xs">🌇</span>
        </div>

        {uvInfo && (
          <div className="bg-gray-100/80 rounded-xl p-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              UV Index
            </p>
            <p className={`text-lg font-bold ${uvInfo.color}`}>{uvIndex}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${uvInfo.bg} ${uvInfo.color}`}
            >
              {uvInfo.description}
            </span>
          </div>
        )}

        {aqiInfo && (
          <div
            className={`bg-gray-100/80 rounded-xl p-3 border border-gray-200`}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Air Quality
            </p>
            <p
              className={`text-lg font-bold ${aqiInfo.text === "Good" ? "text-green-600" : aqiInfo.text === "Fair" ? "text-yellow-600" : aqiInfo.text === "Moderate" ? "text-orange-600" : aqiInfo.text === "Poor" ? "text-red-600" : "text-purple-600"}`}
            >
              {aqiInfo.text}
            </p>
            <span className="text-xs opacity-80">{aqiInfo.icon}</span>
          </div>
        )}

        <div className="col-span-full">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={`Air quality details, currently ${isExpanded ? "expanded" : "collapsed"}`}
            className="w-full text-left p-3 bg-gray-100/80 rounded-xl hover:bg-gray-200 transition-all border border-gray-200"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Air Quality</p>
                <p className="font-semibold text-gray-800">
                  {aqiInfo ? aqiInfo.text : "N/A"}
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
          {isExpanded &&
            airQuality &&
            airQuality.list &&
            airQuality.list[0] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-gray-100/50 rounded-xl"
              >
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-500">PM2.5</p>
                  <p className="font-semibold text-gray-800">
                    {airQuality.list[0].components.pm2_5} µg/m³
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-500">PM10</p>
                  <p className="font-semibold text-gray-800">
                    {airQuality.list[0].components.pm10} µg/m³
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-500">CO</p>
                  <p className="font-semibold text-gray-800">
                    {airQuality.list[0].components.co} µg/m³
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-500">NO₂</p>
                  <p className="font-semibold text-gray-800">
                    {airQuality.list[0].components.no2} µg/m³
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-500">O₃</p>
                  <p className="font-semibold text-gray-800">
                    {airQuality.list[0].components.o3} µg/m³
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-500">SO₂</p>
                  <p className="font-semibold text-gray-800">
                    {airQuality.list[0].components.so2} µg/m³
                  </p>
                </div>
              </motion.div>
            )}
        </div>
      </div>

      {/* Wind Compass Popup */}
      {showCompassPopup && (
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowCompassPopup(false)}
        >
          <motion.div
            role="dialog"
            aria-labelledby="wind-compass-title"
            aria-modal="true"
            className="bg-white rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full mx-4 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                id="wind-compass-title"
                className="text-lg font-semibold text-gray-800"
              >
                Wind Compass
              </h3>
              <button
                onClick={() => setShowCompassPopup(false)}
                aria-label="Close wind compass popup"
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
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
