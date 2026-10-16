/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

const cellSize = 2;
const gridWidth = Math.floor(window.innerWidth / (cellSize + 0.1));
const gridHeight = Math.floor(window.innerHeight / (cellSize + 0.1));

canvas.width = gridWidth;
canvas.height = gridHeight;

canvas.style.width = `${gridWidth * cellSize}px`;
canvas.style.height = `${gridHeight * cellSize}px`;

const Types = Object.freeze({
    NONE: 0,
    RED: 1,
    BLUE: 2
});

let grid = new Uint8Array(gridWidth * gridHeight);
let prevGrid = new Uint8Array(gridWidth * gridHeight);

const imgData = ctx.createImageData(gridWidth, gridHeight);
const data = imgData.data;

const TypeColors = Object.freeze({
    [Types.NONE]: {red: 0, green: 0, blue: 0},
    [Types.RED]: {red: 255, green: 0, blue: 0},
    [Types.BLUE]: {red: 0, green: 0, blue: 255}
})

function getIdx(x, y) {
    x = (x + gridWidth) % gridWidth;
    y = (y + gridHeight) % gridHeight;
    return (x + y * gridWidth);
}

let tick = 0;

function update() {
    const temp = prevGrid;
    prevGrid = grid;
    grid = temp;

    grid.fill(Types.NONE);

    const redMoves = (tick % 2) == 0;

    for (let y = gridHeight - 1; y >= 0; y--) {
        for (let x = gridWidth - 1; x >= 0; x--) {
            const idx = getIdx(x, y);
            const type = prevGrid[idx];

            if (type === Types.NONE) {
                continue;
            }
            else if (type === Types.RED) {
                if (redMoves) {
                    const targetIdx = getIdx(x + 1, y);
                    if (prevGrid[targetIdx] === Types.NONE) {
                        grid[targetIdx] = Types.RED;
                        grid[idx] = Types.NONE;
                    } else {
                        grid[idx] = Types.RED;
                    }
                } else {
                    grid[idx] = Types.RED;
                }
            }
            else if (type === Types.BLUE) {
                if (!redMoves) {
                    const targetIdx = getIdx(x, y + 1);
                    if (prevGrid[targetIdx] === Types.NONE) {
                        grid[targetIdx] = Types.BLUE;
                        grid[idx] = Types.NONE;
                    } else {
                        grid[idx] = Types.BLUE;
                    }
                } else {
                    grid[idx] = Types.BLUE;
                }
            }
        }
    }

    tick++;
}

function draw() {
    for (let i = 0; i < grid.length; i++) {
        const type = grid[i];
        const pixelIdx = i * 4;

        data[pixelIdx] = TypeColors[type].red;
        data[pixelIdx + 1] = TypeColors[type].green;
        data[pixelIdx + 2] = TypeColors[type].blue;
        data[pixelIdx + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
}

const lower = grid.length / 4;
const upper = lower * 3;
for (let i = 0; i < grid.length; i++) {
    const x = i % gridWidth;
    const y = Math.floor(i / gridWidth);
    if (x < gridWidth / 2 && y < gridHeight / 2) {
        grid[i] = Types.RED;
    } else if (x > gridWidth / 2 && y > gridHeight / 2) {
        grid[i] = Types.BLUE;
    } else {
        grid[i] = Types.NONE;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
