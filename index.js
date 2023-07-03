const mineflayer = require('mineflayer');
const {CrystalBot} = require("./js/crystalBot.js")
const bot = mineflayer.createBot({
  host: "NubPlayzBoi.aternos.me",
  port: 26216,
  username: 'stopItGetHelp',
  version: "1.19.2",// 1.20 is buggy
})

bot.once("spawn", () => {
  bot.crystaler = new CrystalBot(bot);

  bot.on("chat", (username, message) => {
    if (username === bot.username) return;

    let args = message.split(" ");
    const command = args[0]
    const commandArgs = args.splice(1);

    console.log(`Command: ${command}, args: ${commandArgs}`)

    if (command === "attack") {
      const targetUsername = commandArgs[0] || username;

      if (targetUsername == bot.username) return;

      bot.crystaler.setTarget(targetUsername);
    }

    if (command === "stop") {
      bot.crystaler.stop()
    }
  })

  bot.on("physicsTick", () => {
    bot.crystaler.update();
  })
})