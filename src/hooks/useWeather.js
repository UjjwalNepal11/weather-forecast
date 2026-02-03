import { useState, useEffect } from "react";
import axios from "axios";
import { API_KEY, BASE_URL } from "../utils/constants";
import { retryRequest, getErrorMessage } from "../utils/retry";
const CACHE_DURATION = 10 * 60 * 1000; 
const useWeather = (location, unit) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const getCacheKey = (location, unit) => {
    if (typeof location === "string") {
      return `weather_${location}_${unit}`;
    } else if (location && location.lat && location.lon) {
      return `weather_${location.lat}_${location.lon}_${unit}`;
    }
    return null;
  };
  const getCachedData = (key) => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        if (now - parsed.timestamp < CACHE_DURATION) {
          return parsed.data;
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (err) {
      console.error("Error reading from cache:", err);
    }
    return null;
  };
  const setCachedData = (key, data) => {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (err) {
      console.error("Error writing to cache:", err);
    }
  };
  useEffect(() => {
    if (!location) {
      setWeather(null);
      setForecast(null);
      setError("");
      return;
    }
    if (!API_KEY) {
      setError("API key not configured");
      return;
    }
    const cacheKey = getCacheKey(location, unit);
    if (!cacheKey) {
      setError("Invalid location format");
      return;
    }
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      setWeather(cachedData.weather);
      setForecast(cachedData.forecast);
    }
    const fetchWeather = async () => {
      setLoading(true);
      setError("");
      try {
        let params = {
          appid: API_KEY,
          units: unit,
        };
        if (typeof location === "string") {
          params.q = location;
        } else if (location.lat && location.lon) {
          params.lat = location.lat;
          params.lon = location.lon;
        } else {
          throw new Error("Invalid location format");
        }
        const weatherResponse = await retryRequest(() =>
          axios.get(`${BASE_URL}/weather`, { params }),
        );
        const newWeather = weatherResponse.data;
        const forecastResponse = await retryRequest(() =>
          axios.get(`${BASE_URL}/forecast`, { params }),
        );
        const newForecast = forecastResponse.data;
        setWeather(newWeather);
        setForecast(newForecast);
        setCachedData(cacheKey, { weather: newWeather, forecast: newForecast });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [location, unit]);
  return { weather, forecast, loading, error };
};
export default useWeather;
