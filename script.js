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

let frameNum = 0;

const ctx = canvasEl.getContext("2d");

const catSpriteImageEl = new Image();
catSpriteImageEl.src = "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fcat-sprite.png?v=1577014873971";
const backgroundImageEl = new Image();
backgroundImageEl.src = "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fbackground.png?v=1577014872624";
const horizonImageEl = new Image();
horizonImageEl.src = "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fhorizon.png?v=1577014866007";
const beeImageEl = new Image();
beeImageEl.src = "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fbee.png?v=1577014863052";

let jumpRequested = false;
let catVelocityDown = 0;

let catAlive = true;

let catWorldX = 0;
let catHeight = 0;

let jumpFrameNum;

let bees = [
  { worldX: 100, height: 12 }, 
  { worldX: 130, height: 8 }
];

function draw(imageEl, sx, sy, sw, sh, dx, dy) {
  ctx.drawImage(imageEl, sx, sy, sw, sh, dx, dy, sw, sh);
}



// TODO wait for backgroundImageEl
catSpriteImageEl.addEventListener("load", () => {
  function loop() {
    frameNum++;

    if (catAlive) {
      catWorldX += SPRITE_SPEED_PX; 
    } else {
      resetGame();
    }

    // Change velocity
    if (jumpRequested && catHeight === 0) {
      catVelocityDown = -5;
      jumpRequested = false;
      jumpFrameNum = frameNum;
    }
    if ((frameNum - jumpFrameNum) % 4 === 0) catVelocityDown += 1; // gravity

    // Change cat position
    catHeight -= catVelocityDown;
    if (catHeight <= 0) {
      catHeight = 0;
      catVelocityDown = 0;
    }

    // Change bee positions
    for (let bee of bees) {
      bee.height += Math.round(Math.random() * 2 - 1);
    }
    
    // Introduce future bees (important: in order)
    if (Math.random() < 0.02) {
      bees.push({ worldX: catWorldX+150, height: 5 });
    }
    
    // Remove past bees
    while (bees[0].beeIndex < 0) {
      bees.shift();
    }

    // DRAWING

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Horizon, doesn't move
    for (let i = 0; i < 5; i++) {
      draw(horizonImageEl, 0, 0, 48, 48, 48 * i, 0);
    }

    // Draw ground, scrolls with cat
    const bgScreenX = -(catWorldX % BG_W);
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
    if (catHeight != 0) {
      draw(
        catSpriteImageEl,
        SPRITE_W * 4,
        0,
        JUMP_SPRITE_W,
        SPRITE_H,
        20,
        GROUND - catHeight
      );
    } else {
      draw(
        catSpriteImageEl,
        SPRITE_W * (frameNum % SPRITE_NUM_FRAMES),
        0,
        SPRITE_W,
        SPRITE_H,
        24,
        GROUND - catHeight
      );
    }

    // Draw bees
    for (let bee of bees) {
      draw(
        beeImageEl,
        0,
        0,
        11,
        10,
        20 + (bee.worldX - catWorldX),
        GROUND - bee.height
      );
    }

    window.setTimeout(() => window.requestAnimationFrame(loop), 60);
  }
  window.requestAnimationFrame(loop);
});

document.body.addEventListener("click", () => {
  jumpRequested = true;
});
