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
      {/* Animated Weather Icons */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#FFD700">
            <title>Sun</title>
            <circle cx="12" cy="12" r="5" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg
            className="w-8 h-8 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16H11z" />
          </svg>
        </motion.div>
      </div>

      {/* Skeleton Cards */}
      <div className="w-full max-w-4xl space-y-4">
        {/* Main Weather Card Skeleton */}
        <motion.div
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-6"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <motion.div
                className="h-8 w-48 bg-white/30 rounded-lg mb-2"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="h-4 w-32 bg-white/20 rounded"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <motion.div
              className="w-20 h-20 bg-white/30 rounded-full"
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>

          <div className="mb-6">
            <motion.div
              className="h-16 w-32 bg-white/30 rounded-lg mb-2"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="h-5 w-40 bg-white/20 rounded"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>

          {/* Hourly Forecast Skeleton */}
          <div className="mb-6">
            <motion.div
              className="h-4 w-24 bg-white/20 rounded mb-3"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div className="flex gap-2 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-shrink-0 bg-white/20 rounded-xl p-3 min-w-[70px]"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                >
                  <div className="h-3 w-10 bg-white/30 rounded mb-2" />
                  <div className="h-8 w-8 bg-white/30 rounded-full mx-auto mb-2" />
                  <div className="h-4 w-8 bg-white/30 rounded mx-auto" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Metrics Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-white/20 rounded-xl p-3"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              >
                <div className="h-2 w-16 bg-white/30 rounded mb-2" />
                <div className="h-5 w-12 bg-white/40 rounded" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Forecast Skeleton */}
        <motion.div
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-6"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        >
          <motion.div
            className="h-6 w-32 bg-white/30 rounded mb-4"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-white/20 rounded-2xl p-4 text-center"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              >
                <div className="h-4 w-12 bg-white/30 rounded mx-auto mb-2" />
                <div className="h-12 w-12 bg-white/30 rounded-full mx-auto mb-2" />
                <div className="h-3 w-16 bg-white/30 rounded mx-auto" />
              </motion.div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <motion.div
            className="h-48 bg-white/10 rounded-xl"
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>

        {/* Map Skeleton */}
        <motion.div
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-6"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        >
          <motion.div
            className="h-6 w-32 bg-white/30 rounded mb-4"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="h-64 bg-white/10 rounded-xl"
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </div>

      <motion.p
        className="text-white/70 mt-6 text-sm font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Fetching weather data...
      </motion.p>
    </motion.div>
  );
};

export default Loading;
