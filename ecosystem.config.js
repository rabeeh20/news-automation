// ─── PM2 Ecosystem Configuration ────────────────────
// Manages both the Next.js app and the cron worker.

module.exports = {
  apps: [
    {
      // ─── Next.js Production Server ──────────
      name: "prisom-web",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/home/ubuntu/news-automation",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Restart policies
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 5000,
      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/home/ubuntu/logs/prisom-web-error.log",
      out_file: "/home/ubuntu/logs/prisom-web-out.log",
      merge_logs: true,
      // Memory limit — restart if exceeds 512MB
      max_memory_restart: "512M",
    },
    {
      // ─── News Cron Worker ───────────────────
      name: "prisom-cron",
      script: "npx",
      args: "tsx src/workers/news-cron.ts",
      cwd: "/home/ubuntu/news-automation",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      env: {
        NODE_ENV: "production",
      },
      // Restart policies
      max_restarts: 10,
      min_uptime: "30s",
      restart_delay: 10000,
      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/home/ubuntu/logs/prisom-cron-error.log",
      out_file: "/home/ubuntu/logs/prisom-cron-out.log",
      merge_logs: true,
      // Memory limit
      max_memory_restart: "256M",
    },
  ],
};
