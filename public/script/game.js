// Dohvaćanje canvas elementa i postavljanje 2D konteksta
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Postavljanje dimenzija canvasa na veličinu prozora
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Globalne varijable za igru
let rightPressed = false; // Prati je li pritisnuta desna strelica
let leftPressed = false;  // Prati je li pritisnuta lijeva strelica
let score = 0;            // Trenutni broj bodova igrača
let highScore = 0;        // Najbolji rezultat, dohvaća se iz localStorage
let gameOver = false;     // Indikator završetka igre
let restartButton = null; // Restart gumb (njegove dimenzije i pozicija)

// Učitavanje najboljeg rezultata iz localStorage
if (localStorage.getItem('highScore')) {
    highScore = localStorage.getItem('highScore'); // Dohvaća najbolji rezultat ako postoji
}

// Objekt loptice
const ball = {
    x: canvas.width / 2,   // Početna pozicija loptice po x-osi (centar)
    y: canvas.height - 30, // Početna pozicija loptice po y-osi
    dx: 4,                 // Horizontalna brzina loptice
    dy: -4,                // Vertikalna brzina loptice
    radius: 10,            // Polumjer loptice
    color: '#0095DD'       // Boja loptice
};

// Objekt palice
const paddle = {
    height: 20,                  // Visina palice
    width: 150,                  // Širina palice
    x: (canvas.width - 150) / 2, // Početna x-pozicija palice (centrirano)
    color: '#FF0000'             // Boja palice
};

// Objekt za definiranje svojstava cigli
const brick = {
    totalCount: 10,  // Ukupan broj cigli
    width: 75,       // Širina svake cigle
    height: 20,      // Visina svake cigle
    color: '#0095DD' // Boja cigli
};

// Niz za pohranu svih cigli
let bricks = [];

// Generiranje cigli na nasumičnim pozicijama
function generateBricks() {
    bricks = []; // Resetira niz cigli
    for (let i = 0; i < brick.totalCount; i++) {
        const x = Math.random() * (canvas.width - brick.width); // Nasumična x-pozicija
        const y = Math.random() * (canvas.height / 3);          // Nasumična y-pozicija
        bricks.push({ x, y, status: 1 }); // Svaka cigla ima status 1 (vidljiva)
    }
}
generateBricks(); // Poziv funkcije za generiranje cigli na početku igre

// Detekcija pritiska tipki za pomicanje palice
function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true; // Postavlja indikator pritiska desne tipke
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true; // Postavlja indikator pritiska lijeve tipke
    }
}

// Detekcija otpuštanja tipki
function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false; // Postavlja indikator otpuštanja desne tipke
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false; // Postavlja indikator otpuštanja lijeve tipke
    }
}

// Provjera sudara loptice s ciglama
function collisionDetection() {
    let bricksRemaining = 0; // Broji koliko cigli još nije uništeno

    bricks.forEach((b) => {
        if (b.status === 1) { // Provjera je li cigla vidljiva
            bricksRemaining++;
            if (
                ball.x + ball.radius > b.x && // Loptica je desno od lijevog ruba cigle
                ball.x - ball.radius < b.x + brick.width && // Loptica je lijevo od desnog ruba cigle
                ball.y + ball.radius > b.y && // Loptica je ispod gornjeg ruba cigle
                ball.y - ball.radius < b.y + brick.height // Loptica je iznad donjeg ruba cigle
            ) {
                // Provjera smjera sudara
                if (
                    ball.x + ball.radius - ball.dx <= b.x || // Sudar s lijevom stranom cigle
                    ball.x - ball.radius - ball.dx >= b.x + brick.width // Sudar s desnom stranom cigle
                ) {
                    ball.dx = -ball.dx; // Preokreće horizontalni smjer loptice
                } else {
                    ball.dy = -ball.dy; // Preokreće vertikalni smjer loptice
                }
                b.status = 0;       // Označava ciglu kao uništenu
                score++;            // Povećava bodove
            }
        }
    });

    if (bricksRemaining === 0) { // Ako su sve cigle uništene
        gameOver = true;
        drawWinMessage(); // Prikazuje poruku za pobjedu
    }
}

// Crtanje loptice
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

// Crtanje palice
function drawPaddle() {
    ctx.save();
    ctx.shadowBlur = 15; // Efekt sjene
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();

    ctx.restore();
}

// Crtanje cigli
function drawBricks() {
    bricks.forEach((b) => {
        if (b.status === 1) { // Crta samo cigle koje nisu uništene
            ctx.save();
            ctx.shadowBlur = 10; // Efekt sjene
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.beginPath();
            ctx.rect(b.x, b.y, brick.width, brick.height);
            ctx.fillStyle = brick.color;
            ctx.fill();
            ctx.closePath();

            ctx.restore();
        }
    });
}

// Crtanje trenutnog i najboljeg rezultata
function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    ctx.fillText('Najbolji rezultat: ' + highScore, canvas.width - 10, 10);
    ctx.fillText('Bodovi: ' + score, canvas.width - 10, 30);
}

// Prikaz poruke "GAME OVER"
function drawGameOver() {
    ctx.save();
    ctx.font = "48px Arial";
    ctx.fillStyle = "#FF0000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    ctx.restore();

    drawRestartButton(); // Prikazuje restart gumb
}

// Prikaz poruke "YOU WIN"
function drawWinMessage() {
    ctx.save();
    ctx.font = "48px Arial";
    ctx.fillStyle = "#00FF00";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2);
    ctx.restore();

    drawRestartButton(); // Prikazuje restart gumb
}

// Crtanje gumba za restart
function drawRestartButton() {
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = (canvas.width - buttonWidth) / 2;
    const buttonY = canvas.height / 2 + 60;

    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    ctx.font = "20px Arial";
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("RESTART", canvas.width / 2, buttonY + buttonHeight / 2);
    ctx.restore();

    restartButton = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };
}

// Detekcija klika na restart gumb
canvas.addEventListener("click", function (event) {
    if (gameOver && restartButton) { // Provjera je li igra završena i gumb postoji
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (
            mouseX >= restartButton.x &&
            mouseX <= restartButton.x + restartButton.width &&
            mouseY >= restartButton.y &&
            mouseY <= restartButton.y + restartButton.height
        ) {
            resetGame(); // Poziva funkciju za ponovno pokretanje igre
        }
    }
});

// Resetiranje igre
function resetGame() {
    gameOver = false; // Resetira stanje igre
    score = 0;        // Resetira trenutne bodove
    ball.x = canvas.width / 2; // Postavlja lopticu na početnu poziciju
    ball.y = canvas.height - 30;
    ball.dx = 4;
    ball.dy = -4;
    paddle.x = (canvas.width - paddle.width) / 2; // Centriranje palice
    generateBricks(); // Ponovno generiranje cigli
    draw(); // Ponovno pokreće crtanje igre
}

// Glavna funkcija za crtanje elemenata igre
function draw() {
    if (gameOver) { // Provjera završetka igre
        if (bricks.every(b => b.status === 0)) {
            drawWinMessage(); // Pobjednička poruka
        } else {
            drawGameOver(); // Poruka za poraz
        }
        return; // Prekida daljnje crtanje
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Čisti canvas prije svakog frame-a
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    // Provjera sudara loptice s rubovima
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
        } else {
            gameOver = true; // Kraj igre ako loptica padne ispod palice
            if (score > highScore) { // Ažurira najbolji rezultat
                highScore = score;
                localStorage.setItem('highScore', highScore);
            }
        }
    }

    // Pomicanje palice
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += 7;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= 7;
    }

    // Pomicanje loptice
    ball.x += ball.dx;
    ball.y += ball.dy;

    requestAnimationFrame(draw); // Traži novi frame za crtanje
}

// Event listeneri za detekciju pritiska tipki
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

// Pokreće glavni loop igre
draw(); // Početni poziv za crtanje
