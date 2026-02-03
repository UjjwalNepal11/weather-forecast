import { useState, useEffect } from "react";
import axios from "axios";
import { API_KEY, ONECALL_BASE_URL } from "../utils/constants";
const CACHE_DURATION = 10 * 60 * 1000; 
const useAlerts = (location) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const getCacheKey = (location) => {
    if (typeof location === "string") {
      return `alerts_${location}`;
    } else if (location && location.lat && location.lon) {
      return `alerts_${location.lat}_${location.lon}`;
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
      setAlerts([]);
      setError("");
      return;
    }
    if (!API_KEY) {
      setError("API key not configured");
      return;
    }
    const cacheKey = getCacheKey(location);
    if (!cacheKey) {
      setError("Invalid location format");
      return;
    }
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      setAlerts(cachedData);
    }
    const fetchAlerts = async () => {
      setLoading(true);
      setError("");
      try {
        let params = {
          appid: API_KEY,
          exclude: "current,minutely,hourly,daily", 
        };
        if (typeof location === "string") {
          const geoResponse = await axios.get(
            `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_KEY}`,
          );
          if (geoResponse.data.length === 0) {
            throw new Error("Location not found");
          }
          params.lat = geoResponse.data[0].lat;
          params.lon = geoResponse.data[0].lon;
        } else if (location.lat && location.lon) {
          params.lat = location.lat;
          params.lon = location.lon;
        } else {
          throw new Error("Invalid location format");
        }
        const response = await axios.get(`${ONECALL_BASE_URL}`, { params });
        const newAlerts = response.data.alerts || [];
        setAlerts(newAlerts);
        setCachedData(cacheKey, newAlerts);
      } catch (err) {
        setError("Failed to fetch weather alerts.");
        console.error("Alerts fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [location]);
  return { alerts, loading, error };
};
export default useAlerts;
