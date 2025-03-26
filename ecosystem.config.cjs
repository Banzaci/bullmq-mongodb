module.exports = {
  apps: [
    {
      name: "workers",
      script: "workers.js", // Change to your main file
      instances: "max", // Runs as many instances as CPU cores
      exec_mode: "cluster", // Enables clustering
      watch: true,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};


// const config = {
//   apps: [
//     {
//       name: "my-app",
//       script: "workers.js",
//       instances: "max",
//       exec_mode: "cluster",
//       watch: true,
//       env: {
//         NODE_ENV: "development",
//       },
//       env_production: {
//         NODE_ENV: "production",
//       },
//     },
//   ],
// };

// export default config;
