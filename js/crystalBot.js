const {
  getDistanceTo,
  isHoldItem,
  getBlocksAround,
} = require("../utils/utils.js");
const { Vec3 } = require("vec3");
const { goals } = require("mineflayer-pathfinder");

class CrystalBot {
  constructor(bot) {
    /**
     * @type {import("mineflayer").Bot}
     */
    this.bot = bot;
    this.target = null;
    this.settings = {
      placeObi: true,
      maxAttackDistance: 2.8,
      minAttackDistance: 0.2,
    };

    this.distanceToTarget = 0;
    this.attackCooldown = 0;

    this.obiAroundTarget = false;

    this.placingObi = false;
    this.placingCrystal = false;
    this.isPathfinding = false;
  }

  async placeObsidianAt(position) {
    const target = this.target;
    const goodBlock = this.findGoodPlacement(target);

    if (!goodBlock) return;

    const obi = this.bot.inventory
      .items()
      .find((item) => item.name === "obsidian");

    if (!obi) return;

    if (this.placingCrystal) return;

    if (this.placingObi) return;

    const blockAround = getBlocksAround(this.bot, target, 1);
    this.obiAroundTarget = false;

    for (const block of blockAround) {
      if (block.name === "obsidian") {
        this.obiAroundTarget = true;
        break;
      }
    }

    if (this.obiAroundTarget) return;

    if (!isHoldItem(this.bot, "obsidian")) {
      await this.bot.equip(obi, "hand");
    }

    if (
      isHoldItem(this.bot, obi.name) &&
      !this.obiAroundTarget &&
      !this.placingObi &&
      goodBlock.name !== "obsidian"
    ) {
      try {
        this.placingObi = true;
        await this.bot._genericPlace(goodBlock, new Vec3(0, 1, 0), {
          forceLook: true,
          offHand: false,
        });
        this.placingObi = false;
      } catch (e) {
        console.log("man fuck i failed to place obi :(");
        this.placingObi = false;
      }
    }
  }

  async placeEndCrystal() {
    if (this.settings.placeObi) {
      await this.placeObsidianAt();
    }

    let hotBlock = this.findGoodCrystalPlaceMent();

    if (!hotBlock) return;

    if (this.placingCrystal) return;

    const endCrystal = this.bot.inventory
      .items()
      .find((item) => item.name === "end_crystal");

    if (!endCrystal) return;

    if (!isHoldItem(this.bot, endCrystal.name)) {
      await this.bot.equip(endCrystal, "hand");
    }

    if (isHoldItem(this.bot, endCrystal.name)) {
      try {
        this.placingCrystal = true;
        await this.bot._genericPlace(hotBlock, new Vec3(0, 1, 0), {
          forceLook: true,
          offHand: false,
        });
        this.placingCrystal = false;
      } catch (e) {
        console.log("man fuck i failed to place crystal :(");
        this.placingCrystal = false;
      }
    }
  }

  findGoodCrystalPlaceMent() {
    let goodBlock = null;

    const block = this.bot.findBlock({
      matching: (block) => block.name === "obsidian",
      count: 1,
      maxDistance: 4,
      point: this.target.position,
    });

    if (!block) return null;

    const blockAbove = this.bot.blockAt(block.position.offset(0, 1, 0));
    if (blockAbove && blockAbove.name === "air") {
      goodBlock = block;
    }

    return goodBlock;
  }

  //juicy code ahead
  async attack() {
    if (!this.target) return;

    const target = this.target;
    if (this.distanceToTarget > 3 && !this.isPathfinding) {
      this.isPathfinding = true;
      const { x, y, z } = target.position;
      const goal = new goals.GoalNear(x, y, z, 2);

      await this.bot.pathfinder.goto(goal);
      this.isPathfinding = false;
    }

    const crystals = this.getAllCrystals();

    if (crystals.length > 0) {
      const closestCrystal = crystals.find((crystal) => {
        if (crystal.position.distanceTo(target.position) <= 3.0412) {
          return true;
        }
      });

      if (!closestCrystal) return;

      this.bot.attack(closestCrystal);
    }

    await this.placeEndCrystal();
  }

  getAllCrystals() {
    const crystals = Object.values(this.bot.entities).filter(
      (entity) => entity.name === "end_crystal"
    );

    if (crystals) {
      return crystals;
    }
  }

  setTarget(username) {
    const loadedPlayers = Object.values(this.bot.players);

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
      this.attack().catch(console.log);
    }
  }

  stop() {
    this.target = null;
    this.distanceToTarget = 0;
    this.obiAroundTarget = false;
  }

  findGoodPlacement(entity) {
    const entPos = entity.position;
    let goodBlockFRFR = null;

    const neighbors = [
      entPos.offset(0, 0, 1),
      entPos.offset(0, 0, -1),
      entPos.offset(1, 0, 0),
      entPos.offset(-1, 0, 0),
    ];

    for (const neighbor of neighbors) {
      const blockAt = this.bot.blockAt(neighbor);

      if (!blockAt) continue;

      const yDistance = Math.abs(
        Math.round(blockAt.position.y - this.bot.entity.position.y)
      );

      if (
        (blockAt.name === "air" || blockAt.displayName === "Air") &&
        blockAt.name !== "obsidian" &&
        blockAt.position.distanceTo(this.target.position) < 4 &&
        yDistance === 0
      ) {
        goodBlockFRFR = blockAt;
        break;
      }
    }

    return goodBlockFRFR;
  }
}

module.exports = {
  CrystalBot,
};
