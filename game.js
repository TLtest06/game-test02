const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = { 
    x: 50, 
    y: canvas.height - 60, 
    width: 50, 
    height: 50, 
    dy: 0, 
    gravity: 0.5, 
    jumpPower: -10, 
    onGround: true 
};
let obstacles = [];
let collectibles = [];
let score = 0;
let gameState = "start"; // Các trạng thái: start, playing, gameOver
let leftPressed = false;
let rightPressed = false;
let jumpPressed = false;

// Tạo chướng ngại vật
function createObstacles() {
    const obstacleHeight = 40; // Chiều cao chướng ngại vật nhỏ hơn
    const gap = 200; // Khoảng trống giữa các chướng ngại vật lớn hơn
    const lastObstacle = obstacles[obstacles.length - 1];

    // Kiểm tra nếu không có chướng ngại vật nào hoặc khoảng cách đủ lớn
    if (lastObstacle === undefined || (canvas.width - lastObstacle.x) > gap) {
        const obstacleY = canvas.height - obstacleHeight; // Chướng ngại vật dưới
        obstacles.push({ x: canvas.width, y: obstacleY, width: 50, height: obstacleHeight });
    }
}

// Tạo điểm thưởng
function createCollectible() {
    const collectibleX = Math.random() * (canvas.width - 20);
    const collectibleY = canvas.height - 80; // Để điểm thưởng gần mặt đất
    const collectible = { x: collectibleX, y: collectibleY, width: 20, height: 20 };

    // Chỉ thêm điểm thưởng nếu không có quá nhiều điểm thưởng hiện tại
    if (collectibles.length < 5) {
        collectibles.push(collectible);
    }
}

// Cập nhật game
function update() {
    if (gameState === "playing") {
        player.dy += player.gravity;
        player.y += player.dy;

        // Xử lý nhảy
        if (jumpPressed && player.onGround) {
            player.dy = player.jumpPower;
            player.onGround = false;
        }

        // Rơi xuống đất
        if (player.y >= canvas.height - player.height) {
            player.y = canvas.height - player.height;
            player.onGround = true;
        }

        // Tạo chướng ngại vật
        if (Math.random() < 0.02) {
            createObstacles();
        }

        // Tạo điểm thưởng với xác suất hạn chế
        if (Math.random() < 0.03) { // Hạn chế hơn
            createCollectible();
        }

        // Di chuyển chướng ngại vật
        obstacles.forEach((obstacle, index) => {
            obstacle.x -= 2; // Di chuyển chướng ngại vật sang trái

            // Kiểm tra va chạm
            if (
                player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y
            ) {
                gameState = "gameOver"; // Kết thúc game
            }

            // Xóa chướng ngại vật khi nó ra khỏi màn hình
            if (obstacle.x + obstacle.width < 0) {
                obstacles.splice(index, 1);
            }
        });

        // Di chuyển điểm thưởng
        collectibles.forEach((collectible, index) => {
            if (
                player.x < collectible.x + collectible.width &&
                player.x + player.width > collectible.x &&
                player.y < collectible.y + collectible.height &&
                player.y + player.height > collectible.y
            ) {
                score++; // Tăng điểm
                collectibles.splice(index, 1); // Xóa điểm thưởng
            }
        });

        // Cập nhật di chuyển nhân vật
        if (leftPressed && player.x > 0) {
            player.x -= 5; // Di chuyển sang trái
        }
        if (rightPressed && player.x < canvas.width - player.width) {
            player.x += 5; // Di chuyển sang phải
        }
    }
}

// Vẽ game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ nhân vật
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Vẽ chướng ngại vật
    ctx.fillStyle = "red";
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Vẽ điểm thưởng
    ctx.fillStyle = "yellow";
    collectibles.forEach(collectible => {
        ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
    });

    // Hiển thị điểm số
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);

    // Thông báo bắt đầu game
    if (gameState === "start") {
        ctx.fillText("Press Enter or Click to Start", canvas.width / 4, canvas.height / 2);
    }

    // Thông báo game over
    if (gameState === "gameOver") {
        ctx.fillText("Game Over", canvas.width / 2 - 40, canvas.height / 2);
        ctx.fillText("Score: " + score, canvas.width / 2 - 40, canvas.height / 2 + 30);
        ctx.fillText("Press Enter or Click to Restart", canvas.width / 4, canvas.height / 2 + 60);
    }

    // Vẽ nút điều khiển
    if (gameState === "playing") {
        drawControls();
    }
}

// Vẽ nút điều khiển
function drawControls() {
    ctx.fillStyle = "lightgray";
    ctx.fillRect(10, canvas.height - 80, 70, 50); // Nút trái
    ctx.fillRect(90, canvas.height - 80, 70, 50); // Nút phải
    ctx.fillRect(170, canvas.height - 80, 70, 50); // Nút nhảy

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("←", 40, canvas.height - 50);
    ctx.fillText("→", 120, canvas.height - 50);
    ctx.fillText("↑", 200, canvas.height - 50);
}

// Khởi động lại game
function resetGame() {
    player.x = 50;
    player.y = canvas.height - 60;
    player.dy = 0;
    player.onGround = true;
    obstacles = [];
    collectibles = [];
    score = 0;
    gameState = "playing";
}

// Sự kiện nhấn chuột để bắt đầu game
canvas.addEventListener('mousedown', () => {
    if (gameState === "start" || gameState === "gameOver") {
        gameState = "playing"; // Bắt đầu trò chơi
        resetGame(); // Khởi động lại trò chơi
    }
});

// Điều khiển bàn phím
document.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        if (gameState === "start" || gameState === "gameOver") {
            gameState = "playing"; // Bắt đầu trò chơi
            resetGame(); // Khởi động lại trò chơi
        }
    }
    if (event.key === "ArrowLeft") {
        leftPressed = true; // Di chuyển sang trái
    }
    if (event.key === "ArrowRight") {
        rightPressed = true; // Di chuyển sang phải
    }
    if (event.key === "ArrowUp" && player.onGround) {
        jumpPressed = true; // Nhảy
    }
});

// Sự kiện nhả phím
document.addEventListener('keyup', (event) => {
    if (event.key === "ArrowLeft") {
        leftPressed = false; // Ngừng di chuyển sang trái
    }
    if (event.key === "ArrowRight") {
        rightPressed = false; // Ngừng di chuyển sang phải
    }
    if (event.key === "ArrowUp") {
        jumpPressed = false; // Ngừng nhảy
    }
});

// Ngừng di chuyển khi nhả chuột
canvas.addEventListener('mouseup', () => {
    leftPressed = false;
    rightPressed = false;
    jumpPressed = false;
});

// Vòng lặp game
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Bắt đầu vòng lặp game
gameLoop();
