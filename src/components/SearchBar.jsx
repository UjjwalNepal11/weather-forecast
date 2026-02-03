import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import useDebounce from "../hooks/useDebounce";
import { API_KEY } from "../utils/constants";
import countryCodeToFlag from "../utils/countryFlags";
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
    setIsDropdownOpen(true);
  };
  const handleCitySelect = (city) => {
    setQuery(city);
    onSearch(city);
    setIsDropdownOpen(false);
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
        inputRef.current.blur();
        break;
    }
  };
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
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
    <form onSubmit={handleSubmit} className="mb-4 relative" ref={dropdownRef}>
      <div className="flex border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Enter city name..."
          aria-label="Search for city"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
          aria-activedescendant={
            selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
          }
          className="flex-grow px-4 py-2 rounded-l-lg focus:outline-none"
        />
        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search input"
            className="px-3 py-2 hover:bg-gray-100 focus:outline-none flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="https://www.w3.org/2000/svg"
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
        <motion.button
          type="submit"
          aria-label="Search for weather"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg focus:outline-none flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="https://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </motion.button>
      </div>
      {isDropdownOpen && allSuggestions.length > 0 && (
        <div
          role="listbox"
          aria-label="City suggestions"
          className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-10 max-h-60 overflow-y-auto"
        >
          {allSuggestions.map((city, index) => {
            const isRecent = recentCities.includes(city);
            return (
              <div
                key={index}
                role="option"
                aria-selected="false"
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
              >
                <div
                  onClick={() => handleCitySelect(city)}
                  className="flex items-center flex-grow"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="https://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span
                    className={`mr-2 fi ${countryCodeToFlag(city.split(", ").pop())}`}
                  ></span>
                  {city}
                </div>
                {isRecent && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCity(city);
                    }}
                    aria-label={`Remove ${city} from recent cities`}
                    className="ml-2 p-1 hover:bg-gray-200 rounded"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="https://www.w3.org/2000/svg"
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
              </div>
            );
          })}
        </div>
      )}
    </form>
  );
};
export default SearchBar;
