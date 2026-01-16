module.exports = {
  apps: [
    {
      name: 'palm-payment-backend',
      script: './dist/index.js',  // Updated to match your build output

      // Configuration for high availability and performance
      instances: 'max',       // Run as many instances as CPU cores
      exec_mode: 'cluster',   // Enable cluster mode (automatic load balancing)
      autorestart: true,      // Automatically restart on crash
      max_memory_restart: '1G', // Restart if the process exceeds 1GB of memory

      // Environment variables for production
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Add your environment variables here
        // DATABASE_URL, JWT_SECRET, PHAJAY_SECRET_KEY, APP_URL
      },
    },
  ],
};