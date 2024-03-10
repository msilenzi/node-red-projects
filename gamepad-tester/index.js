let controllerIndex = null;

window.addEventListener("gamepadconnected", ({ gamepad }) => {
  controllerIndex = gamepad.index;
  console.info(`${gamepad.id} connected at index ${gamepad.index}`);
});

window.addEventListener("gamepaddisconnected", ({ gamepad }) => {
  controllerIndex = null;
  console.info(`${gamepad.id} disconnected from index ${gamepad.index}`);
});

function handleButtons(buttons) {
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const buttonElement = document.getElementById(`controller-b${i}`);

    if (buttonElement) {
      if (button.value > 0) {
        buttonElement.classList.add("selected-button");
        buttonElement.style.filter = `contrast(${button.value * 150}%)`;
      } else {
        buttonElement.classList.remove("selected-button");
        buttonElement.style.filter = "contrast(100%)";
      }
    }
  }
}

function updateStick(elementId, xAxis, yAxis) {
  const multiplier = 25;
  const stickX = xAxis * multiplier;
  const stickY = yAxis * multiplier;

  const stick = document.getElementById(elementId);
  const originalX = parseInt(stick.dataset.originalXPosition, 10);
  const originalY = parseInt(stick.dataset.originalYPosition, 10);

  stick.setAttribute("cx", originalX + stickX);
  stick.setAttribute("cy", originalY + stickY);
}

function handleSticks(axes) {
  updateStick("controller-b10", axes[0], axes[1]);
  updateStick("controller-b11", axes[2], axes[3]);
}

function gameLoop() {
  if (controllerIndex != null) {
    const gamepad = navigator.getGamepads()[0];
    handleButtons(gamepad.buttons);
    handleSticks(gamepad.axes);
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
