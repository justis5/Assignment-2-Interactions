// JavaScript source code
function Commander(game) {
    this.radius = 10;
    this.name = "Commander";
    this.type = "Ally";
    this.color = "Green";
    this.artilleryUsed = false;
    this.startOffensive = true;
    this.squads = [];
    this.front = true;
    this.x = this.radius + Math.random() * (800 - this.radius * 2);
    this.y = 780 - (this.radius + Math.random() * (50 - this.radius * 2));
    Entity.call(this, game, this.x, this.y);
};


Commander.prototype = new Entity();
Commander.prototype.constructor = Commander;

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

Commander.prototype.saveState = function () {
    /*
    var squadsClone = [];
    this.squads.forEach(squad => {
        var data = squad.saveState();
        squadsClone.push(data);
    })
    */
    return { name: this.name, x: this.x, y: this.y, startOffensive: this.startOffensive, artilleryUsed: this.artilleryUsed, front: this.front};
}

Commander.prototype.loadState = function (data) {
    this.x = data.x;
    this.y = data.y;
    this.startOffensive = data.startOffensive;
    this.artilleryUsed = data.artilleryUsed;
    this.front = data.front;
}


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


    debugger;
    if (readyToAdvance) {
        if (this.squads.length > 0 && !this.artilleryUsed) {
            this.artilleryUsed = true;
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