const SPRITE_NUM_FRAMES = 4;
const SPRITE_W = 24;
const SPRITE_H = 24;
const SPRITE_SPEED_PX = 2;

const JUMP_SPRITE_W = 32;

const BG_W = 48;
const BG_H = 48;

const CANVAS_W = 192;
const CANVAS_H = 108;

const ZOOM = 5;

const GROUND = 48;

const canvasEl = document.getElementById("canvas");
canvasEl.width = CANVAS_W;
canvasEl.height = CANVAS_H;
canvasEl.style.width = CANVAS_W * ZOOM + "px";

const ctx = canvasEl.getContext("2d");

ctx.strokeStyle = "black";

const catSpriteImageEl = new Image();
catSpriteImageEl.src =
  "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fcat-sprite.png?v=1577014873971";
const backgroundImageEl = new Image();
backgroundImageEl.src =
  "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fbackground.png?v=1577014872624";
const horizonImageEl = new Image();
horizonImageEl.src =
  "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fhorizon.png?v=1577014866007";
const beeImageEl = new Image();
beeImageEl.src =
  "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fbee.png?v=1577014863052";

function draw(imageEl, sx, sy, sw, sh, dx, dy) {
  ctx.drawImage(imageEl, sx, sy, sw, sh, dx, dy, sw, sh);
}

function drawRect(dx, dy, dw, dh) {
  ctx.strokeRect(dx, dy, dw, dh);
}

function isInBox(box, pt) {
  return (
    pt.x >= box.left &&
    pt.x <= box.right &&
    pt.y >= box.bottom &&
    pt.y <= box.top
  );
}

let state = {};

function resetState() {
  state = {
    frameNum: 0,
    jumpRequested: false,
    catVelocityDown: 0,
    catDiedAtFrameNum: undefined,
    catWorldX: 0,
    catHeight: 0,
    jumpFrameNum: undefined,
    bees: []
  };
}

resetState();

function getCatHitBox() {
  return {
    left: state.catWorldX + 5,
    right: state.catWorldX + 20,
    top: state.catHeight + 20,
    bottom: state.catHeight + 10
  };
}

function drawState() {
  
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // Horizon, doesn't move
  for (let i = 0; i < 5; i++) {
    draw(horizonImageEl, 0, 0, 48, 48, 48 * i, 0);
  }
  
  const worldXToScreenX = worldX => (worldX - state.catWorldX) + 20;
  

  // Draw ground, scrolls with cat
  const bgScreenX = -(state.catWorldX % BG_W);
  for (let i = 0; i < 5; i++) {
    draw(
      backgroundImageEl,
      0,
      0,
      BG_W,
      BG_H,
      bgScreenX + BG_W * i,
      GROUND - 12
    );
  }

  // Draw cat
  if (state.catHeight != 0) {
    draw(
      catSpriteImageEl,
      SPRITE_W * 4,
      0,
      JUMP_SPRITE_W,
      SPRITE_H,
      worldXToScreenX(state.catWorldX),
      GROUND - state.catHeight
    );
  } else {
    draw(
      catSpriteImageEl,
      SPRITE_W * (state.frameNum % SPRITE_NUM_FRAMES),
      0,
      SPRITE_W,
      SPRITE_H,
      worldXToScreenX(state.catWorldX) + 4,
      GROUND - state.catHeight
    );
  }

  // Draw bees
  for (let bee of state.bees) {
    draw(
      beeImageEl,
      0,
      0,
      11,
      10,
      20 + (bee.worldX - state.catWorldX),
      GROUND - bee.height
    );
  }
  
  // Draw hit boxes (DEBUG)
  const catHitBox = getCatHitBox();
  drawRect();
}

function doCatDeadCalcs() {
  resetState();
}

function doCatLivingCalcs() {
  state.catWorldX += SPRITE_SPEED_PX;

  // Change velocity
  if (state.jumpRequested && state.catHeight === 0) {
    state.catVelocityDown = -5;
    state.jumpRequested = false;
    state.jumpFrameNum = state.frameNum;
  }
  if ((state.frameNum - state.jumpFrameNum) % 4 === 0) {
    state.catVelocityDown += 1; // gravity
  }

  // Change cat position
  state.catHeight -= state.catVelocityDown;
  if (state.catHeight <= 0) {
    state.catHeight = 0;
    state.catVelocityDown = 0;
  }

  // Change bee positions
  for (let bee of state.bees) {
    bee.height += Math.round(Math.random() * 2 - 1);
  }

  // Introduce future bees (important: in order)
  if (Math.random() < 0.115) {
    state.bees.push({ worldX: state.catWorldX + 150, height: 4 });
  }

  // Remove past bees
  while (state.bees.length > 0 && state.bees[0].beeIndex < 0) {
    state.bees.shift();
  }

  // Kill cat
  let catHitBox = getCatHitBox();
  for (let bee of state.bees) {
    if (isInBox(catHitBox, { x: bee.worldX, y: bee.height })) {
      state.catDiedAtFrameNum = state.frameNum;
    }
  }
}

function doFrame() {
  state.frameNum++;

  if (state.catDiedAtFrameNum) {
    doCatDeadCalcs();
  } else {
    doCatLivingCalcs();
  }
  drawState();
}

// TODO wait for backgroundImageEl
catSpriteImageEl.addEventListener("load", () => {
  function loop() {
    doFrame();
    window.setTimeout(() => window.requestAnimationFrame(loop), 60);
  }
  window.requestAnimationFrame(loop);
});

document.body.addEventListener("click", () => {
  state.jumpRequested = true;
});
