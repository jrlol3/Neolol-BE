function getLoggingConfig(value) {
  if (!value)
    return null;
  if (value === "false")
    return false;
  if (value === "console.log")
    return console.log;
  throw new Error(`improper configuration for DB_LOGGING - there is no option ${value}`);
}


module.exports = {
  dialect: "mysql",
  host: process.env.DB_HOST || "localhost",
  username: process.env.DB_USER || "root",
  port: process.env.DB_PORT || "3306",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_DATABASE || "test",
  socketPath: process.env.DB_SOCKETPATH || "",
  logging: getLoggingConfig(process.env.DB_LOGGING) || false,
  use_env_variable: "DATABASE_URL",
  cdnPath: process.env.CDN_PATH || "/var/www/cdn.neolol.com",
  debugKey: process.env.DEBUG_KEY || null,
  define: {
    timestamps: false,
    underscored: true,
  },
};
