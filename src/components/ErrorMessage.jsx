import React from "react";
import { motion } from "framer-motion";

const ErrorMessage = ({ message }) => {
  return (
    <motion.div
      className="mt-4 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-white rounded-2xl"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
          >
            <svg
              className="h-6 w-6 text-red-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        </div>
        <div className="ml-3">
          <motion.p
            className="text-sm font-semibold text-red-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Oops! Something went wrong
          </motion.p>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.3 }}
          >
            <p className="mt-1 text-sm text-red-100">{message}</p>
          </motion.div>
          <motion.p
            className="mt-2 text-xs text-red-200/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Please try again or search for a different city.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorMessage;
