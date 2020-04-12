const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;
let bullets = [];
let ennemys = [];
let timer = new Date();
let lastEnnemySpawn = 0;
let lastShot = 0;
let ennemySpawnDelay = 2000;
let minBulletSize = 30;
let score = 0;

let Player = {
    x : 225,
    y : 475,
    width : 50,
    height : 25,
    color: "white",

    update : function(e) {
        let cursorX = e.clientX - (canvas.offsetLeft - canvas.width / 2);
        let cursorY = e.clientY - (canvas.offsetTop - canvas.height / 2);
        this.x = cursorX -  this.width / 2;
        this.x = (this.x >= canvas.width - this.width) ? canvas.width - this.width : this.x;
        this.x = (this.x <= 0) ? 0 : this.x;
    },
};

function Bullet(x) {
    this.width = 5;
    this.speed = 50;
    this.color = "white";
    this.x = x;
    this.y = canvas.height - Player.height - this.width / 2;

    this.collideEnnemy = function(bulletIndex) {
        for(index in ennemys) {
            let element = ennemys[index];

            if(Math.sqrt((element.x - this.x) ** 2 + (element.y - this.y) ** 2) <= element.width + this.width) {
                if(!element.secondLife) {
                    ennemys.splice(index, 1);
                    bullets.splice(bulletIndex, 1);
                    minBulletSize = (minBulletSize <= 10) ? 10 : minBulletSize -= 0.25;
                    score++;
                }else {
                    element.secondLife = false;
                    bullets.splice(bulletIndex, 1);
                    score++;
                }
            }
        }
    }

    this.update = function() {
        this.y -= canvas.height / this.speed;
    }
}

function Ennemy() {
    this.width = Math.round(Math.random() * (30 - minBulletSize)) + minBulletSize;
    this.secondLife = (Math.round(Math.random() * 10) == 1) ? true : false;
    this.secondLifeColor = "red";
    this.color = "white";
    this.speed = (this.secondLife) ? 200 : 100;
    this.x = Math.round(Math.random() * ((canvas.width - Player.width / 2) - (Player.width / 2)) + (Player.width / 2));
    this.y = 0;

    this.update = function() {
        this.y += canvas.height / this.speed;
    }

    this.touchFlour = function() {
        if(this.y >= canvas.height - Player.height - this.width) {
            return true;
        }

        return false;
    }
}

function ennemySpawn() {
    if(timer.getTime() >= lastEnnemySpawn + ennemySpawnDelay) {
        ennemySpawnDelay = (ennemySpawnDelay <= 600) ? 600 : ennemySpawnDelay - 20;
        lastEnnemySpawn = timer.getTime();
        return true;
    }

    return false;
}

function update() {
    timer = new Date();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath()
    ctx.rect(Player.x, Player.y, Player.width, Player.height);
    ctx.fillStyle = Player.color;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height - Player.height);
    ctx.lineTo(canvas.width, canvas.height - Player.height);
    ctx.strokeStyle = "white";
    ctx.stroke();

    for(currentBulletIndex in bullets) {
        let currentBullet = bullets[currentBulletIndex];
        currentBullet.update();
        ctx.beginPath()
        ctx.arc(currentBullet.x, currentBullet.y, currentBullet.width, 0, Math.PI * 2);
        ctx.fillStyle = currentBullet.color;
        ctx.fill();
        currentBullet.collideEnnemy(currentBulletIndex);
    }

    for(index in ennemys) {
        let currentEnnemy = ennemys[index];
        currentEnnemy.update();

        if(!currentEnnemy.secondLife) {
            ctx.beginPath()
            ctx.arc(currentEnnemy.x, currentEnnemy.y, currentEnnemy.width, 0, Math.PI * 2);
            ctx.fillStyle = currentEnnemy.color;
            ctx.fill();
        }else {
            ctx.beginPath()
            ctx.arc(currentEnnemy.x, currentEnnemy.y, currentEnnemy.width, 0, Math.PI * 2);
            ctx.fillStyle = currentEnnemy.secondLifeColor;
            ctx.fill();
        }

        if(currentEnnemy.touchFlour()) {
            ctx.font = "30px consolas";
            ctx.textAlign = "center";
            ctx.fillText("You lose", canvas.width / 2, canvas.height / 2);
            ctx.fillText("Score : " + score, canvas.width / 2, canvas.height / 2 + 40);
            return false;
        }
    }

    ennemySpawn() ? ennemys.push(new Ennemy()): false;

    requestAnimationFrame(update);
}

canvas.addEventListener("click", () => {
    if(timer.getTime() >= lastShot + 250) {
        lastShot = timer.getTime();
        bullets.push(new Bullet(Player.x + Player.width / 2));
    }
});

canvas.addEventListener("mousemove", (e) => Player.update(e));
requestAnimationFrame(update);