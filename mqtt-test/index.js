const mqtt = require("mqtt");

let count = 0;

const client = mqtt.connect("mqtt://localhost", {
  username: "nwtpi",
  password: "mosquitto123",
});

client.on("connect", () => {
  console.log("client connected");

  setInterval(() => {
    client.publish(
      "nodeTestTopic",
      `[${new Date().toLocaleString("es-ES")}] ${++count}`
    );
  }, 5000);
});

client.on('error', (error) => {
  console.error('Error en la conexión:', error)
})

console.log("started");
