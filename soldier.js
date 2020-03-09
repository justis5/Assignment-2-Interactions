// JavaScript source code
function Soldier(game) {
    this.radius = 10;
    this.kills = 0;
    this.name = "Soldier";
    this.type = "Ally";
    this.color = "Green";
    this.cooldown = 0;
    this.direction = { x: randomInt(1600) - 800, y: randomInt(1600) - 800 };
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), 700 - (this.radius + Math.random() * (50 - this.radius * 2)));

    this.velocity = { x: 0, y: 0 };
};

Soldier.prototype = new Entity();
Soldier.prototype.constructor = Soldier;

Soldier.prototype.receiveOrder = function (order) {
    this.action = order;
};

Soldier.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Soldier.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Soldier.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Soldier.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Soldier.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Soldier.prototype.update = function () {
    Entity.prototype.update.call(this);
    // console.log(this.velocity);

    
        if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
        if (this.cooldown < 0) this.cooldown = 0;

        //if (this.cooldown > 0) console.log(this.action);
        this.velocity.x += this.action.direction.x;
        this.velocity.y += this.action.direction.y;
        
        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > maxSpeed) {
            var ratio = maxSpeed / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
        }

        if (this.collideLeft() || this.collideRight()) {
            this.velocity.x = -this.velocity.x * friction;
            if (this.collideLeft()) this.x = this.radius;
            if (this.collideRight()) this.x = 800 - this.radius;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
        }

        if (this.collideTop() || this.collideBottom()) {
            this.velocity.y = -this.velocity.y * friction;
            if (this.collideTop()) this.y = this.radius;
            if (this.collideBottom()) this.y = 800 - this.radius;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
        }    

        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
        

        for (var i = 0; i < this.game.entities.length; i++) {
            var ent = this.game.entities[i];
            if (ent !== this && this.collide(ent)) {

                if (ent.name === "ArtilleryRound") {
                    this.alive = false;
                } else if (ent.name === "Bullet") {
                    var hit = ent.distance / ent.effectiveRange; // 
                    var chance = Math.random();
                    if (hit > chance) {
                        this.alive = false;
                    }

                    
                }
            }
        }
        var target = this.action.target;
        if (target && this.cooldown === 0 && distance(target, this) <= 50) {
            this.cooldown = 1;
            var dir = direction(target, this);

            var bullet = new Bullet(this.game, 50);
            bullet.x = this.x + dir.x * (this.radius + bullet.radius + 20);
            bullet.y = this.y + dir.y * (this.radius + bullet.radius + 20);
            bullet.velocity.x = dir.x * bullet.maxSpeed;
            bullet.velocity.y = dir.y * bullet.maxSpeed;
            bullet.thrown = true;
            bullet.thrower = this;
            this.game.addEntity(bullet);
        }

       
    
}

Soldier.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};