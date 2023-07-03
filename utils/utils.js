function getDistanceTo(bot, entity, round = true) {
  let distance = bot.entity.position.distanceTo(entity.position);

  if (round) {
    distance = Math.round(distance);
  }

  return distance;
}

function isHoldItem(bot, item) {
  return (bot.heldItem && bot.heldItem.name === item) 
}


function getBlocksAround(bot,entity,radius=1) {
  const position = entity.position
  const neighbors = [
    position.offset(0,0,radius),
    position.offset(0,0,-radius),
    position.offset(radius,0,0),
    position.offset(-radius,0,0),
  ]

  let blocks = [];
  for (const pos of neighbors) {
    const blockAt = bot.blockAt(pos);

    if (!blockAt) continue;

    blocks.push(blockAt);
  }

  return blocks
}

module.exports = {
  getDistanceTo,
  isHoldItem,
  getBlocksAround
}