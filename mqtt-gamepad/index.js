const GameController = require("./GameController");
const xboxButtonsMapping = require("./buttons-mapping/xbox.json");

(async () => {
  console.log("Starting");
  const gameController = new GameController(xboxButtonsMapping);

  await gameController.start();

  gameController.handleGamepadConnected((e) =>
    console.log("gamepad connected", e)
  );

  gameController.handleButtonPressed((button, value) =>
    console.log({ button, value })
  );

  gameController.handleThumbstickLeftMoved((x, y) => {
    console.log('left', {x, y})
  })

  gameController.handleThumbstickRightMoved((x, y) => {
    console.log('right', {x, y})
  })

  console.log("end");
})();
