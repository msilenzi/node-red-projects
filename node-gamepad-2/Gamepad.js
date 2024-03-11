const puppeteer = require("puppeteer");
const EventEmitter = require("events").EventEmitter;

class Gamepad {
  constructor(buttonsMapping) {
    this._POLL_INTERVAL_MS = 50;
    this._NOISE_THRESHOLD = 0.15;

    this._status = {
      buttons: Object.values(buttonsMapping).reduce(
        (obj, key) => ({ ...obj, [key]: 0 }),
        {}
      ),
      thumbsticks: {
        left: { x: 0, y: 0 },
        right: { x: 0, y: 0 },
      },
    };

    this._controllerEvent = new EventEmitter();
    this._buttons = buttonsMapping;
  }

  _buttonsHaveBeenUpdated(newButtonsStatus) {
    return JSON.stringify(this._status.buttons) !== JSON.stringify(newButtonsStatus)
  }

  _isThumbstickOverNoiseThreshold({ x, y }) {
    return Math.abs(x) + Math.abs(y) > this._NOISE_THRESHOLD;
  }

  _thumbstickHaveBeenUpdated(thumbstick, newThumbstickStatus) {
    return (
      JSON.stringify(this._status.thumbsticks[thumbstick]) !== JSON.stringify(newThumbstickStatus[thumbstick]) &&
      this._isThumbstickOverNoiseThreshold(newThumbstickStatus)
    )
  }

  async start() {
    const browser = await puppeteer.launch();
    // Debug:
    // const browser = await puppeteer.launch({
    //   headless: false, // Para mostrar el navegador
    //   devtools: true, // Para abrir las herramientas de desarrollo automáticamente
    //   args: ["--enable-logging=stderr"], // Habilita el registro de errores en la consola de Node.js
    // });
    const page = await browser.newPage();

    await page.exposeFunction("sendEvent", (event, ...args) => {
      this._controllerEvent.emit(event, ...args);
    });

    await page.exposeFunction("updateControllerStatus", (newStatus) => {
      if(
        this._buttonsHaveBeenUpdated(newStatus.buttons) ||
        this._thumbstickHaveBeenUpdated('left', newStatus.thumbsticks.left) ||
        this._thumbstickHaveBeenUpdated('right', newStatus.thumbsticks.right)
      ) {
        this._status = newStatus;
        this._controllerEvent.emit('gamepadupdated', newStatus)
      }
    });

    await page.evaluate(
      ([POLL_INTERVAL_MS, buttons]) => {
        const controllersIntervals = [];

        window.addEventListener("gamepadconnected", (e) => {
          window.sendEvent("gamepadconnected");

          controllersIntervals[e.gamepad.index] = setInterval(() => {
            const gamepad = navigator.getGamepads()[e.gamepad.index];

            const newStatus = {
              buttons: gamepad.buttons.reduce((obj, { value }, index) => {
                obj[buttons[index]] = value;
                return obj;
              }, {}),
              thumbsticks: {
                left: { x: gamepad.axes[0], y: gamepad.axes[1] },
                right: { x: gamepad.axes[2], y: gamepad.axes[3] },
              },
            };

            window.updateControllerStatus(newStatus);
          }, POLL_INTERVAL_MS);
        });

        window.addEventListener("gamepaddisconnected", () => {});
      },
      [this._POLL_INTERVAL_MS, this._buttons]
    );
  }

  //
  // Handlers

  handleGamepadConnected(callback) {
    this._controllerEvent.on("gamepadconnected", (event) => callback(event));
  }

  handleGamepadUpdated(callback) {
    this._controllerEvent.on("gamepadupdated", (status) => callback(status));
  }
}

module.exports = Gamepad;
