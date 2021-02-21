function makeBasicUser(options = {}) {
  return {
    username: "basic",
    nickname: "Basic User",
    about: "I am basic",
    password: "$2b$10$vU7FphtYgnIPG1BSggFzf.M9HqQMxeF1pNwjn0oOV8wyvzX8p4MVa",
    email: "basic@gmail.com",
    token: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJhc2ljIiwiZW1haWwiOiJiYXNpY0BnbWFpbC5jb20iLCJuaWNrbmFtZSI6IkJhc2ljIFVzZXIiLCJldGMiOiJ3dGY_IiwiaWF0IjoxNTkwODkyNzgwLCJhdWQiOiJodHRwczovL25lb2xvbC5jb20iLCJpc3MiOiJIdWdlQ2xvbmUiLCJzdWIiOiJiYXNpYyJ9.ESCsQLqjWhevMygRz4uvfATJjzcNZ3kQWQlFn1ekGwajYeteIjh2opb8nZEZyZFBqFLzKjKiARDKTQ1BQHebNQ",
    salt: "$2b$10$vU7FphtYgnIPG1BSggFzf.",
    public_comments: 1,
    public_upvotes: 1,
    public_downvotes: 1,
    show_mature: 1,
    bypass: process.env.DEBUG_KEY,
    ...options,
  };
};

function makeAnotherUser(options = {}) {
  return {
    username: "another",
    nickname: "Another Basic User",
    about: "I am another basic user",
    password: "$2b$10$zroeqQWMAhx43xXynfeySem/qm9NGeOvL4LYhV.uCYC0MUrsaQkWW",
    email: "another@gmail.com",
    token: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFub3RoZXIiLCJlbWFpbCI6ImFub3RoZXJAZ21haWwuY29tIiwibmlja25hbWUiOiJBbm90aGVyIEJhc2ljIFVzZXIiLCJldGMiOiJ3dGY_IiwiaWF0IjoxNTkwODkyODMyLCJhdWQiOiJodHRwczovL25lb2xvbC5jb20iLCJpc3MiOiJIdWdlQ2xvbmUiLCJzdWIiOiJhbm90aGVyIn0.BDvUDeYa_FMKViqM2fHwaUKxOYCAmBD-Soo95Ab-db2oZB4548DR9K8V4F00WDGxgu_E6FHT87yrlBFW5Yaxuw",
    salt: "$2b$10$zroeqQWMAhx43xXynfeySe",
    public_comments: 0,
    public_upvotes: 0,
    public_downvotes: 0,
    show_mature: 0,
    bypass: process.env.DEBUG_KEY,
    ...options,
  };
};

function makeModUser(options = {}) {
  return {
    username: "mod",
    nickname: "Mod User",
    about: "Mod",
    password: "$2b$10$/2G66ymfWy0QGkua1m77Iu/sS5UfWBznlSD8lzwBb/gMRwS3UNL/.",
    email: "mod@gmail.com",
    token: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vZCIsImVtYWlsIjoibW9kQGdtYWlsLmNvbSIsIm5pY2tuYW1lIjoiTW9kIFVzZXIiLCJldGMiOiJ3dGY_IiwiaWF0IjoxNTkwODkyODY4LCJhdWQiOiJodHRwczovL25lb2xvbC5jb20iLCJpc3MiOiJIdWdlQ2xvbmUiLCJzdWIiOiJtb2QifQ.gSQE-UWAxDF1ktMvlHjfM30aOEeffsVWwcyGr20y_Il_FVJkL9xedZtc7jsN8tARCZO4f4pIMHAMulHVZGm47A",
    salt: "$2b$10$/2G66ymfWy0QGkua1m77Iu",
    public_comments: 1,
    public_upvotes: 1,
    public_downvotes: 0,
    show_mature: 1,
    bypass: process.env.DEBUG_KEY,
    ...options,
  };
};

function makeAdminUser(options = {}) {
  return {
    username: "admin",
    nickname: "Admin User",
    about: "Admin",
    password: "$2b$10$Q8mKiQX6aJWzmaVW8iLXWu5iejkvXoILFSyWki1LB37F3MGxiTmhi",
    email: "admin@gmail.com",
    token: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJuaWNrbmFtZSI6IkFkbWluIFVzZXIiLCJldGMiOiJ3dGY_IiwiaWF0IjoxNTkwODkyODkyLCJhdWQiOiJodHRwczovL25lb2xvbC5jb20iLCJpc3MiOiJIdWdlQ2xvbmUiLCJzdWIiOiJhZG1pbiJ9.B1WH8eTWBO2OWQ0YQS1aoLwt4y-Y4NH7LXASnqxWbOr4gUX7sjDQj_8NOU107f399TK_mYagXv9Rzvv48-kkFw",
    salt: "$2b$10$Q8mKiQX6aJWzmaVW8iLXWu",
    public_comments: 1,
    public_upvotes: 0,
    public_downvotes: 0,
    show_mature: 1,
    bypass: process.env.DEBUG_KEY,
    ...options,
  };
};

exports.makeBasicUser = makeBasicUser;
exports.makeAnotherUser = makeAnotherUser;
exports.makeModUser = makeModUser;
exports.makeAdminUser = makeAdminUser;

exports.getAll = function() {
  return [
    makeBasicUser,
    makeAnotherUser,
    makeModUser,
    makeAdminUser,
  ];
};
