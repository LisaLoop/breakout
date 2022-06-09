/*
  TODO:
    - Controls
    - Collisions
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

const canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

let state = {
  mode: "BOOT"
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
  state.bricks = initializeBricks(
    14, 8,
    20, 3,
    ["red", "orange", "green", "yellow"]
  );

  state.balls = initializeBalls(20, 20, "blue");
  state.paddle = initializePaddle(canvas.width / 2, canvas.height * 0.9, 80, 20, "blue");
};


const initializeBricks = (cols, rows, brickHeight, gutter, colors, values) => {
  let bricks = [];
  const brickWidth = canvas.width / (cols);
  const rowsPerColor = rows / colors.length; // 32/4 = 8

	for (let row = 0; row < rows; row += 1) {
		for (let col = 0; col < cols; col += 1) {
      const colorIndex = Math.floor(row / rowsPerColor);
      const color = colors[colorIndex];
			const brick = {
				position: {
					x: brickWidth * col + brickWidth / 2,
					y: brickHeight * row + brickHeight / 2,
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

 // m = Math.sqrt(1 * 1 + 1 * 1) (1/m, 1/m) = (0.7, 0.7)

const initializeBalls = (width, height, color) => {
  return [
    {
      position: { x: canvas.width / 2, y: canvas.height / 2 },
      rect: { width, height, fill: color },
      direction: { x: 0.7, y: 0.7 },
      speed: 2
    }
  ];
};

const initializePaddle = (x, y, width, height, color) => {
  return {
    position: { x, y },
    rect: { width, height, fill: color },
    speed: 5
  };
};

const initializeWalls = () => {};


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

const update = () => {
  updateBalls(state.balls);
};

const updateBalls = (balls) => {
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

const draw = () => {
  clearScreen(ctx, "black");
  drawBricks(ctx, state.bricks);
  drawBalls(ctx, state.balls);
  drawPaddle(ctx, state.paddle);
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