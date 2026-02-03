import { motion } from "framer-motion";
const Loading = () => {
  return (
    <motion.div
      className="flex flex-col justify-center items-center py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center space-x-4">
        <motion.svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="#FFD700"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </motion.svg>
        <motion.div
          className="rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.p
        className="text-gray-600 mt-4 text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Fetching weather data...
      </motion.p>
    </motion.div>
  );
};
export default Loading;
