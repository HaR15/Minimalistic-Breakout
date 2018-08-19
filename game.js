// canvas globals
var canvas;
var context;
var screenW = '700';
var screenH = '500';
var currentInterval;
var leftKey = false;
var rightKey = false;
var state = 'game';
var score = 0;
var lives = 3;
var level = 1;

// ball globals
var ballR = 7.5;
var ballX = screenW / 2.5;
var ballY = screenH / 2.0;
var moveBallX = 3;
var moveBallY = 4;
var directionX;
var directionY;
var hits = 0;
var hitFirstRow = false;
var hitSecondRow= false;
var hitCeiling = false;

// paddle globals
var paddleX = screenW / 2;
var paddleY = screenH - 10;
var paddleW = 150;
var paddleH = 20;
var movePaddleX = 8;

// brick globals
var bricks;
var numBrickRows = 8;
var numBrickCols = 14;
var brickW = screenW / numBrickCols;
var brickH = (screenH / 3) / numBrickRows;
var random = Math.random();
var colors = ['#CC3300','#FF6600','#009933 ','#FFCC33'];


function start() {
    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    setBricks();
    // call draw every 10ms
    currentInterval = setInterval(draw, 10);
}

function checkKey(e){
    if (e.keyCode == '37') {
        leftKey = true;
    }
    else if(e.keyCode == '39'){
        rightKey = true;
    }
}

function stopPress(e){
    if (e.keyCode == '37') {
        leftKey = false;
    }
    else if(e.keyCode == '39') {
        rightKey = false;
    }
}

function drawBackground(){
    context.clearRect(0,0,screenW,screenH);
    context.beginPath();
    context.fillStyle = 'black';
    context.rect(0,0,screenW+1,screenH+1);
    context.fill();
    context.closePath();
}

function drawBall(){
    //make the ball
    context.beginPath();
    context.arc(ballX, ballY, ballR, 0, Math.PI*2, true);
    context.fillStyle = '#66CCFF';
    context.fill();
    context.lineWidth = '2';
    //context.strokeStyle = 'white';
    //context.stroke();
}

function drawPaddle(){
    context.beginPath();
    context.rect(paddleX, paddleY, paddleW, paddleH);
    context.fillStyle = '#66CCFF';
    context.fill();
    //context.strokeStyle = 'white';
    //context.stroke();
    context.closePath();
}

function setBricks() {
    bricks = [];
    for(var i = 0; i < numBrickRows; i++){
        bricks[i] = [];
        for(var j = 0; j < numBrickCols; j++){
            bricks[i][j] = 1;
        }
    }
}

function drawBricks(){
    for(var i = 0; i < numBrickRows; i++){
        for(var j = 0; j < numBrickCols; j++){
            if(bricks[i][j] == 1){
                context.beginPath();
                context.rect(j*brickW, i*brickH, brickW, brickH);
                context.fillStyle = colors[Math.floor(i/2)];//colors[Math.floor(Math.random() * 6)];
                context.fill();
                //context.strokeStyle = 'black';
                context.strokeStyle = colors[Math.floor(i/2)];
                context.stroke();
            }
        }
    }
}

function moveBall(){
    // positive x direction if moving right, negative if moving left
    directionX = (ballX + moveBallX) - ballX;
    
    // positive y direction if moving down, negative if moving up
    directionY = (ballY + moveBallY) - ballY;
    
    
    // handle wall collisions
    if(((ballX + moveBallX) > screenW) || ((ballX + moveBallX) < 0)) {
        moveBallX = -moveBallX;
    }
    
    //handle ceil collisions
    
    if((ballY + moveBallY) < 0) {
        moveBallY = -(moveBallY);
        if(!hitCeiling){
            paddleW = paddleW/2;
            hitCeiling = true;
        }
    }
    //handle floor collisions 
    if((ballY + moveBallY) > screenH){
        // ball hits ground, clear interval, decrement lives
        
        ballX = screenW / 2.5;
        ballY = screenH / 2.0;
        moveBallX = 2;
        moveBallY = 4;

        lives -= 1;
        if(lives == 0){
            hits = 0;
            hitCeiling = false;
            hitFirstRow = false;
            hitSecondRow = false;
            clearInterval(currentInterval);    
        }
    }
    
    //handle brick collisions
    ballInRow = Math.floor((ballY) / brickH);
    ballInCol = Math.floor((ballX) / brickW);
    if(((ballY) <= (numBrickRows * brickH))) {
        if((bricks[ballInRow][ballInCol] == 1)) {
            bricks[ballInRow][ballInCol] = 0;
            hits += 1;
            if((ballInRow == 2) && (!hitSecondRow)){
                hitSecondRow = true;
                moveBallX += 1; 
            }
            if((ballInRow == 1) && (!hitFirstRow)){
                hitFirstRow = true;
                moveBallX += 1;
            }
            if((hits == 4) || (hits == 12)){
                moveBallX += 1;
            }
            if((ballX == (ballInCol * brickW)) || (ballX == ((ballInCol+1) * brickW))){
                //hit left or right side
                moveBallX = -moveBallX;
            }
            else{
                // hit bottom or top
                moveBallY = -moveBallY;
            }
            switch(ballInRow){
                case 0: case 1:
                    score += 7;
                    break;
                case 2: case 3:
                    score += 5;
                    break;
                case 4: case 5:
                    score += 3;
                    break;
                case 6 : case 7: 
                    score += 1;
                    break;
                default:
                    break;
            }
            if(score == 448){
                level = 2;
                hits = 0;
                hitCeiling = false;
                hitFirstRow = false;
                hitSecondRow = false;
                setBricks();
                ballR = 7.5;
                ballX = screenW / 2.5;
                ballY = screenH / 2.0;
                if(directionY >= 0){
                    moveBallY = -moveBallY;
                }
                draw();
            }
            else if(score == 896){
                level = 'You Win';
                clearInterval(currentInterval);
            }
        }
    }
    
    // handle hitting paddle
    if(((ballY + moveBallY) >= (screenH - paddleH))){ 
        if(((ballX + moveBallX) >= paddleX) && ((ballX + moveBallX) <= (paddleX + paddleW))){
            // hits paddle
            
            if((ballX + moveBallX) < (paddleX + (paddleW * 0.2))){
                // hit far left of paddle
                if(directionX >= 0){
                    moveBallX = -(moveBallX);
                }else{
                    moveBallX = moveBallX;
                }
            }
            else if((ballX + moveBallX) < (paddleX + (paddleW * 0.4))){
                // hit left of paddle's middle
                if(directionX >= 0){
                    moveBallX = -(moveBallX);
                }else{
                    moveBallX = (moveBallX);
                }
            }
            else if((ballX + moveBallX) < (paddleX + (paddleW * 0.6))){
                // hit middle of paddle
                if(directionX >= 0){
                    moveBallX = (moveBallX);
                }else{
                    moveBallX = (moveBallX);
                }
            }
            else if((ballX + moveBallX) < (paddleX + (paddleW * 0.8))){
                // hit right of paddle's middle
                if(directionX >= 0){
                    moveBallX = (moveBallX);
                }else{
                    moveBallX = -(moveBallX);
                }
            }
            else if((ballX + moveBallX) <= (paddleX + paddleW)){
                // hit far right of paddle
                if(directionX >= 0){
                    moveBallX = (moveBallX);
                }else{
                    moveBallX = -(moveBallX);
                }
            }
            // move up only if ball is moving down
            if(directionY >= 0){
                moveBallY = -moveBallY;
            }
        }
    }
    
    // move ball in moveBallY and moveBallY direction
    ballX += moveBallX;
    ballY += moveBallY;
}

function movePaddle(){
    if(leftKey && ((paddleX - movePaddleX) >= 0)){
        paddleX -= movePaddleX;
    }else if(rightKey && ((paddleX+paddleW + movePaddleX) <= screenW)){
        paddleX += movePaddleX;
    }
}

function displayScoreBoard(score) {
	//Set the text font and color
	context.fillStyle = "white";
	context.font = "20px Futura";
	context.clearRect(0, screenH, screenW, 50);
    context.fillText('Level: ' + level, 10, screenH - 475);
	context.fillText('Score: ' + score, 200, screenH - 475);
	context.fillText('Lives: ' + lives, 390, screenH - 475);
    
}

function draw(){
    // clear canvas
    drawBackground();
    drawBall(); // draw ball
    drawPaddle(); // draw paddle
    drawBricks();
    moveBall(); // move ball
    movePaddle(); // move paddle
    displayScoreBoard(score);
    
}

window.onload = start;
window.onkeydown = checkKey;
window.onkeyup = stopPress;