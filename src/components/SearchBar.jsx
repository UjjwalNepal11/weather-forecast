import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import useDebounce from "../hooks/useDebounce";
import { API_KEY } from "../utils/constants";
import countryCodeToFlag from "../utils/countryFlags";

const popularCities = [
  "New York, US",
  "London, GB",
  "Tokyo, JP",
  "Paris, FR",
  "Sydney, AU",
];

const SearchBar = ({
  city,
  onSearch,
  onCurrentLocation,
  recentCities,
  setRecentCities,
}) => {
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  const filteredCities = useMemo(() => {
    if (!query.trim()) return recentCities;
    return recentCities.filter((city) =>
      city.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, recentCities]);

  const allSuggestions = useMemo(() => {
    const combined = [...suggestions];
    filteredCities.forEach((city) => {
      if (!combined.includes(city)) combined.push(city);
    });
    return combined;
  }, [suggestions, filteredCities]);

  useEffect(() => {
    setQuery(city);
  }, [city]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length > 0) {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/geo/1.0/direct?q=${debouncedQuery}&limit=5&appid=${API_KEY}`,
          );
          const cities = response.data.map(
            (city) =>
              `${city.name}${city.state ? ", " + city.state : ""}, ${city.country}`,
          );
          setSuggestions(cities);
        } catch (error) {
          console.error("Error fetching city suggestions:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery, API_KEY]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${query.trim()}&limit=1&appid=${API_KEY}`,
        );
        if (response.data.length > 0) {
          const cityData = response.data[0];
          const formattedCity = `${cityData.name}, ${cityData.country}`;
          onSearch(formattedCity);
        } else {
          onSearch(query.trim());
        }
      } catch (error) {
        console.error("Error resolving city:", error);
        onSearch(query.trim());
      }
      setIsDropdownOpen(false);
      inputRef.current.blur();
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setIsDropdownOpen(true);
  };

  const handleCitySelect = (city) => {
    setQuery(city);
    onSearch(city);
    setIsDropdownOpen(false);
    setIsFocused(false);
    inputRef.current.blur();
  };

  const handleRemoveCity = (city) => {
    setRecentCities((prev) => prev.filter((c) => c !== city));
  };

  const handleClear = () => {
    setQuery("");
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        if (isDropdownOpen && allSuggestions.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allSuggestions.length - 1 ? prev + 1 : 0,
          );
        }
        break;
      case "ArrowUp":
        if (isDropdownOpen && allSuggestions.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : allSuggestions.length - 1,
          );
        }
        break;
      case "Enter":
        if (
          isDropdownOpen &&
          selectedIndex >= 0 &&
          selectedIndex < allSuggestions.length
        ) {
          e.preventDefault();
          handleCitySelect(allSuggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        setIsFocused(false);
        inputRef.current.blur();
        break;
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
      setIsFocused(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setIsDropdownOpen(false);
      setIsFocused(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      {!isFocused && !query && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2 px-1">Popular Cities</p>
          <div className="flex flex-wrap gap-2">
            {popularCities.map((popularCity) => (
              <motion.button
                key={popularCity}
                onClick={() => handleCitySelect(popularCity)}
                className="px-3 py-1.5 bg-gray-200/80 hover:bg-gray-300 text-gray-800 text-sm rounded-full border border-gray-300 transition-colors flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className={`fi ${countryCodeToFlag(popularCity.split(", ").pop())}`}
                ></span>
                {popularCity.split(", ")[0]}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <motion.div
          className={`flex border-2 rounded-xl overflow-hidden transition-all duration-300 ${
            isFocused
              ? "border-blue-400 shadow-lg shadow-blue-500/20"
              : "border-white/30 hover:border-white/50"
          }`}
          animate={{ scale: isFocused ? 1.01 : 1 }}
        >
          <div className="relative flex-grow">
            <svg
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                isFocused ? "text-blue-500" : "text-gray-500"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Search for a city..."
              aria-label="Search for city"
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
              aria-activedescendant={
                selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
              }
              className="w-full px-10 py-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none border border-gray-300 rounded-lg"
            />
            {query.trim().length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search input"
                className="absolute inset-y-0 right-2 flex items-center justify-center w-8 hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg
                  className="w-4 h-4 text-gray-500"
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
            )}
          </div>
          <motion.button
            type="submit"
            aria-label="Search for weather"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 font-medium transition-colors rounded-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Search
          </motion.button>
        </motion.div>
      </form>

      <AnimatePresence>
        {isDropdownOpen && allSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            role="listbox"
            aria-label="City suggestions"
            className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl z-20 max-h-72 overflow-y-auto mt-2 border border-white/20"
          >
            {filteredCities.length > 0 && query.trim() === "" && (
              <div className="px-4 py-2 bg-gray-50/50">
                <p className="text-xs text-gray-500 font-medium">
                  Recent Searches
                </p>
              </div>
            )}
            {allSuggestions.map((city, index) => {
              const isRecent = recentCities.includes(city);
              return (
                <motion.div
                  key={index}
                  role="option"
                  aria-selected="false"
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                    selectedIndex === index ? "bg-blue-50" : "hover:bg-gray-50"
                  } ${index === 0 && filteredCities.length > 0 ? "border-t border-gray-100" : ""}`}
                  onClick={() => handleCitySelect(city)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className="flex items-center flex-grow">
                    {isRecent ? (
                      <svg
                        className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                    <span
                      className={`fi ${countryCodeToFlag(city.split(", ").pop())} mr-2 flex-shrink-0`}
                    ></span>
                    <span className="text-gray-700 truncate">{city}</span>
                  </div>
                  {isRecent && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCity(city);
                      }}
                      aria-label={`Remove ${city} from recent cities`}
                      className="ml-2 p-1.5 hover:bg-gray-200 rounded-full flex-shrink-0 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg
                        className="w-4 h-4 text-gray-400"
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
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
