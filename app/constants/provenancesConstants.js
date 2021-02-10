const DEFAULT = {
  score: -10,
  time: "time_posted",
  order: [["time_posted", "DESC"], ["post_id", "DESC"]],
};

const FRONT = {
  name: "FRONT",
  score: 20,
  time: "time_front",
  order: [["time_front", "DESC"], ...DEFAULT.order],
};

const RISING = {
  name: "RISING",
  score: 10,
  time: "time_rising",
  order: [["time_rising", "DESC"], ...DEFAULT.order],
};

const FRESH = {
  name: "FRESH",
  score: DEFAULT.score,
  order: DEFAULT.order,
  time: DEFAULT.time,
};

module.exports = { FRONT, RISING, FRESH, DEFAULT };
