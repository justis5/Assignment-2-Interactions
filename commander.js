// JavaScript source code
function Commander(game) {
    this.radius = 10;
    this.kills = 0;
    this.name = "Commander";
    this.type = "Ally";
    this.color = "Green";
    this.startOffensive = true;
    this.cooldown = 0;
    this.squads = [];
    this.direction = { x: randomInt(1600) - 800, y: randomInt(1600) - 800 };
    this.front = true;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), 780 - (this.radius + Math.random() * (50 - this.radius * 2)));

    this.velocity = { x: 0, y: 0 };
};

Commander.prototype = new Entity();
Commander.prototype.constructor = Commander;

Commander.prototype.selectAction = function () {

    var action = { direction: { x: this.direction.x, y: this.direction.y }, throwRock: false, target: null };
    var closest = 1000;
    var target = null;
    return action;
};

Commander.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Commander.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Commander.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Commander.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Commander.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Commander.prototype.update = function () {
    Entity.prototype.update.call(this);
    var i;

    var newX = 125;
    var newY = 700;
    var readyToAdvance = true;
    for (i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];

        if (ent.name === "Soldier"  && ent.type === "Ally" && !ent.squad) {
            if (this.squads.length === 0) {
                var squad = new Squad(this.game, newX, newY);
                newX += 95;
                if (this.front) {
                    newY -= 100;
                } else {
                    newY += 100;
                }
                this.front = !this.front;
                squad.units.push(ent);
                
                this.squads.push(squad);
                this.game.addEntity(squad);
            } else {
                var currentSquad = this.squads[this.squads.length - 1];
                if (currentSquad.units.length >= 4) { // full
                    var squad = new Squad(this.game, newX, newY);
                    newX += 90;
                    if (this.front) {
                        newY -= 100;
                    } else {
                        newY += 100;
                    }
                    this.front = !this.front;
                    squad.units.push(ent);
                    this.squads.push(squad);
                    this.game.addEntity(squad);
                } else {
                    currentSquad.units.push(ent);

                }

            }

            ent.alive = true;
            ent.removeFromWorld = true;
            readyToAdvance = false;
        }


        if (ent !== this && this.collide(ent)) {

            if (ent.name === "ArtilleryRound") {
                this.removeFromWorld = true;

            }
        }
    }


    for (i = 0; i < this.squads.length; i++) {
        var check = this.squads[i];
        if (this.squads[i].ready === false) {
            readyToAdvance = false;
        }


    }

    if (readyToAdvance) {
        if (this.startOffensive) {
            artilleryStrike(this.game);
            this.startOffensive = false;
        }

        this.squads.forEach(squad => {
            squad.advance = true;
        });

    }


}


// https://stackoverflow.com/questions/4839993/how-to-draw-polygons-on-an-html5-canvas
Commander.prototype.draw = function (ctx) {
    ctx.beginPath();

    var numberOfSides = 5;
    size = 10;
    Xcenter = this.x;
    Ycenter = this.y;

    ctx.beginPath();
    ctx.moveTo(Xcenter + size * Math.cos(0), Ycenter + size * Math.sin(0));
    ctx.fillStyle = this.color;
    for (var i = 1; i <= numberOfSides; i += 1) {
        ctx.lineTo(Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides));
    }
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.stroke();
    /*
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    */
};