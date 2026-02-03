import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import WeatherIcon from './WeatherIcon'
const Forecast = ({ forecast, unit }) => {
  const { t } = useTranslation()
  if (!forecast || !forecast.list) return null
  const dailyForecast = forecast.list.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {})
  const chartData = forecast.list.slice(0, 40).map(item => ({
    time: new Date(item.dt * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      hour12: true
    }),
    temperature: Math.round(item.main.temp),
    fullDate: new Date(item.dt * 1000)
  }))
  const getTemp = (temp) => {
    const tempUnit = unit === 'metric' ? '°C' : '°F'
    return `${Math.round(temp)}${tempUnit}`
  }
  return (
    <motion.div
      className="mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">5-Day Forecast</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.keys(dailyForecast).slice(0, 5).map((date, index) => {
          const dayData = dailyForecast[date][0] // Take the first entry for each day
          return (
            <div key={index} className="bg-gray-100 rounded-lg p-4 text-center">
              <h3 className="font-semibold text-gray-700 mb-2">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
              </h3>
              <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <WeatherIcon
                  iconCode={dayData.weather[0].icon}
                  size={64}
                  description={dayData.weather[0].description}
                />
              </div>
              <p className="text-sm text-gray-600 mb-1">{dayData.weather[0].description}</p>
              <p className="text-lg font-bold text-gray-800">
                {getTemp(dayData.main.temp_max)} / {getTemp(dayData.main.temp_min)}
              </p>
            </div>
          )
        })}
      </div>
      <div className="bg-weather-custom rounded-lg p-4 mt-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Temperature Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ value: `Temperature (${unit === 'metric' ? '°C' : '°F'})`, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value) => [`${value}${unit === 'metric' ? '°C' : '°F'}`, 'Temperature']}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
export default Forecast
