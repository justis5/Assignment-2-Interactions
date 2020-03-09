// JavaScript source code
function Squad(game, X, Y) {
    this.radius = 25;
    this.centerX = this.x - 50;
    this.centerY = this.y - 50;
    this.visualRadius = 500;
    this.name = "Squad";
    this.type = "Ally";
    this.color = "White";
    this.cooldown = 0;
    this.direction = { x: randomInt(1600) - 800, y: randomInt(1600) - 800 };
    this.units = [];
    this.ready = false;
    Entity.call(this, game, X, Y);
    // Entity.call(this, game, this.radius + Math.random() * (700 - this.radius * 2), 650 - (this.radius + Math.random() * (50 - this.radius * 2)));
    this.velocity = { x: 0, y: 0 };
};

Squad.prototype = new Entity();
Squad.prototype.constructor = Squad;

Squad.prototype.selectAction = function () {

    var action = { direction: { x: this.direction.x, y: this.direction.y }, target: null };
    var closest = 1000;
    var target = null;

    
    return action;
};

Squad.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Squad.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Squad.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Squad.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Squad.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Squad.prototype.update = function () {
    
   
    if (!this.advance) {
        this.centerX = this.x - 50;
        this.centerY = this.y - 50;
        var ready = true;
        for (var i = 0; i < this.units.length; i++) {
            if (!this.inPosition(i)) {
                var action = this.reposition(i);
                this.units[i].receiveOrder(action);
                this.units[i].update();
                ready = false;
            }

        }
        if (ready) {
            this.ready = true;
        }

    } else {

        if (!this.death) {
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;

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

            var chasing = false;
            var i;
            for (i = 0; i < this.game.entities.length; i++) {
                var ent = this.game.entities[i];
                if (ent !== this && this.collide(ent)) {
                    if (ent.name === "Squad") {
                        if (!ent.death) {
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
                }
                // var acceleration = 1000000;
                var acceleration = 10000;
                if (ent.name !== "Squad" && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
                    var dist = distance(this, ent);
                    if (dist > this.radius + ent.radius + 2) {
                        var difX = (ent.x - this.x) / dist;
                        var difY = (ent.y - this.y) / dist;
                        this.velocity.x += difX * acceleration / (dist * dist);
                        this.velocity.y += difY * acceleration / (dist * dist);
                    }
                    chasing = true;
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




            this.centerX = this.x - 50;
            this.centerY = this.y - 50;
            var deaths = 0;
            var ready = true;
            var target;
            var closest = 1000;
            for (i = 0; i < this.game.entities.length; i++) {
                var ent = this.game.entities[i];
                if (ent.type === "Enemy") {

                    var dist = distance(ent, this);
                    if (dist < closest) {
                        closest = dist;
                        target = ent;
                    }
                }
            }

            


            for (var i = 0; i < this.units.length; i++) {
                var soldier = this.units[i];
                if (soldier.alive && !this.inPosition(i)) {
                    var action = this.reposition(i);
                    if (target) {
                        action.target = target;
                    }
                    soldier.receiveOrder(action);
                    soldier.update();
                    ready = false;
                }

                if (!soldier.alive) {
                    deaths++;
                }

            }

            if (deaths === this.units.length) {
                this.death = true;
            }

            if (ready) {
                this.ready = true;
            }


        }

    }
    

    Entity.prototype.update.call(this);

    
    
    

}

Squad.prototype.reposition = function (index) {
    var action;
    if (index === 0) {
        action = { direction: { x: this.centerX - 50 - this.units[0].x, y: this.centerY - this.units[0].y }, target: null };
    } else if (index === 1) {
        action = { direction: { x: this.centerX - 25 - this.units[1].x, y: this.centerY - this.units[1].y }, target: null };
    } else if (index === 2) {
        action = { direction: { x: this.centerX - this.units[2].x, y: this.centerY - this.units[2].y }, target: null };
    } else if (index === 3) {
        action = { direction: { x: this.centerX + 25 - this.units[3].x, y: this.centerY - this.units[3].y }, target: null };
    }

    return action;


}

Squad.prototype.inPosition = function (index) {

    var factor = 12;
    var soldierPosition
    var centerPosition;
    if (index === 0) {
        soldierPosition = { x: Math.floor(this.units[index].x / factor), y: Math.floor(this.units[index].y / factor) }; 
        centerPosition = { x: Math.floor( (this.centerX - 50) / factor), y: Math.floor(this.centerY / factor)};

        
    } else if (index === 1) {
        soldierPosition = { x: Math.floor(this.units[index].x / factor), y: Math.floor(this.units[index].y / factor) };
        centerPosition = { x: Math.floor((this.centerX - 25) / factor), y: Math.floor(this.centerY / factor) };
    } else if (index === 2) {
        soldierPosition = { x: Math.floor(this.units[index].x / factor), y: Math.floor(this.units[index].y / factor) };
        centerPosition = { x: Math.floor(this.centerX / factor), y: Math.floor(this.centerY / factor) };
    } else if (index === 3) {
        soldierPosition = { x: Math.floor(this.units[index].x / factor), y: Math.floor(this.units[index].y / factor) };
        centerPosition = { x: Math.floor((this.centerX + 25) / factor), y: Math.floor(this.centerY / factor) };
    }
    return soldierPosition.x === centerPosition.x && soldierPosition.y === centerPosition.y;

    

}


Squad.prototype.draw = function (ctx) {
    /*
    this.centerX = this.x - 50;
    this.centerY = this.y - 50;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.centerX, this.centerY, 10, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    */

    for (var i = 0; i < this.units.length; i++) {
        var soldier = this.units[i];
        if (soldier.alive) {
            soldier.draw(ctx);
        }


    }

};