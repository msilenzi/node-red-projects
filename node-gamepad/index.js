const GameController = require("./GameController");

(async () => {
  const gameController = new GameController();
  await gameController.init();
  gameController.on("button", (btn) => console.log(`Button: ${btn} pressed`));
  gameController.on("thumbsticks", (val) => console.log(val));
})();
