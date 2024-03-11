const puppeteer = require("puppeteer");
const EventEmitter = require("events").EventEmitter;

class GameController {
  constructor(buttonsMapping) {
    this._SIGNAL_POLL_INTERVAL_MS = 50; // ~64 ticks per second
    this._THUMBSTICK_NOISE_THRESHOLD = 0.15;

    this._controllerEvent = new EventEmitter();
    this._buttons = buttonsMapping;
  }

  _on(event, callback) {
    this._controllerEvent.on(event, callback);
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

    await page.exposeFunction("sendEventToProcessHandle", (event, ...args) => {
      this._controllerEvent.emit(event, ...args);
    });

    await page.evaluate(
      ([buttons, SIGNAL_POLL_INTERVAL_MS, THUMBSTICK_NOISE_THRESHOLD]) => {
        const controllersIntervals = [];

        window.addEventListener("gamepadconnected", (e) => {
          window.sendEventToProcessHandle("gamepadconnected", e);

          controllersIntervals[e.gamepad.index] = setInterval(() => {
            const gamepad = navigator.getGamepads()[e.gamepad.index];

            // Dispatch events for pressed buttons
            for (let i = 0; i < gamepad.buttons.length; i++) {
              if (gamepad.buttons[i].pressed == true) {
                console.log(gamepad.buttons[i], buttons[i]);
                window.sendEventToProcessHandle(
                  "buttonPressed",
                  buttons[i],
                  gamepad.buttons[i].value
                );
              }
            }

            if (
              Math.abs(gamepad.axes[0]) + Math.abs(gamepad.axes[1]) >
              THUMBSTICK_NOISE_THRESHOLD
            ) {
              window.sendEventToProcessHandle(
                "thumbstickLeftMoved",
                gamepad.axes[0],
                gamepad.axes[1]
              );
            }

            if (
              Math.abs(gamepad.axes[2]) + Math.abs(gamepad.axes[3]) >
              THUMBSTICK_NOISE_THRESHOLD
            ) {
              window.sendEventToProcessHandle(
                "thumbstickRightMoved",
                gamepad.axes[2],
                gamepad.axes[3]
              );
            }
          }, SIGNAL_POLL_INTERVAL_MS);
        });
      },
      [
        this._buttons,
        this._SIGNAL_POLL_INTERVAL_MS,
        this._THUMBSTICK_NOISE_THRESHOLD,
      ]
    );
  }

  handleGamepadConnected(callback) {
    this._on("gamepadconnected", (event) => callback(event));
  }

  handleButtonPressed(callback) {
    this._on("buttonPressed", (button, value) => callback(button, value));
  }

  handleThumbstickLeftMoved(callback) {
    this._on("thumbstickLeftMoved", (xAxis, yAxis) => callback(xAxis, yAxis));
  }

  handleThumbstickRightMoved(callback) {
    this._on("thumbstickRightMoved", (xAxis, yAxis) => callback(xAxis, yAxis));
  }
}

module.exports = GameController;
