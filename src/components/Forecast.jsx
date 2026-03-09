import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import WeatherIcon from "./WeatherIcon";

const Forecast = ({ forecast, unit }) => {
  const { t } = useTranslation();

  if (!forecast || !forecast.list) return null;

  const dailyForecast = forecast.list.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  const chartData = forecast.list.slice(0, 40).map((item) => ({
    time: new Date(item.dt * 1000).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      hour12: true,
    }),
    temperature: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    pop: Math.round((item.pop || 0) * 100),
    fullDate: new Date(item.dt * 1000),
  }));

  const getTemp = (temp) => {
    const tempUnit = unit === "metric" ? "°C" : "°F";
    return `${Math.round(temp)}${tempUnit}`;
  };

  const getDayName = (date) => {
    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 86400000).toDateString();
    if (date === today) return "Today";
    if (date === tomorrow) return "Tomorrow";
    return new Date(date).toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <motion.div
      className="mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        5-Day Forecast
      </h2>

      {/* Daily Forecast Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
        {Object.keys(dailyForecast)
          .slice(0, 5)
          .map((date, index) => {
            const dayData = dailyForecast[date];
            const maxTemp = Math.max(...dayData.map((d) => d.main.temp_max));
            const minTemp = Math.min(...dayData.map((d) => d.main.temp_min));
            const avgPop = Math.round(
              (dayData.reduce((sum, d) => sum + (d.pop || 0), 0) /
                dayData.length) *
                100,
            );
            const middayData =
              dayData.find((d) => {
                const hour = new Date(d.dt * 1000).getHours();
                return hour >= 11 && hour <= 14;
              }) || dayData[0];

            return (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-4 text-center border border-gray-200 shadow-lg hover:bg-gray-50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                  {getDayName(date)}
                </h3>
                <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                  <WeatherIcon
                    iconCode={middayData.weather[0].icon}
                    size={56}
                    description={middayData.weather[0].description}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-2 capitalize">
                  {middayData.weather[0].description}
                </p>

                {/* Precipitation probability */}
                {avgPop > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center justify-center gap-1">
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                      </svg>
                      <span className="text-sm text-blue-600 font-medium">
                        {avgPop}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${avgPop}%` }}
                      />
                    </div>
                  </div>
                )}

                <p className="text-lg font-bold text-gray-800">
                  {getTemp(maxTemp)} / {getTemp(minTemp)}
                </p>
              </motion.div>
            );
          })}
      </div>

      {/* Temperature Trend Chart with Gradient */}
      <div className="bg-white rounded-2xl p-4 mt-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Temperature Trends
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient
                id="feelsLikeGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              interval="preserveStartEnd"
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              label={{
                value: `Temp (${unit === "metric" ? "°C" : "°F"})`,
                angle: -90,
                position: "insideLeft",
                fill: "#6b7280",
                fontSize: 10,
              }}
            />
            <Tooltip
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value, name) => [
                `${value}${unit === "metric" ? "°C" : "°F"}`,
                name === "temperature" ? " Temperature" : "Feels Like",
              ]}
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="feelsLike"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#feelsLikeGradient)"
              dot={false}
              name="feelsLike"
            />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#tempGradient)"
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
              activeDot={{
                r: 6,
                stroke: "#3b82f6",
                strokeWidth: 2,
                fill: "#fff",
              }}
              name="temperature"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Chart Legend */}
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600"> Temperature</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-600">Feels Like</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Forecast;

