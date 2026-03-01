// Initialize Kaboom.js
kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    clearColor: [0.1, 0.1, 0.3, 1],
});

// Game constants
const GRID_WIDTH = 8;
const GRID_HEIGHT = 16;
const CELL_SIZE = 40;

// Load assets (placeholders for now)
loadSprite("pill-half", {
    width: CELL_SIZE,
    height: CELL_SIZE / 2,
    sliceX: 2,
    anims: {
        "red": 0,
        "blue": 1,
    },
    draw() {
        const col = this.frame === 0 ? RGB(255, 0, 0) : RGB(0, 0, 255);
        drawRect({
            width: this.width,
            height: this.height,
            pos: vec2(0),
            color: col,
        });
        drawRect({
            width: this.width,
            height: 2,
            pos: vec2(0, this.height / 2 - 1),
            color: RGB(0, 0, 0),
        });
    },
});

loadSprite("virus", {
    width: CELL_SIZE,
    height: CELL_SIZE,
    sliceX: 3,
    anims: {
        "red": 0,
        "blue": 1,
        "yellow": 2,
    },
    draw() {
        const col = 
            this.frame === 0 ? RGB(255, 0, 0) :
            this.frame === 1 ? RGB(0, 0, 255) :
            RGB(255, 255, 0);
        drawRect({
            width: this.width,
            height: this.height,
            pos: vec2(0),
            color: col,
        });
    },
});

// Game state
let score = 0;
let level = 1;
let grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null));

// Spawn a new pill
function spawnPill() {
    const colors = ["red", "blue"];
    const color1 = choose(colors);
    const color2 = choose(colors);
    return {
        pos: vec2(GRID_WIDTH / 2 - 1, 0),
        parts: [
            { color: color1, offset: vec2(0, 0) },
            { color: color2, offset: vec2(0, 1) },
        ],
    };
}

// Current pill
let currPill = spawnPill();

// Draw the game
scene("main", () => {
    // Wait for all assets to load
    onLoad(() => {
        // UI
        add([
            text(`Score: ${score}`),
            pos(10, 10),
            { value: score },
        ]);

        add([
            text(`Level: ${level}`),
            pos(width() - 100, 10),
            { value: level },
        ]);

        // Draw grid background
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                add([
                    rect(CELL_SIZE, CELL_SIZE),
                    pos(x * CELL_SIZE, y * CELL_SIZE + 60),
                    outline(1),
                    color(240, 240, 240),
                ]);
            }
        }

        // Draw viruses and pills in the grid
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (grid[y][x]) {
                    try {
                        add([
                            sprite(grid[y][x].type, { anim: grid[y][x].color }),
                            pos(x * CELL_SIZE, y * CELL_SIZE + 60),
                        ]);
                    } catch (e) {
                        console.error("Failed to draw sprite:", e);
                    }
                }
            }
        }

        // Draw current pill
        for (const part of currPill.parts) {
            try {
                add([
                    sprite("pill-half", { anim: part.color }),
                    pos(
                        (currPill.pos.x + part.offset.x) * CELL_SIZE,
                        (currPill.pos.y + part.offset.y) * CELL_SIZE + 60
                    ),
                ]);
            } catch (e) {
                console.error("Failed to draw pill:", e);
            }
        }

        // Touch controls
        onKeyPress("left", () => movePill(-1, 0));
        onKeyPress("right", () => movePill(1, 0));
        onKeyPress("down", () => movePill(0, 1));
        onKeyPress("space", () => rotatePill());

        // Mobile touch controls
        onClick("left", () => movePill(-1, 0));
        onClick("right", () => movePill(1, 0));
        onClick("down", () => movePill(0, 1));
        onClick("rotate", () => rotatePill());
    });
});

// Move pill
function movePill(dx, dy) {
    const newX = currPill.pos.x + dx;
    const newY = currPill.pos.y + dy;
    
    // Check boundaries
    if (newX < 0 || newX + 1 >= GRID_WIDTH || newY + 1 >= GRID_HEIGHT) {
        return;
    }
    
    // Check collision with grid
    for (const part of currPill.parts) {
        const gridX = newX + part.offset.x;
        const gridY = newY + part.offset.y;
        if (grid[gridY] && grid[gridY][gridX]) {
            return;
        }
    }
    
    currPill.pos.x = newX;
    currPill.pos.y = newY;
}

// Rotate pill
function rotatePill() {
    // Simple rotation: swap offsets
    currPill.parts[0].offset.x = -currPill.parts[0].offset.x;
    currPill.parts[1].offset.x = -currPill.parts[1].offset.x;
}

// Start the game
go("main");