const Gamepad = require('./Gamepad')
const autitoButtonsMapping = require('./buttons-mapping/autito.json')

const URL = 'http://192.168.1.109:1880'

;(async () => {
  const gameController = new Gamepad(autitoButtonsMapping)
  await gameController.start()

  gameController.handleGamepadUpdated(async ({buttonsDifference}) => {
    Object.entries(buttonsDifference).forEach(([key, value]) => {
      if (value === 0) {
        fetch(`${URL}/parar`)
        console.log('parar')
      } else {
        fetch(`${URL}/${key}`)
        console.log(key)
      }
    })
  })
})()
