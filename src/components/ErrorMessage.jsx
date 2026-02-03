import React from 'react'
import { motion } from 'framer-motion'
const ErrorMessage = ({ message }) => {
  return (
    <motion.div
      className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <p className="font-semibold">Error:</p>
      <p>{message}</p>
    </motion.div>
  )
}
export default ErrorMessage
