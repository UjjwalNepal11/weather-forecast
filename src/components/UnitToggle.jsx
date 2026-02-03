import { motion } from "framer-motion";
const UnitToggle = ({ unit, setUnit, onCurrentLocation }) => {
  return (
    <div className="flex justify-end items-center mb-4">
      <motion.button
        onClick={onCurrentLocation}
        aria-label="Get current location"
        className="mr-4 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors min-h-[44px]"
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
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </motion.button>
      <div className="flex bg-gray-200 rounded-lg p-1">
        <motion.button
          onClick={() => setUnit("metric")}
          aria-pressed={unit === "metric"}
          aria-label="Switch to Celsius"
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            unit === "metric"
              ? "bg-white text-gray-800 shadow"
              : "text-gray-600 hover:text-gray-800"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          °C
        </motion.button>
        <motion.button
          onClick={() => setUnit("imperial")}
          aria-pressed={unit === "imperial"}
          aria-label="Switch to Fahrenheit"
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            unit === "imperial"
              ? "bg-white text-gray-800 shadow"
              : "text-gray-600 hover:text-gray-800"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          °F
        </motion.button>
      </div>
    </div>
  );
};
export default UnitToggle;
