const requireDir = require("require-dir");

// Reads all files in the /routes folder except index.js
// Then starts all of the routes using the app
module.exports = function(app) {
  const allRoutes = requireDir("./");
  try {
    Object.keys(allRoutes).forEach(routeName => {
      allRoutes[routeName](app);
    });
  } catch (err) {
    console.log(err);
  }
};
