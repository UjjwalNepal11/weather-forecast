import React from "react";
import { motion } from "framer-motion";
const WeatherIcon = ({ iconCode, size = 64, description = "" }) => {
  let color = "#000000";
  if (iconCode.startsWith("01d")) color = "#FFD700";
  else if (["02d", "03d", "04d", "02n", "03n", "04n"].includes(iconCode))
    color = "#808080";
  else if (iconCode.startsWith("01n")) color = "#0000FF";
  else if (iconCode.startsWith("09") || iconCode.startsWith("10"))
    color = "#0000FF";
  else if (iconCode.startsWith("11")) color = "#800080";
  else if (iconCode.startsWith("13")) color = "#FFFFFF";
  else if (iconCode.startsWith("50")) color = "#C0C0C0";
  const getIconSvg = () => {
    const baseCloud = (
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    );
    switch (iconCode.slice(0, 2)) {
      case "01":
        if (iconCode[2] === "d") {
          return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
              <title>{description}</title>
              <circle cx="12" cy="12" r="5" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          );
        } else {
          return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
              <title>{description}</title>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          );
        }
      case "02":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <title>{description}</title>
            <g transform="scale(0.6) translate(6,6)">{baseCloud}</g>
          </svg>
        );
      case "03":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <title>{description}</title>
            {baseCloud}
          </svg>
        );
      case "04":
        if (description && description.toLowerCase().includes("overcast")) {
          return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
              <title>{description}</title>
              <ellipse cx="12" cy="14" rx="8" ry="4" />
              <ellipse cx="8" cy="12" rx="6" ry="3" />
              <ellipse cx="16" cy="12" rx="6" ry="3" />
            </svg>
          );
        } else {
          return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
              <title>{description}</title>
              {baseCloud}
              <g transform="translate(6,6) scale(0.8)">{baseCloud}</g>
            </svg>
          );
        }
      case "09":
      case "10":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <title>{description}</title>
            {baseCloud}
            <path d="M12 22v-6M9 22v-6M15 22v-6" />
          </svg>
        );
      case "11":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <title>{description}</title>
            {baseCloud}
            <path d="M13 16l-4 6h3l-1-6z" />
          </svg>
        );
      case "13":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <title>{description}</title>
            {baseCloud}
            <circle cx="8" cy="16" r="1" />
            <circle cx="12" cy="16" r="1" />
            <circle cx="16" cy="16" r="1" />
          </svg>
        );
      case "50":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <title>{description}</title>
            {baseCloud}
          </svg>
        );
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <title>{description}</title>
            {baseCloud}
          </svg>
        );
    }
  };
  return (
    <motion.div
      key={iconCode}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      role="img"
      aria-label={description || "Weather icon"}
    >
      {getIconSvg()}
    </motion.div>
  );
};
export default WeatherIcon;
