const SPRITE_NUM_FRAMES = 4;
const SPRITE_W = 24;
const SPRITE_H = 24;
const SPRITE_SPEED_PX = 2;

const JUMP_SPRITE_W = 32;

const BEE_SPRITE_H = 10;

const BG_W = 48;
const BG_H = 48;

const ASCII_W = 512;
const ASCII_H = 256;

const CANVAS_W = 192;
const CANVAS_H = 108;

const ZOOM = 5;

const GROUND = 72;

const DRAW_HIT_BOXES = false;

const canvasEl = document.getElementById("canvas");
canvasEl.width = CANVAS_W;
canvasEl.height = CANVAS_H;
canvasEl.style.width = CANVAS_W * ZOOM + "px";

const ctx = canvasEl.getContext("2d");

const catSpriteImageEl = new Image();
catSpriteImageEl.src =
  "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fcat-sprite.png?v=1577014873971";
const backgroundImageEl = new Image();
backgroundImageEl.src =
  "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fbackground.png?v=1577014872624";
const horizonImageEl = new Image();
horizonImageEl.src =
  "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fhorizon.png?v=1577042333898";
const beeImageEl = new Image();
beeImageEl.src =
  "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fbee.png?v=1577014863052";
const butterflyImageEl = new Image();
butterflyImageEl.src =
  "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fbutterfly.png?v=1577035563272";
const asciiImageEl = new Image();
asciiImageEl.src =
  "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fascii.png?v=1577030301441";
const heartImageEl = new Image();
heartImageEl.src =
  "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fheart.png?v=1577052658680";

function draw(imageEl, sx, sy, sw, sh, dx, dy) {
  ctx.drawImage(imageEl, sx, sy, sw, sh, dx, dy, sw, sh);
}

function drawRect(color, dx, dy, dw, dh) {
  ctx.fillStyle = color;
  ctx.fillRect(dx, dy, dw, dh);
}

function drawText(text, sx, sy) {
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const row = Math.floor(charCode / 16);
    const col = charCode % 16;
    draw(asciiImageEl, col * 8, row * 8, 8, 8, 8 * i + sx, sy);
  }
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
async function loadSound(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
}
function playBuffer(buffer) {
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start(0);
}
const sounds = {};
for (const [name, url] of Object.entries({
  jump:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fsfx_movement_jump10.wav?v=1577047900066",
  land:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fsfx_movement_jump9_landing.wav?v=1577049001196",
  butterfly:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fsfx_coin_double7.wav?v=1577049770730",
  bee:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fsfx_sounds_error10.wav?v=1577051173204"
}))
  sounds[name] = loadSound(url);
async function playSound(name) {
  playBuffer(await sounds[name]);
}

function restartBackgroundMusic() {
  const el = document.getElementById("background_music");
  el.currentTime = 0;
  el.play();
}

let state = {};

function resetState() {
  state = {
    frameNum: 0,
    jumpRequested: false,
    catVelocityDown: 0,
    catDiedAtFrameNum: undefined,
    catLives: 9,
    catWorldX: 0,
    catHeight: 0,
    jumpFrameNum: undefined,
    bees: [],
    butterflies: []
  };
  restartBackgroundMusic();
}

resetState();

function getCatHitBox() {
  return {
    left: state.catWorldX + 20,
    right: state.catWorldX + 27,
    top: state.catHeight + 19,
    bottom: state.catHeight + 9
  };
}

function getCatFeetHitBox() {
  return {
    left: state.catWorldX + 9,
    right: state.catWorldX + 27,
    top: state.catHeight + 8,
    bottom: state.catHeight + 6
  };
}

function getBeeHitBox(b) {
  return {
    left: b.worldX,
    right: b.worldX + 10,
    top: b.height + 7,
    bottom: b.height + 1
  };
}

function getButterflyHitBox(b) {
  return {
    left: b.worldX + 2,
    right: b.worldX + 11,
    top: b.height + 14,
    bottom: b.height + 4
  };
}

function furthestBeeWorldX() {
  return state.bees.length ? state.bees[state.bees.length - 1].worldX : 50;
}
function furthestButterflyWorldX() {
  return state.butterflies.length
    ? state.butterflies[state.butterflies.length - 1].worldX
    : 50;
}

function isInBox(box, pt) {
  return (
    pt.x >= box.left &&
    pt.x <= box.right &&
    pt.y >= box.bottom &&
    pt.y <= box.top
  );
}

function boxesIntersect(b1, b2) {
  return (
    b1.bottom < b2.top &&
    b2.bottom < b1.top &&
    b1.left < b2.right &&
    b2.left < b1.right
  );
}

function boxDidBounce(b1, b2) {
  return b2.right < b1.right && b2.bottom < b1.bottom;
}

const worldXToScreenX = worldX => worldX - state.catWorldX + 20;
const worldHeightToScreenY = worldHeight => GROUND - worldHeight;

function drawState() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // Horizon, doesn't move
  for (let i = 0; i < 5; i++) {
    draw(horizonImageEl, 0, 0, 48, 96, 48 * i, 0);
  }

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
      worldHeightToScreenY(0) - 32
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
      worldHeightToScreenY(state.catHeight) - SPRITE_H
    );
  } else {
    draw(
      catSpriteImageEl,
      SPRITE_W * (state.frameNum % SPRITE_NUM_FRAMES),
      0,
      SPRITE_W,
      SPRITE_H,
      worldXToScreenX(state.catWorldX) + 4,
      worldHeightToScreenY(state.catHeight) - SPRITE_H
    );
  }

  for (let butterfly of state.butterflies) {
    draw(
      butterflyImageEl,
      0,
      0,
      16,
      16,
      20 + (butterfly.worldX - state.catWorldX),
      worldHeightToScreenY(butterfly.height) - 16
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
      worldHeightToScreenY(bee.height) - BEE_SPRITE_H
    );
  }

  // Draw hit boxes (DEBUG)
  if (DRAW_HIT_BOXES) {
    function drawHitBox(color, hitBox) {
      drawRect(
        color,
        worldXToScreenX(hitBox.left),
        worldHeightToScreenY(hitBox.top),
        hitBox.right - hitBox.left,
        hitBox.top - hitBox.bottom
      );
    }
    const catHitBox = getCatHitBox();
    drawHitBox("hsla(0,100%,50%,50%)", getCatHitBox());
    drawHitBox("hsla(200,100%,50%,50%)", getCatFeetHitBox());
    for (let bee of state.bees) {
      drawHitBox("hsla(0,100%,50%,50%)", getBeeHitBox(bee));
    }
    for (let b of state.butterflies) {
      drawHitBox("hsla(0,100%,50%,50%)", getButterflyHitBox(b));
    }
  }

  // Draw text
  drawText(state.frameNum.toString(), 1, 1);
  
  for (let i = 0; i < state.catLives; i++) {
    draw(
      heartImageEl,
      0,0,8,8,
      8*i, 10
    );
  }
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
    playSound("jump");
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

  for (let butterfly of state.butterflies) {
    butterfly.height += Math.round(Math.random() * 2 - 1);
  }

  // Introduce future bees (important: in order)
  while (furthestBeeWorldX() < state.catWorldX + 150) {
    const furthest = furthestBeeWorldX();
    state.bees.push({
      worldX: furthest + Math.round(Math.random() * 70),
      height: Math.round(Math.random() * 50)
    });
  }
  while (furthestButterflyWorldX() < state.catWorldX + 150) {
    const furthest = furthestButterflyWorldX();
    state.butterflies.push({
      worldX: furthest + Math.round(10 + Math.random() * 300),
      height: Math.round(Math.random() * 50)
    });
  }

  // Remove past bees
  while (
    state.bees.length > 0 &&
    state.bees[0].worldX < state.catWorldX - 100
  ) {
    state.bees.shift();
  }

  // Butterflies

  // Remove past butterflies
  while (
    state.butterflies.length > 0 &&
    state.butterflies[0].worldX < state.catWorldX - 100
  ) {
    state.butterflies.shift();
  }

  // Kill cat
  const catHitBox = getCatHitBox();
  const catFeetHitBox = getCatFeetHitBox();

  const footBees = state.bees.filter(bee =>
    boxesIntersect(catFeetHitBox, getBeeHitBox(bee))
  );
  if (state.catVelocityDown > 0 && footBees.length > 0) {
    // Jump off the bee
    state.catVelocityDown = -3;
    playSound("jump");
  } else {
    const survivingBees = state.bees.filter(
      bee => !boxesIntersect(catHitBox, getBeeHitBox(bee))
    );
    const numBeesEaten = state.bees.length - survivingBees.length;
    state.bees = survivingBees;
    state.catLives -= numBeesEaten;
    if (state.catLives <= 0) state.catDiedAtFrameNum = state.frameNum;
    if (numBeesEaten > 0) playSound("bee");
  }

  // Kill butterflies
  const survivingButterflies = state.butterflies.filter(
    butterfly => !boxesIntersect(catHitBox, getButterflyHitBox(butterfly))
  );
  const numButterfliesEaten =
    state.butterflies.length - survivingButterflies.length;
  state.catLives += numButterfliesEaten;
  state.butterflies = survivingButterflies;
  if (numButterfliesEaten > 0) {
    playSound("butterfly");
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
    window.setTimeout(() => window.requestAnimationFrame(loop), 40);
  }
  window.requestAnimationFrame(loop);
});

// "click" event causes delay,
// due to waiting for mouseup, then waiting to ensure non-double-click
document.body.addEventListener("mousedown", () => {
  state.jumpRequested = true;
});
