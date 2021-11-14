var snakeSize = 10;
var gridHeight = 260 / snakeSize;
var gridWidth = 400 / snakeSize;
var xMove = 0;
var yMove = 0;
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

var gameOver = false;

var snakeArray = [[
    getRandomInt(0, gridWidth-1) * snakeSize, 
    getRandomInt(0, gridHeight-1) * snakeSize
]];

var foodPos = [getRandomInt(0, gridWidth-1) * snakeSize, getRandomInt(0, gridHeight-1) * snakeSize];
var fpsInterval, startTime, now, then, elapsed;

// initialize the timer variables and start the animation
function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    render();
}

function render() {
    const snakeGrid = document.getElementById('snake');
    if (snakeGrid) {

        // you have lost
        if (gameOver) {
            console.log('THE END!');
            unloadScript();
            return;
        }

        requestAnimationFrame(render);
        now = Date.now();
        elapsed = now - then;

        // if enough time has elapsed, draw the next frame
        if (elapsed > fpsInterval) {

            // Get ready for next frame by setting then=now, but also adjust for your
            // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
            then = now - (elapsed % fpsInterval);

            // Put your drawing code here
            const snakeCtx = snakeGrid.getContext('2d');
            snakeCtx.clearRect(0, 0, snakeSize * gridWidth, snakeSize * gridHeight);
            
            
            snakeCtx.fillStyle = 'gray';
            snakeCtx.fillRect(foodPos[0], foodPos[1], snakeSize, snakeSize);
            snakeCtx.fillStyle = 'black';

            snakeArray.forEach((point, index) => {
                snakeArray[index][0]+=xMove;
                snakeArray[index][1]+=yMove;
                // last index is head
                if (index === snakeArray.length-1) {
                    if (snakeArray.length > 1) {
                        const detectCollision = snakeArray.slice(0,snakeArray.length-1).findIndex(p => {
                            return p[0] === snakeArray[index][0] && p[1] === snakeArray[index][1];
                        });

                        if (detectCollision > -1)
                            gameOver = true;
                    }
                } 
                else {
                    snakeArray[index][0] = snakeArray[index+1][0];
                    snakeArray[index][1] = snakeArray[index+1][1];
                }
                
                const newX = point[0] >= (gridWidth * snakeSize) ? 0 : (point[0] < 0 ? (gridWidth * snakeSize) - snakeSize : point[0]);
                const newY = point[1] >= (gridHeight * snakeSize) ? 0 : (point[1] < 0 ? (gridHeight * snakeSize) - snakeSize : point[1]);
                snakeArray[index][0] = newX;
                snakeArray[index][1] = newY;

                if (index === snakeArray.length-1 && newX === foodPos[0] && newY === foodPos[1]) {
                    // eat the food
                    snakeArray.unshift([foodPos[0],foodPos[1]]);

                    var detectFoodCollision = 0;
                    while (detectFoodCollision > -1) {
                        foodPos = [getRandomInt(0, gridWidth-1) * snakeSize, getRandomInt(0, gridHeight-1) * snakeSize];
                        detectFoodCollision = snakeArray.findIndex(p => {    
                            return p[0] === foodPos[0] && p[1] === foodPos[1];
                        });
                    }
                }
                snakeCtx.fillRect(newX, newY, snakeSize, snakeSize);
            });
        }
    }
    else {
        unloadScript();
    }
}

var unloadScript = () => {
    const head = document.getElementsByTagName("head")[0];
    head.lastChild.remove();
    document.removeEventListener('keydown', handleControls);
}

var handleControls = (e) => {
    if (e.code === 'ArrowUp' && yMove == 0) {
        yMove = -snakeSize;
        xMove = 0;
    }
    else if (e.code === 'ArrowDown' && yMove == 0) {
        yMove = snakeSize;
        xMove = 0;
    }

    if (e.code === 'ArrowLeft' && xMove == 0) {
        xMove = -snakeSize;
        yMove = 0;
    }
    else if (e.code === 'ArrowRight' && xMove == 0) {
        xMove = snakeSize;
        yMove = 0;
    }
};

// volume control listeners
document.addEventListener('keydown', handleControls);
startAnimating(24);

