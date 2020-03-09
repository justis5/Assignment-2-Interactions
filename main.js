
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function direction(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) return { x: dx / dist, y: dy / dist }; else return { x: 0, y: 0 };
}

function randomInt(n) {
    return Math.floor(Math.random() * n);
}

function Bullet(game, range) {
    this.radius = 2;
    this.name = "Bullet";
    this.color = "Yellow";
    this.effectiveRange = range;
    this.distance = range;
    this.maxSpeed = 100;
    this.thrown = false;

    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: 0, y: 0 };

};

Bullet.prototype = new Entity();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Bullet.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Bullet.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Bullet.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Bullet.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Bullet.prototype.update = function () {
    Entity.prototype.update.call(this);
    //  console.log(this.velocity);
    if (this.distance > 0) {
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;

        if (this.collideLeft() || this.collideRight()) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.thrown = false;
            if (this.collideLeft()) this.x = this.radius;
            if (this.collideRight()) this.x = 800 - this.radius;
            this.thrown = false;
        }

        if (this.collideTop() || this.collideBottom()) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.thrown = false;
            if (this.collideTop()) this.y = this.radius;
            if (this.collideBottom()) this.y = 800 - this.radius;
            this.thrown = false;
        }

        var chasing = false;
        for (var i = 0; i < this.game.entities.length; i++) {
            var ent = this.game.entities[i];
            if (ent !== this && ent.name === "Bullet" && this.collide(ent)) {
                var temp = { x: this.velocity.x, y: this.velocity.y };

                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            }
        }

        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.maxSpeed) {
            var ratio = this.maxSpeed / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
        }

        this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
        this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
        this.distance--;
    } else {
        this.removeFromWorld = true;
    }
};

Bullet.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};


function Enemy(game) {
    this.radius = 10;
    this.name = "Soldier";
    var classPick = Math.random();
    if (classPick <= 0.75) {
        this.class = "Infantry";
    } else if (classPick > 0.75 && classPick < 0.9) {
        this.class = "Sniper";
    } else {
        this.class = "MachineGun"
    }


    this.type = "Enemy";
    this.color = "Red";
    this.cooldown = 0;
    this.direction = { x: randomInt(1600) - 800, y: randomInt(1600) - 800 };
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (400 - this.radius * 2));

    this.velocity = { x: 0, y: 0 };
};

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.selectTarget = function () {
    var closest = 1000;
    var target = null;
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];

        if (ent.type === "Ally") {
            if (ent.name === "Squad") {
                ent.units.forEach(unit => {
                    var dist = distance(ent, this);
                    if (dist < closest) {
                        if (unit.alive) {
                            closest = dist;
                            target = unit;
                        }
                    }
                });


            }
            
        }
    }

   


    return target;
};

Enemy.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Enemy.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Enemy.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Enemy.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Enemy.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Enemy.prototype.update = function () {
    this.action = this.selectTarget();
    if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
    if (this.cooldown < 0) this.cooldown = 0;

    if (this.cooldown === 0 &&  this.action) {

        if (this.class === "MachineGun") {
            this.cooldown = 0.25;
        } else {
            this.cooldown = 1;
        }
        var target = this.action;
        var dir = direction(target, this);

        var bullet;
        if (this.class === "Sniper") {
            bullet = new Bullet(this.game, 100);
        } else {
            bullet = new Bullet(this.game, 50);
        }
       
        bullet.x = this.x + dir.x * (this.radius + bullet.radius + 20);
        bullet.y = this.y + dir.y * (this.radius + bullet.radius + 20);
        bullet.velocity.x = dir.x * bullet.maxSpeed;
        bullet.velocity.y = dir.y * bullet.maxSpeed;
        this.game.addEntity(bullet);
    }

    Entity.prototype.update.call(this);
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {

            if (ent.name === "ArtilleryRound") {
                console.log("dead");
                this.removeFromWorld = true;

            } else if (ent.name === "Bullet") {
                this.removeFromWorld = true;
            }
        }
    }

}

Enemy.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 100;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");
ASSET_MANAGER.queueDownload("./img/explosion.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();
    var enemy;
    gameEngine.addEntity(new Commander(gameEngine));

    for (var i = 0; i < 20; i++) {
        enemy = new Enemy(gameEngine);
        gameEngine.addEntity(enemy);
    }
    
    

    for (var k = 0; k < 30; k++) {
        troop = new Soldier(gameEngine);
        gameEngine.addEntity(troop);
    }

    gameEngine.init(ctx);
    gameEngine.start();
});


function artilleryStrike(game) {
    for (var j = 0; j < 5; j++) {
        shot = new ArtilleryRound(game, ASSET_MANAGER.getAsset("./img/explosion.png"));
        game.addEntity(shot);
        debugger;
    }

}