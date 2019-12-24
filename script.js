const SPRITE_NUM_FRAMES = 4;
const SPRITE_W = 24;
const SPRITE_H = 24;
const SPRITE_SPEED_PX = 2;

const JUMP_SPRITE_W = 32;

const BEE_SPRITE_W = 11;
const BEE_SPRITE_H = 10;

const BUTTERFLY_SPRITE_W = 16;
const BUTTERFLY_SPRITE_H = 16;

const BG_W = 48;
const BG_H = 96;

const ASCII_W = 512;
const ASCII_H = 256;

const CANVAS_W = 192;
const CANVAS_H = 108;

const ZOOM = 5;

const GROUND = 84;

const DRAW_HIT_BOXES = false;

const canvasEl = document.getElementById("canvas");
canvasEl.width = CANVAS_W;
canvasEl.height = CANVAS_H;

function letterboxCanvas() {
  const canvasRatio = CANVAS_W / CANVAS_H;
  const viewportRatio = window.innerWidth / window.innerHeight;
  if (viewportRatio > canvasRatio) {
    canvasEl.style.height = "100%";
    canvasEl.style.width = "unset";
    const canvasWidth = window.innerHeight * canvasRatio;
    canvasEl.style.paddingLeft = (window.innerWidth - canvasWidth) / 2 + "px";
    canvasEl.style.paddingTop = "0px";
  } else {
    canvasEl.style.width = "100%";
    canvasEl.style.height = "unset";
    const canvasHeight = window.innerWidth / canvasRatio;
    canvasEl.style.paddingTop = (window.innerHeight - canvasHeight) / 2 + "px";
    canvasEl.style.paddingLeft = "0px";
  }
}
window.onresize = letterboxCanvas;
letterboxCanvas();

const ctx = canvasEl.getContext("2d");

const imageEls = {};
for (let [name, url] of Object.entries({
  catSprite:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fcat-sprite.png?v=1577146059349",
  background:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fbackground.png?v=1577140001768",
  foreground:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fforeground.png?v=1577140027044",
  horizon:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fhorizon.png?v=1577042333898",
  trees:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Ftrees.png?v=1577139224355",
  bee:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fbee.png?v=1577148605427",
  butterfly:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fbutterfly.png?v=1577149785588",
  ascii:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fascii.png?v=1577030301441",
  heart:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fheart.png?v=1577052658680",
  border:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fborder.png?v=1577203659702"
})) {
  const img = new Image();
  img.src = url;
  imageEls[name] = img;
}

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
    draw(imageEls.ascii, col * 8, row * 8, 8, 8, 8 * i + sx, sy);
  }
}

function drawTextCenter(text, sy) {
  const textWidth = text.length*8;
  const sx = Math.round((CANVAS_W-textWidth)/2);
  drawText(text, sx, sy);
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
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fsfx_sounds_error10.wav?v=1577051173204",
  electric:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fsfx_exp_medium10.wav?v=1577131384116",
  lose:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fsfx_sound_shutdown2.wav?v=1577205803077",
  win:
    "https://cdn.glitch.com/45f0801f-7315-41ae-b12c-26a84073b9c6%2Fsawsquarenoise_-_07_-_Towel_Defence_Jingle_Win.mp3?v=1577206256642"
}))
  sounds[name] = loadSound(url);
async function playSound(name) {
  playBuffer(await sounds[name]);
}

const backgroundMusicEl = document.getElementById("background_music");

function restartBackgroundMusic() {
  backgroundMusicEl.currentTime = 0;
  backgroundMusicEl.play();
}

function stopBackgroundMusic() {
  backgroundMusicEl.pause();
}

let state = {};

function startNewGame() {
  state = {
    mode: "playing",
    frameNum: 0,
    jumpRequestedAtFrameNum: undefined,
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
  document.documentElement.requestFullscreen();
}

function goToMenu() {
  state = {
    mode: "menu",
    catWorldX: 0  // Hack: used for scrolling background
  };
  stopBackgroundMusic();
}

goToMenu();

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

function getHighScore() {
  return localStorage.getItem("high_score");
}

function drawState() {
  if (state.mode === "menu") {
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    for (let i = 0; i < 5; i++) {
      draw(imageEls.horizon, 0, 0, 48, 96, 48 * i, 0);
    }
    const treesScreenX = -(Math.round(state.catWorldX / 2) % BG_W);
    for (let i = 0; i < 5; i++) {
      draw(imageEls.trees, 0, 0, 48, 96, treesScreenX + BG_W * i, 0);
    }
    const bgScreenX = -(state.catWorldX % BG_W);
    for (let i = 0; i < 5; i++) {
      draw(
        imageEls.background,
        0,
        0,
        BG_W,
        BG_H,
        bgScreenX + BG_W * i,
        worldHeightToScreenY(0) - 32
      );
    }
    
    draw(imageEls.border, 0, 0, CANVAS_W, CANVAS_H, 0, 0);

    if (Math.round(state.catWorldX/10) % 2) {
      drawTextCenter("CLIQUEZ POUR JOUER!", 60); 
    }
    const highScore = getHighScore();
    if (highScore) {
    drawTextCenter("MEILLEUR: " + highScore, 80); 
    }
    
  } else if (state.mode === "playing") {
    // Horizon, doesn't move
    for (let i = 0; i < 5; i++) {
      draw(imageEls.horizon, 0, 0, 48, 96, 48 * i, 0);
    }

    const treesScreenX = -(Math.round(state.catWorldX / 2) % BG_W);
    for (let i = 0; i < 5; i++) {
      draw(imageEls.trees, 0, 0, 48, 96, treesScreenX + BG_W * i, 0);
    }

    // Draw ground, scrolls with cat
    const bgScreenX = -(state.catWorldX % BG_W);
    for (let i = 0; i < 5; i++) {
      draw(
        imageEls.background,
        0,
        0,
        BG_W,
        BG_H,
        bgScreenX + BG_W * i,
        worldHeightToScreenY(0) - 32
      );
    }

    // Draw cat
    if (
      state.ateBeeAtFrameNum === state.frameNum - 1 ||
      state.ateBeeAtFrameNum === state.frameNum - 3 ||
      state.ateBeeAtFrameNum === state.frameNum - 5
    ) {
      // Draw electrocuted cat
      draw(
        imageEls.catSprite,
        153,
        0,
        29,
        SPRITE_H,
        worldXToScreenX(state.catWorldX),
        worldHeightToScreenY(state.catHeight) - SPRITE_H
      );
    } else if (state.jumpFrameNum && state.frameNum - state.jumpFrameNum < 3) {
      // Draw half-jumping cat
      draw(
        imageEls.catSprite,
        SPRITE_W * 4,
        0,
        28,
        SPRITE_H,
        worldXToScreenX(state.catWorldX) + 1,
        worldHeightToScreenY(state.catHeight) - SPRITE_H
      );
    } else if (state.catHeight != 0) {
      // Draw jumping cat
      draw(
        imageEls.catSprite,
        124,
        0,
        29,
        SPRITE_H,
        worldXToScreenX(state.catWorldX) + 1,
        worldHeightToScreenY(state.catHeight) - SPRITE_H
      );
    } else {
      draw(
        imageEls.catSprite,
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
        imageEls.butterfly,
        BUTTERFLY_SPRITE_W * (Math.round(state.frameNum / 3) % 2),
        0,
        BUTTERFLY_SPRITE_W,
        BUTTERFLY_SPRITE_H,
        20 + (butterfly.worldX - state.catWorldX),
        worldHeightToScreenY(butterfly.height) - BUTTERFLY_SPRITE_H
      );
    }

    // Draw bees
    for (let bee of state.bees) {
      draw(
        imageEls.bee,
        BEE_SPRITE_W * (state.frameNum % 2),
        0,
        BEE_SPRITE_W,
        BEE_SPRITE_H,
        20 + (bee.worldX - state.catWorldX),
        worldHeightToScreenY(bee.height) - BEE_SPRITE_H
      );
    }

    // Draw foreground
    const fgScreenX = -((state.catWorldX * 2) % BG_W);
    for (let i = 0; i < 5; i++) {
      draw(
        imageEls.foreground,
        0,
        0,
        BG_W,
        BG_H,
        fgScreenX + BG_W * i,
        worldHeightToScreenY(0) - 32
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

    let livesToDraw = state.catLives;
    let col = 0;
    let row = 0;
    while (livesToDraw > 0) {
      draw(imageEls.heart, 0, 0, 8, 8, CANVAS_W - 8 * (col + 1), 8 * row);
      if (col == 8) {
        col = 0;
        row++;
      } else {
        col++;
      }
      livesToDraw--;
    }
  }
}

const jumpRequested = () =>
  state.jumpRequestedAtFrameNum &&
  state.jumpRequestedAtFrameNum > state.frameNum - 15;

function doCalcs() {
  if (state.mode === "menu") {
    state.catWorldX += 1;
    return;
  } else if (state.mode === "playing") {
    if (state.catDiedAtFrameNum) {
      const score = state.frameNum;
      const highScore = getHighScore();
      if (highScore === null || highScore < score) {
        localStorage.setItem("high_score", score);
        playSound("win");
      } else {
        playSound("lose");
      }
      goToMenu();
      return;
    }

    state.frameNum++;

    state.catWorldX += SPRITE_SPEED_PX;

    // Change velocity
    if (
      jumpRequested() &&
      state.catHeight === 0 &&
      state.catVelocityDown <= 0
    ) {
      state.catVelocityDown = -5;
      state.jumpRequestedAtFrameNum = false;
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
    const startBeeGap = 60;
    const hardestBeeGap = 40;
    const avgBeeGap = Math.max(
      hardestBeeGap,
      startBeeGap - Math.round(state.catWorldX / 400)
    );

    while (furthestBeeWorldX() < state.catWorldX + 150) {
      const furthest = furthestBeeWorldX();
      state.bees.push({
        worldX: furthest + Math.round(Math.random() * avgBeeGap * 2),
        height: Math.round(Math.random() * 50)
      });
    }

    // Introduce future butterflies
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
      state.catVelocityDown = jumpRequested() ? -4 : -2;
      state.jumpFrameNum = state.frameNum;
      playSound("jump");
    } else {
      const survivingBees = state.bees.filter(
        bee => !boxesIntersect(catHitBox, getBeeHitBox(bee))
      );
      const numBeesEaten = state.bees.length - survivingBees.length;
      state.bees = survivingBees;
      state.catLives -= numBeesEaten;
      if (state.catLives <= 0) state.catDiedAtFrameNum = state.frameNum;
      if (numBeesEaten > 0) {
        playSound("bee");
        playSound("electric");
        state.ateBeeAtFrameNum = state.frameNum;
      }
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
  } else {
    console.error("Unknown mode", state.mode);
  }
}

function doFrame() {
  doCalcs();
  drawState();
}

imageEls.catSprite.addEventListener("load", () => {
  function loop() {
    doFrame();
    let loopSpeed = 40;
    if (state.mode === "playing") {
      loopSpeed = Math.max(20, 40 - Math.floor(state.frameNum / 300));
    }
    window.setTimeout(() => window.requestAnimationFrame(loop), loopSpeed);
  }
  window.requestAnimationFrame(loop);
});

const onTap = () => {
  if (state.mode === "playing") {
    state.jumpRequestedAtFrameNum = state.frameNum;
  }
};

// "click" event causes delay,
// due to waiting for mouseup, then waiting to ensure non-double-click
document.body.addEventListener("mousedown", onTap);
document.body.addEventListener("touchstart", onTap);
document.body.addEventListener("click", () => {
  if (state.mode === "menu" && state.catWorldX > 30) {
    startNewGame();
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}