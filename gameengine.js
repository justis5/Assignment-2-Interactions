// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011
window.onload = function () {
    var socket = io.connect("http://24.16.255.56:8888");

    socket.on("load", function (prior) {
        gameEngine.entities = [];
        gameEngine = new GameEngine();
        console.log(prior.data);
        gameEngine.loadState(prior.data);
        
    });

    var text = document.getElementById("text");
    var saveButton = document.getElementById("save");
    var loadButton = document.getElementById("load");

    saveButton.onclick = function () {
        console.log("save");
        var data;
        if (gameEngine) {
            // debugger;
            
            data = { entities: gameEngine.saveState(), timer: gameEngine.timer.saveState(), clockTick: gameEngine.clockTick };
            // var jsonData = JSON.stringify(data);

        }
        debugger;
        text.innerHTML = "Saved."
        if (data) {
            socket.emit("save", { studentname: "Justin Sim", statename: "aState", data: data });
        } else {
            socket.emit("save", { studentname: "Justin Sim", statename: "aState", data: "Goodbye World" });
        }
    };

    loadButton.onclick = function () {
        console.log("load");
        text.innerHTML = "Loaded."
        socket.emit("load", { studentname: "Justin Sim", statename: "aState" });
    };

};

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

Timer.prototype.saveState = function () {
    return { gameTime: this.gameTime, wallLastTimestamp: this.wallLastTimestamp };
}

function GameEngine() {
    this.entities = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.reinitialize = function (ctx, timeInfo) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    this.timer.gameTime = timeInfo.gameTime;
    this.timer.wallLastTimestamp = timeInfo.wallLastTimestamp;
    console.log('game initialized');
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        return { x: x, y: y };
    }

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        //console.log(getXandY(e));
        that.mouse = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("click", function (e) {
        //console.log(getXandY(e));
        that.click = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("wheel", function (e) {
        //console.log(getXandY(e));
        that.wheel = e;
        //       console.log(e.wheelDelta);
        e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("contextmenu", function (e) {
        //console.log(getXandY(e));
        that.rightclick = getXandY(e);
        e.preventDefault();
    }, false);

    console.log('Input started');
}

GameEngine.prototype.saveState = function () {
    var entitiesCount = this.entities.length;
    var entitiesCopy = [];
    debugger;
    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];
        var data = entity.saveState();
        entitiesCopy.push(data);

    }
    return entitiesCopy;
}

GameEngine.prototype.loadState = function (data) {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    
    var entitiesCount = data.entities.length;
    var i;
    var entity;
    var commanderIndex;
    for (i = 0; i < entitiesCount; i++) {
        entity = data.entities[i];
        if (entity.name === "Commander") {
            commanderIndex = i;
            var commander = new Commander(this);
            commander.loadState(entity);
            gameEngine.addEntity(commander);
        } else if (entity.name === "Soldier") {
            var soldier = new Soldier(this);
            soldier.loadState(entity);
            gameEngine.addEntity(soldier);
        } else if (entity.name === "Squad") {
            var squad = new Squad(this, entity.x, entity.y);
            squad.loadState(entity);
            gameEngine.addEntity(squad);
        } else if (entity.name === "EnemySoldier") {
            var enemySoldier = new Enemy(this);
            enemySoldier.loadState(entity);
            this.addEntity(enemySoldier);
        } else if (entity.name === "Bullet") {
            var bullet = new Bullet(this, entity.effectiveRange);
            bullet.loadState(entity);
            this.addEntity(bullet);
        } else if (entity.name === "ArtilleryRound") {
            var shot = new ArtilleryRound(this, ASSET_MANAGER.getAsset("./img/explosion.png"));
            shot.loadState(entity);
            this.addEntity(shot);
        } 
        
    }

    for (i = 0; i < entitiesCount; i++) {

        entity = gameEngine.entities[i];
        if (entity.name === "Squad") {
            gameEngine.entities[commanderIndex].squads.push(entity);
        }

    }

    this.reinitialize(ctx, data.timer);
    this.clockTick = data.clockTick;
    this.start();

}

GameEngine.prototype.addEntity = function (entity) {
    // console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
    this.rightclick = null;
    this.wheel = null;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}
