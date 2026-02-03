import { useState, useEffect, lazy, Suspense, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import Forecast from "./components/Forecast";
const WeatherMap = lazy(() => import("./components/WeatherMap"));
import UnitToggle from "./components/UnitToggle";
import Loading from "./components/Loading";
import ErrorMessage from "./components/ErrorMessage";
import favicon from "/favicon.png";
import useWeather from "./hooks/useWeather";
import useAirQuality from "./hooks/useAirQuality";
import useUVIndex from "./hooks/useUVIndex";
import useAlerts from "./hooks/useAlerts";
import useLocalStorage from "./hooks/useLocalStorage";
import { API_KEY } from "./utils/constants";
function App() {
  const [location, setLocation] = useState("");
  const [unit, setUnit] = useLocalStorage("unit", "metric");
  const [recentCities, setRecentCities] = useLocalStorage("recentCities", []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [locationError, setLocationError] = useState("");
  const [locationErrorTimeout, setLocationErrorTimeout] = useState(null);
  const [currentLocationCity, setCurrentLocationCity] = useState("");
  const [displayedCity, setDisplayedCity] = useState("");
  const [lastLocation, setLastLocation] = useLocalStorage("lastLocation", null);
  const modalRef = useRef(null);
  const handleCurrentLocation = async () => {
    setLocationError("");
    if (locationErrorTimeout) {
      clearTimeout(locationErrorTimeout);
      setLocationErrorTimeout(null);
    }
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      const timeout = setTimeout(() => setLocationError(""), 2000);
      setLocationErrorTimeout(timeout);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationData = { lat: latitude, lon: longitude };
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`,
          );
          if (response.data.length > 0) {
            const cityData = response.data[0];
            const formattedCity = `${cityData.name}, ${cityData.country}`;
            setLocation(locationData);
            setCurrentLocationCity(formattedCity);
            setDisplayedCity(formattedCity);
            const newHistory = history.slice(0, currentIndex + 1);
            const fullLocationData = { ...locationData, city: formattedCity };
            if (newHistory[newHistory.length - 1] !== fullLocationData) {
              newHistory.push(fullLocationData);
            }
            const newIndex = newHistory.length - 1;
            setHistory(newHistory);
            setCurrentIndex(newIndex);
            setLastLocation(fullLocationData);
            window.history.pushState(
              {
                location: fullLocationData,
                history: newHistory,
                currentIndex: newIndex,
              },
              "",
              `${import.meta.env.BASE_URL}?city=${encodeURIComponent(formattedCity)}`,
            );
            setLocationError("");
          } else {
            console.log("Reverse geocoding returned no data");
            setLocationError("");
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          console.log("Reverse geocoding failed");
          setLocationError("");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(
          "Unable to retrieve your location. Please enable location services in your browser settings.",
        );
        const timeout = setTimeout(() => setLocationError(""), 2000);
        setLocationErrorTimeout(timeout);
      },
    );
  };
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialCity = urlParams.get("city") || "";
    if (initialCity && API_KEY) {
      if (
        lastLocation &&
        typeof lastLocation === "object" &&
        lastLocation.city === initialCity
      ) {
        setLocation(lastLocation);
        setCurrentLocationCity(lastLocation.city);
        setHistory([lastLocation]);
        setCurrentIndex(0);
        window.history.replaceState(
          { location: lastLocation, history: [lastLocation], currentIndex: 0 },
          "",
          `${import.meta.env.BASE_URL}?city=${encodeURIComponent(initialCity)}`,
        );
      } else {
        setLocation(initialCity);
        setHistory([initialCity]);
        setCurrentIndex(0);
        window.history.replaceState(
          { location: initialCity, history: [initialCity], currentIndex: 0 },
          "",
          `${import.meta.env.BASE_URL}?city=${encodeURIComponent(initialCity)}`,
        );
      }
    }
  }, []);
  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;
      if (state) {
        if (
          typeof state.location === "object" &&
          state.location.lat &&
          state.location.lon
        ) {
          setLocation(state.location);
          setCurrentLocationCity(state.location.city || "");
        } else {
          setLocation(state.location);
          setCurrentLocationCity("");
        }
        setHistory(state.history || []);
        setCurrentIndex(state.currentIndex || -1);
        setLastLocation(state.location);
      } else {
        setLocation("");
        setCurrentLocationCity("");
        setHistory([]);
        setCurrentIndex(-1);
        setLastLocation(null);
        window.history.replaceState(
          { location: "", history: [], currentIndex: -1 },
          "",
          import.meta.env.BASE_URL,
        );
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  useEffect(() => {
    return () => {
      if (locationErrorTimeout) {
        clearTimeout(locationErrorTimeout);
      }
    };
  }, [locationErrorTimeout]);
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("scrollPosition", window.scrollY.toString());
    };
    const restoreScrollPosition = () => {
      const scrollPosition = sessionStorage.getItem("scrollPosition");
      if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition, 10));
        sessionStorage.removeItem("scrollPosition");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    const timer = setTimeout(restoreScrollPosition, 100);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearTimeout(timer);
    };
  }, []);
  const { weather, forecast, loading, error } = useWeather(location, unit);
  const {
    airQuality,
    loading: airQualityLoading,
    error: airQualityError,
  } = useAirQuality(location);
  const { uvIndex, loading: uvLoading, error: uvError } = useUVIndex(location);
  const {
    alerts,
    loading: alertsLoading,
    error: alertsError,
  } = useAlerts(location);
  useEffect(() => {
    if (weather && displayedCity) {
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WeatherObservation",
        name: `Current weather in ${displayedCity}`,
        observationDate: new Date(weather.dt * 1000).toISOString(),
        temperature: {
          "@type": "QuantitativeValue",
          value: Math.round(weather.main.temp),
          unitText: unit === "metric" ? "°C" : "°F",
        },
        weatherCondition: weather.weather[0].description,
        humidity: {
          "@type": "QuantitativeValue",
          value: weather.main.humidity,
          unitText: "%",
        },
        windSpeed: {
          "@type": "QuantitativeValue",
          value: weather.wind.speed,
          unitText: unit === "metric" ? "m/s" : "mph",
        },
        visibility: {
          "@type": "QuantitativeValue",
          value: weather.visibility / 1000,
          unitText: "km",
        },
      };
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      script.id = "weather-json-ld";
      const existingScript = document.getElementById("weather-json-ld");
      if (existingScript) {
        existingScript.remove();
      }
      document.head.appendChild(script);
    }
    return () => {
      const existingScript = document.getElementById("weather-json-ld");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [weather, unit, displayedCity]);
  const displayCity =
    typeof location === "string" ? location : currentLocationCity;
  useEffect(() => {
    setDisplayedCity(displayCity);
  }, [displayCity]);
  const getBackgroundClass = () => {
    if (!weather) return "bg-gradient-to-br from-blue-400 to-blue-600";
    const condition = weather.weather[0].main.toLowerCase();
    switch (condition) {
      case "clear":
        return "bg-sunny";
      case "clouds":
        return "bg-cloudy";
      case "rain":
      case "drizzle":
        return "bg-rainy";
      case "thunderstorm":
        return "bg-thunderstorm";
      case "snow":
        return "bg-snowy";
      default:
        return "bg-stormy";
    }
  };
  const getTitleClass = () => {
    if (!weather) return "text-gray-800";
    const condition = weather.weather[0].main.toLowerCase();
    switch (condition) {
      case "clear":
      case "clouds":
        return "text-gray-800";
      case "rain":
      case "drizzle":
      case "thunderstorm":
      case "snow":
      default:
        return "text-white";
    }
  };
  const handleSearch = (searchedCity) => {
    const newHistory = history.slice(0, currentIndex + 1);
    if (newHistory[newHistory.length - 1] !== searchedCity) {
      newHistory.push(searchedCity);
    }
    const newIndex = newHistory.length - 1;
    setLocation(searchedCity);
    setHistory(newHistory);
    setCurrentIndex(newIndex);
    setLastLocation(searchedCity);
    window.history.pushState(
      { location: searchedCity, history: newHistory, currentIndex: newIndex },
      "",
      `${import.meta.env.BASE_URL}?city=${encodeURIComponent(searchedCity)}`,
    );
    if (!recentCities.includes(searchedCity)) {
      setRecentCities((prev) => [searchedCity, ...prev.slice(0, 4)]);
    }
  };
  const handleHome = () => {
    setLocation("");
    setHistory([]);
    setCurrentIndex(-1);
    window.history.replaceState(
      { location: "", history: [], currentIndex: -1 },
      "",
      import.meta.env.BASE_URL,
    );
  };
  const title = weather
    ? `Weatherly - ${displayedCity}: ${weather.weather[0].description}, ${Math.round(weather.main.temp)}°${unit === "metric" ? "C" : "F"}`
    : "Weatherly - Real-time Weather Intelligence";
  const description = weather
    ? `Get the latest weather forecast for ${displayedCity}. Current conditions: ${weather.weather[0].description}, temperature ${Math.round(weather.main.temp)}°${unit === "metric" ? "C" : "F"}, humidity ${weather.main.humidity}%.`
    : "A modern weather app providing real-time forecasts, air quality insights, and alerts through a clean, responsive interface.";
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/favicon.png" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="/favicon.png" />
      </Helmet>
      <div
        className={`min-h-screen relative ${getBackgroundClass()} flex flex-col p-2 sm:p-4`}
      >
        <div className="flex-grow flex flex-col items-center justify-center">
          <button
            className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center space-x-2 cursor-pointer bg-transparent border-none p-0"
            onClick={handleHome}
            aria-label="Go to home"
          >
            <img src={favicon} alt="Weatherly Logo" className="w-6 h-6" />
            <span className={`text-lg font-semibold ${getTitleClass()}`}>
              Weatherly
            </span>
          </button>
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            <button
              onClick={() => setIsModalOpen(true)}
              aria-label="Open about modal"
              className="text-black hover:text-gray-800"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="https://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 ${getTitleClass()}`}
          >
            Weatherly
          </h1>
          <div className="w-full max-w-4xl bg-[#E3E1E1]/80 backdrop-blur-md rounded-lg shadow-lg p-4 sm:p-6">
            <Suspense
              fallback={
                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                  Loading...
                </div>
              }
            >
              <UnitToggle
                unit={unit}
                setUnit={setUnit}
                onCurrentLocation={handleCurrentLocation}
              />
            </Suspense>
            <Suspense
              fallback={
                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                  Loading...
                </div>
              }
            >
              <SearchBar
                city={displayedCity}
                onSearch={handleSearch}
                onCurrentLocation={handleCurrentLocation}
                recentCities={recentCities}
                setRecentCities={setRecentCities}
              />
            </Suspense>
            {locationError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-medium">Location Error</p>
                <p>{locationError}</p>
              </div>
            )}
            <AnimatePresence>
              {loading && (
                <Suspense
                  fallback={
                    <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                      Loading...
                    </div>
                  }
                >
                  <Loading />
                </Suspense>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {error && (
                <Suspense
                  fallback={
                    <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                      Loading...
                    </div>
                  }
                >
                  <ErrorMessage message={error} />
                </Suspense>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {weather && !error && (
                <Suspense
                  fallback={
                    <div className="bg-gray-100 rounded-lg p-6 mb-6">
                      Loading weather...
                    </div>
                  }
                >
                  <WeatherCard
                    weather={weather}
                    unit={unit}
                    displayedCity={displayedCity}
                    currentLocationCity={currentLocationCity}
                    airQuality={airQuality}
                    uvIndex={uvIndex}
                    alerts={alerts}
                  />
                </Suspense>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {forecast && !error && (
                <Suspense
                  fallback={
                    <div className="bg-gray-100 rounded-lg p-6 mb-6">
                      Loading forecast...
                    </div>
                  }
                >
                  <Forecast forecast={forecast} unit={unit} />
                </Suspense>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {weather && !error && (
                <Suspense
                  fallback={
                    <div className="bg-gray-100 rounded-lg p-6 mb-6">
                      <div className="h-96 w-full rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Loading map...</span>
                      </div>
                    </div>
                  }
                >
                  <WeatherMap location={location} weather={weather} />
                </Suspense>
              )}
            </AnimatePresence>
          </div>
          {isModalOpen && (
            <div
              role="dialog"
              aria-labelledby="about-modal-title"
              aria-modal="true"
              className="absolute top-12 right-4 bg-white rounded-lg p-4 shadow-lg z-50 max-w-xs"
            >
              <h2
                id="about-modal-title"
                className="text-lg font-bold mb-2 text-gray-800"
              >
                About
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                A modern weather app providing real-time forecasts, air quality
                insights, and alerts through a clean, responsive interface.
              </p>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close about modal"
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
              >
                Close
              </button>
            </div>
          )}
        </div>
        <footer className="text-center text-gray-600 mt-4">
          Built by Bhagwat Nepal | Powered by OpenWeatherMap
        </footer>
      </div>
    </>
  );
}
export default App;
