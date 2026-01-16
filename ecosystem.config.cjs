module.exports = {
  apps: [{
    name: "palm-backend",
    script: "./src/index.ts", // Run the source directly
    interpreter: "bun",       // Use Bun
    instances: 1,
    exec_mode: "fork"
  }]
}