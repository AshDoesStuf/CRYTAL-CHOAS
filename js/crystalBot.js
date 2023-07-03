const { getDistanceTo, isHoldItem, getBlocksAround }  = require("../utils/utils.js");
const { Vec3 } = require("vec3");

class CrystalBot {
  constructor(bot) {
    this.bot = bot;
    this.target = null
    this.settings = {
      placeObi: true,    
      maxAttackDistance: 2.8,
      minAttackDistance: 0.2,
    }

    this.distanceToTarget = 0;
    this.attackCooldown = 0;

    this.obiAroundTarget = false;
    
  }

  async placeObsidianAt(position) {
       const target = this.target;
    const goodBlock = this.findGoodPlacement(target);

      if (!goodBlock) return;

      const obi = this.bot.inventory.items().find(item => item.name === "obsidian")

      if (!obi) return;

      const blockAround = getBlocksAround(this.bot, target, 1);
      this.obiAroundTarget = false;

      for (const block of blockAround) {
        if (block.name === "obsidian") {
          this.obiAroundTarget = true;
          break
        }
      }

      if (this.obiAroundTarget) return;

      

      if (!isHoldItem(this.bot, "obsidian")) {
        await this.bot.equip(obi, "hand");
      }

      if (isHoldItem(this.bot, obi.name)) {
        try {
          await this.bot.placeBlock(goodBlock, new Vec3(0,1,0))
        } catch(e) {
          console.log("man fuck i failed to place obi :(")
        }
      }
  }

  placeEndCrystal(position) {
    
  }
  
  //juicy code ahead
  async attack() {
    if (!this.target) return;

    const target = this.target;


    if (this.settings.placeObi) {
      await this.placeObsidianAt();
    }

    //just gotta test ig
  }

  setTarget(username) {
    const loadedPlayers = Object.values(this.bot.players)

    for (const player of loadedPlayers) {
      
      if (player.username !== username) continue;
      
      this.target = player.entity;
      break;
    }
    // where to out the cooldown thing
  }

  update() {
    if (this.target) {
      this.distanceToTarget = getDistanceTo(this.bot, this.target);
      this.attack();
    }
  }

  stop() {
    this.target = null;
    this.distanceToTarget = 0;
    this.obiAroundTarget = false;
  }

  findGoodPlacement(entity) {
    const entPos = entity.position;
    let goodBlockFRFR = null

    const neighbors = [
      entPos.offset(0,0,1),
      entPos.offset(0,0,-1),
      entPos.offset(1,0,0),
      entPos.offset(-1,0,0)
    ]

    for (const neighbor of neighbors) {
      const blockAt = this.bot.blockAt(neighbor);

      if (!blockAt) continue

      if (blockAt.name === "air" || blockAt.displayName === "Air" && blockAt.name !== "obsidian") {
        goodBlockFRFR = blockAt;
        break;
      }
    }

    return goodBlockFRFR
  }
}

module.exports = {
  CrystalBot
}