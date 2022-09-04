/*
  TODO:
    - Collisions
      - SORT BY DISTANCE TO BALL
      X Restitution
      X Reflection
      X Resolution
    X Controls
    - Triggers
      - Add Points
      - Lose Life

  TODO LATER:
    - Game states
    - Resize?
    - Power Ups / Bonuses?
    - Music
    - Sound
    - Hentai Visual Novel Story?
*/

const GameModes = {
  BOOT: "GAME_BOOT",
  INIT: "GAME_INIT",
  START: "GAME_START",
  GAMEPLAY: "GAME_PLAY",
  GAMEPLAY_PAUSE: "GAMEPLAY_PAUSE",
  GAMEPLAY_WIN: "GAMEPLAY_WIN",
  GAMEPLAY_LOSE: "GAMEPLAY_LOSE",
  SETTINGS: "SETTINGS",
};


const GAME_WIDTH = 480;
const GAME_HEIGHT = 720;


const canvas = document.querySelector("canvas");

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;
const ctx = canvas.getContext("2d");

let state = {
  mode: GameModes.BOOT,
};


const init = () => {
  state = {
    mode: GameModes.GAMEPLAY_PAUSE,
    bricks: [],
    balls: [],
    paddle: {},
    walls: [],
    score: { value: 0 },
    lives: { value: 3 },
  };
	// 8 rows x 14 cols

  // TODO: Make this suck way less
  state.bricks = initializeBricks(
    14, 8,
    10 + 3, 80,
    (canvas.width - (10 + 3) * 2) / 14, 20,
    3,
    ["red", "orange", "green", "yellow"]
  );

  state.balls = initializeBalls(20, 20, "blue");
  state.paddle = initializePaddle(canvas.width / 2, canvas.height * 0.9, 80, 20, "blue");
  state.walls = initializeWalls(canvas.width, canvas.height, 10, "white");
};


const initializeBricks = (cols, rows, xOffset, yOffset, brickWidth, brickHeight, gutter, colors, values) => {
  let bricks = [];
  // const brickWidth = canvas.width / (cols);
  const rowsPerColor = rows / colors.length; // 32/4 = 8

	for (let row = 0; row < rows; row += 1) {
		for (let col = 0; col < cols; col += 1) {
      const colorIndex = Math.floor(row / rowsPerColor);
      const color = colors[colorIndex];
			const brick = {
				position: {
					x: xOffset + brickWidth * col + brickWidth / 2,
					y: yOffset + brickHeight * row + brickHeight / 2,
				},
				rect: {
					width: brickWidth - gutter,
					height: brickHeight - gutter,
					fill: color
				},
        health: 1,
        value: 1
			};

			bricks.push(brick);
		}
	}

  return bricks;
};

const initializeBalls = (width, height, color) => {
  return [
    {
      position: { x: canvas.width / 2, y: canvas.height / 2 },
      // position: { x: canvas.width / 2, y: canvas.height / 2 },
      rect: { width, height, fill: color },
      direction: { x: 0.7, y: 0.7 },
      speed: 6
    }
  ];
};

const initializePaddle = (x, y, width, height, color) => {
  return {
    position: { x, y },
    rect: { width, height, fill: color },
    speed: 8
  };
};

const initializeWalls = (width, height, thickness, color) => {
  let walls = [];
  // Add left, vertical wall
  walls.push({
    position: { x: thickness / 2, y: height / 2 },
    rect: { width: thickness, height, fill: color }
  });
  // Add top, horizontal wall
  walls.push({
    position: { x: width / 2, y: thickness / 2 },
    rect: { width, height: thickness, fill: color }
  });
  // Add right, vertical wall
  walls.push({
    position: { x: width - thickness / 2, y: height / 2 },
    rect: { width: thickness, height, fill: color }
  });

  return walls;
};


/*
	// Types

	Wall {
		position: Position
		rect: Rect
	}

  Score {
    value: Number
  }

  Paddle {
    position: Position
    rect: Rect
    speed: Number
  }

  Ball {
    position: Position
    direction: Direction
    speed: Number
    rect: Rect
  }

	Brick {
		position: Position
		rect: Rect
    health: Number
    value: Number
	}

  Position {
    x, y
  }

  Rect {
    width, height, fill
  }

*/

console.log(1 / Math.sqrt(1 ** 2 + 1 ** 2));


// -1, 0, 1     Direction: { x: -1, y: 0 }
// 0-60         Speed: 60

let keys = {};

const isPressed = (key) => keys[key];
const setKey = (key) => keys[key] = true;
const unsetKey = (key) => keys[key] = false;

window.addEventListener("keydown", e => setKey(e.code));
window.addEventListener("keyup", e => unsetKey(e.code));

const update = () => {
  // prune dead bricks
  state.bricks = state.bricks.filter(brick => brick.health > 0);
  // update paddle position
  updatePaddle(state.paddle);
  // check each ball against each wall / brick / paddle
  state.balls.forEach(ball => {
    // check ball vs wall
    state.walls.forEach(wall => {
      const collision = checkCollision(ball, wall);
      if (!collision) return;
      const dislodgeVector = findAngleOfRestitution(collision);
      ball.position.x += dislodgeVector.x;
      ball.position.y += dislodgeVector.y;

      const dirX = Math.abs(dislodgeVector.x) > 0 ? -1 : 1;
      const dirY = Math.abs(dislodgeVector.y) > 0 ? -1 : 1;
      ball.direction.x *= dirX;
      ball.direction.y *= dirY;
    });

    // check ball vs brick
    state.bricks.forEach(brick => {
      const collision = checkCollision(ball, brick);
      if (!collision) return;
      const dislodgeVector = findAngleOfRestitution(collision);
      ball.position.x += dislodgeVector.x;
      ball.position.y += dislodgeVector.y;

      const dirX = Math.abs(dislodgeVector.x) > 0 ? -1 : 1;
      const dirY = Math.abs(dislodgeVector.y) > 0 ? -1 : 1;
      ball.direction.x *= dirX;
      ball.direction.y *= dirY;

      // brick was hit, remove health
      brick.health = Math.max(0, brick.health - 1);
    });

    // check ball vs paddle
    const collision = checkCollision(ball, state.paddle);
    if (!collision) return;
    const dislodgeVector = findAngleOfRestitution(collision);
    ball.position.x += dislodgeVector.x;
    ball.position.y += dislodgeVector.y;

    const dirX = Math.abs(dislodgeVector.x) > 0 ? -1 : 1;
    const dirY = Math.abs(dislodgeVector.y) > 0 ? -1 : 1;
    ball.direction.x *= dirX;
    ball.direction.y *= dirY;
  });

  updateBallPositions(state.balls);
};

const findAngleOfRestitution = (collision) => {
  const dirToB = {
    x: collision.b.x - collision.a.x,
    y: collision.b.y - collision.a.y,
  };

  let distanceX = 0;
  let distanceY = 0;

  if (dirToB.x < 0) {
    distanceX = collision.b.right - collision.a.left;
  } else {
    distanceX = collision.a.right - collision.b.left;
  }

  if (dirToB.y < 0) {
    distanceY = collision.b.bottom - collision.a.top;
  } else {
    distanceY = collision.a.bottom - collision.b.top;
  }

  let angle = { x: 0, y: 0 };
  // Pick the shortest path out of collision
  if (distanceX < distanceY && distanceX !== 0) {
    // Should move horizontally
    // Pick opposite direction A was heading
    angle.x = -Math.sign(dirToB.x) * distanceX;
  } else {
    // Should move vertically
    // Pick opposite direction A was heading
    angle.y = -Math.sign(dirToB.y) * distanceY;
  }

  return angle;
};

const makeBoundingBox = (A) => ({
  left: A.position.x - A.rect.width / 2,
  right: A.position.x + A.rect.width / 2,
  top: A.position.y - A.rect.height / 2,
  bottom: A.position.y + A.rect.height / 2,

  x: A.position.x,
  y: A.position.y,
  width: A.rect.width,
  height: A.rect.height,

  item: A
});

const checkCollision = (A, B) => {
  const a = makeBoundingBox(A);
  const b = makeBoundingBox(B);

  const xCollision = !((a.left > b.right) || (a.right < b.left));
  const yCollision = !((a.top > b.bottom) || (a.bottom < b.top));

  if (!xCollision || !yCollision) {
    return null;
  }

  const collision = { a, b };
  return collision;
};

const updateBallPositions = (balls) => {
  balls.forEach(ball => {
    const x = ball.direction.x * ball.speed;
    const y = ball.direction.y * ball.speed;

    const position = {
      x: ball.position.x + x,
      y: ball.position.y + y
    };

    ball.position = position;
  });
};

const updatePaddle = (paddle) => {

  const leftMovement = isPressed("ArrowLeft") || isPressed("KeyA") ? -1 : 0;
  const rightMovement = isPressed("ArrowRight") || isPressed("KeyD") ? 1 : 0;

  const movement = (leftMovement + rightMovement) * paddle.speed;

  const GLOBAL_LEFT_EDGE = 13; // FIX THIS
  const GLOBAL_RIGHT_EDGE = canvas.width - 13; // FIX THIS

  const x = paddle.position.x + movement;
  const halfWidth = paddle.rect.width / 2;

  paddle.position.x = clamp(GLOBAL_LEFT_EDGE + halfWidth, x, GLOBAL_RIGHT_EDGE - halfWidth);

};

const clamp = (min, x, max) => Math.max(min, Math.min(x, max));


const draw = () => {
  clearScreen(ctx, "black");
  drawBricks(ctx, state.bricks);
  drawPaddle(ctx, state.paddle);
  drawWalls(ctx, state.walls);
  drawBalls(ctx, state.balls);
};

const clearScreen = (ctx, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const drawBricks = (ctx, bricks) => {
  bricks.forEach(brick => {
		drawRectangle(ctx, brick.rect, brick.position);
	});
};

const drawBalls = (ctx, balls) => {
  balls.forEach(ball => {
    drawRectangle(ctx, ball.rect, ball.position);
  });
};

const drawPaddle = (ctx, paddle) => {
  drawRectangle(ctx, paddle.rect, paddle.position);
};

const drawWalls = (ctx, walls) => {
  walls.forEach(wall => {
    drawRectangle(ctx, wall.rect, wall.position);
  });
};

// position {x: 1 y: 2}
const drawRectangle = (ctx, rect, position) => {
	const x = position.x - rect.width / 2;
	const y = position.y - rect.height / 2;
	ctx.fillStyle = rect.fill;
	ctx.fillRect(x, y, rect.width, rect.height);
};

const run = () => {
  init();
  scheduleTick(performance.now());
};


const tick = (ms) => {
  update();
  draw();
};

const scheduleTick = (ms) => {
  tick(ms);
  requestAnimationFrame(scheduleTick);
};

run();





/*
	Proper Nouns (Game):
		Brick
		Ball
		Paddle
		Score
		Screen
			- Start
			- Gameplay
			- GameOver
		Round

	Proper Nouns (System):
		CollisionManifold (rename?)
		Movement (also rename?)
			Position
			Direction
		Tripwire / Pressure Plate
		Controls

	Atoms:
		Vector
		Rect
		Event / Action
		Keyboard
		Controller

*/

window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};