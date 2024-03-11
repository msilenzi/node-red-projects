const Gamepad = require("./Gamepad");
const xboxButtonsMapping = require("./buttons-mapping/xbox.json");

(async () => {
  console.log("Starting");
  const gameController = new Gamepad(xboxButtonsMapping);

  await gameController.start();

  gameController.handleGamepadConnected((e) =>
    console.log("gamepad connected", e)
  );

  gameController.handleGamepadUpdated((status) => {
    console.log('statussssssss', status)
  })

  console.log("end");
})();
