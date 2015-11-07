var game = {
    bases: [],
    rockets: [],
    explosions: [],
    monkeys: [new Monkey({x: settings.CW/2, y: settings.CH*0.95})],
    score: 0,
    level: 1,
    lost: false,
    display: 'titles',
    clearCanvas: function(){
        ctx.clearRect(0, 0, settings.CW, settings.CH);
    },
    update: function() {
        if(this.display=='action'){
            if(gDATA.userClick.newClick){
                this.tryToShoot()
                gDATA.userClick.newClick = false;
            }
            level.update();
            this.updateUserRockets();
            this.updateExplosions();
            this.updateMonkeys();
        } else {
            if(this.display=='titles'){
                if(gDATA.userClick.newClick){
                    gDATA.userClick.newClick = false;
                    level.init();
                    if(this.lost){
                        this.score = 0;
                        level.maxRockets = 5;
                    } else {
                        level.maxRockets+= 0.4;
                    }
                    level.incoming = Math.min( 10 + game.level, 30);
                    this.display = 'action';
                    this.lost = false;
                }
            }
        }
    },
    draw: function(){
        this.clearCanvas();
        this.drawBackGround();
        this.drawBases();

        if(this.display=='action'){
            this.drawUserRockets();
            this.drawExplosions();
            this.drawMonkeys();
            level.draw();
        } else {
            if(this.display=='titles'){
                titles.draw();
            }
        }
    },
    over: function(){
        this.display = 'titles';
        this.lost = true;
        this.score+= this.level*this.level*10; //{TODO} better score formula
        this.level = 1;
    },
}

game.drawBackGround = function(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0, settings.CW, settings.CH);
    helpers.drawFromData("yellow", {x:0, y: 0} , gDATA.bg);
}
game.drawBases = function(){
    for(var i=0;i<this.bases.length;i++){
        this.bases[i].draw();
    }
}
game.drawUserRockets = function(){
    for(var i=0;i<this.bases.length;i++){
        for(var j=0;j<this.bases[i].rockets.length;j++){
            this.bases[i].rockets[j].draw();
        }
    }
}
game.drawExplosions = function(){
    for(var i=0; i<this.explosions.length; i++){
        this.explosions[i].draw();
    }
}
game.drawMonkeys = function(){
    for(var i=0; i<this.monkeys.length;i++){
        this.monkeys[i].draw();
    }
}
game.updateMonkeys = function(){
    for(var i=0; i<this.monkeys.length;i++){
        this.monkeys[i].update();
    }
}
game.updateUserRockets = function(){
    for(var i=0;i<this.bases.length;i++){
        for(var j=0;j<this.bases[i].rockets.length;j++){
            this.bases[i].rockets[j].update();
        }
        this.bases[i].rockets = helpers.tryToDestroy(this.bases[i].rockets);
    }
}
game.updateExplosions = function(){
    for(var i=0; i<this.explosions.length; i++){
        this.explosions[i].update();
    }
    this.explosions = helpers.tryToDestroy(this.explosions);
}

game.tryToShoot = function(){
    if(gDATA.userClick.y > settings.CH*0.8){ return false; }
    var activeBases = [];

    for(var i=0;i<this.bases.length;i++){
        if(this.bases[i].ammo>0){
            activeBases.push({ dis: helpers.distance(this.bases[i], gDATA.userClick), ref: this.bases[i] });
        }
    }

    if(activeBases.length <= 0){ console.log('no more ammo'); return false; }
    var min = activeBases[0];

    for(var i=1; i<activeBases.length; i++){
        if(activeBases[i].dis < min.dis){
            min = activeBases[i];
        }
    }
    min.ref.launch();
}

var titles = {
    draw: function(){
        var a = "Barak's Missile Command";
        var b = "";//"Bonus score: " + "--number";
        var c = "Score: " + game.score;
        var textSize = (settings.CH+settings.CW)/50;
        if(!game.lost){
            var d = "Click to start level " + game.level;
        } else {
            var d = "YOU LOST, click to play a new game";
        }

        ctx.fillStyle = "#ddf";
        ctx.font = "Bold " + textSize + "pt Arial";
        ctx.fillText(a, settings.CW/3, settings.CH/10);
        ctx.font = textSize*0.8 + "pt Arial";
        ctx.fillStyle = "white";
        ctx.fillText(b, settings.CW/3, settings.CH/4);
        ctx.fillText(c, settings.CW/3, settings.CH/3);
        ctx.fillText(d, settings.CW/3, settings.CH/1.5);
    }
}

var level = {
    maxRockets: 5,
    incoming: 10,
    enemyRockets: [],
    villages: [],
    init: function(){
        game.bases = [];
        game.rockets = [];
        game.explosions = [];
        this.incoming = 10;
        this.enemyRockets = [];
        this.villages = [];
        for(var i=0; i<6; i++){
            this.villages[i] = new Village(gDATA.villages[i]);
        }
        for(var i=0;i<3;i++){
            var b = new Base(i);
            game.bases.push(b);
        }
    },
    update: function(){
        if(game.bases.length<=0){
            game.over();
            return false;
        }
        if(this.enemyRockets.length==0 && this.incoming==0){
            this.win();
            return true;
        }
        for(var i=0;i<this.enemyRockets.length;i++){
            this.enemyRockets[i].update();
        }
        this.enemyRockets = helpers.tryToDestroy(this.enemyRockets);
        this.villages = helpers.tryToDestroy(this.villages);
        game.bases = helpers.tryToDestroy(game.bases);

        if(this.incoming>0 && this.enemyRockets.length<Math.floor(this.maxRockets)){
            this.launchEnemyRocket();
        }
    },
    launchEnemyRocket: function(){
        if(Math.random() < 0.01 + (game.level/100+0.01)/2){
            var p = Math.floor(Math.random()*settings.CW);
            var targetA = Math.floor(Math.random()*(this.villages.length));
            var targetB = Math.floor(Math.random()*(game.bases.length));
            var target = (Math.random() < 0.5 && this.villages.length>0) ? this.villages[targetA] : game.bases[targetB];
            this.enemyRockets.push(new Rocket({x: p, y:0}, target));
            this.incoming--;
        }
    },
    draw: function(){
        for(var i=0;i<this.enemyRockets.length;i++){
            this.enemyRockets[i].draw();
        }
        for(var i=0;i<this.villages.length;i++){
            this.villages[i].draw();
        }
    },
    win: function(){
        game.display = "titles";
        game.score+= game.level*game.level*10; //{TODO} better score formula
        game.level++;
    }
}

function Base(idx){
    this.active = true;
    this.ammo = 10;
    this.idx = idx;
    this.x = gDATA.bases[idx].x;
    this.y = gDATA.bases[idx].y;
    this.rockets = [];
}
Base.prototype.launch = function(){
    this.rockets.push(new Rocket(this, gDATA.userClick));
    this.ammo--;
}
Base.prototype.draw = function(){
    if(this.ammo==0){
        ctx.fillStyle = "purple";

        ctx.fillRect(this.x-settings.CW*0.02, this.y+settings.CH*0.02, settings.CW*0.04, settings.CH*0.02);
    }    
    this.drawAmmo();
}
Base.prototype.drawAmmo = function(){
    var bullets = gDATA.bases[this.idx].bullets;
    for(var i=0; i<this.ammo; i++){

        helpers.drawFromData("red", bullets[i], gDATA.ammo);
    }
}

function Rocket(origin, target){
    this.active = true;
    this.x = origin.x;
    this.y = origin.y;
    this.launchX = origin.x;
    this.launchY = origin.y;
    this.destination = target;
    if(origin.y < settings.CH*0.82){
        this.speed = (game.level+14)/15 * settings.speed*(1-Math.random()/4);
    } else {
        this.speed = settings.speed*12;
    }
    this.speed*= ( settings.CW + settings.CH )/2900;
    this.vx = (target.x-origin.x) / (Math.abs(target.x-origin.x)+Math.abs(target.y-origin.y)) * this.speed;  //{TODO} better formula
    this.vy = (target.y-origin.y) / (Math.abs(target.x-origin.x)+Math.abs(target.y-origin.y)) * this.speed;
}
Rocket.prototype.draw = function(){
    ctx.strokeStyle='white';
    ctx.lineWidth=Math.floor((settings.CW+settings.CH)/300);
    ctx.beginPath();
    ctx.moveTo(this.launchX, this.launchY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
}
Rocket.prototype.update = function(){
    this.x += this.vx;
    this.y += this.vy;
    if((Math.abs(this.y - this.destination.y) <this.speed/2) && (Math.abs(this.x - this.destination.x) <this.speed/2)){
        this.active = false;
        if(this.launchY>settings.CH*0.8){
            game.explosions.push(new Explosion(this.destination));
        } else {
            this.destination.active = false;
        }
    }
}

function Explosion(where){
    this.x = where.x;
    this.y = where.y;
    this.active = true;
    this.counter = 0;
    this.fullRadius = (settings.CW+settings.CH)/40;
    this.radius = 0;
}
Explosion.prototype.update = function(){
    this.counter++;
    this.tryToCollide();
    if(this.counter>=25){
        this.active = false;
    }
}
Explosion.prototype.draw = function(){
    this.radius =  5+(this.fullRadius-5)*this.counter/25;
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(this.x, this.y,this.radius, 0, Math.PI*2);
    ctx.fill();
}
Explosion.prototype.tryToCollide = function(){
    for(var i=0; i<level.enemyRockets.length; i++){
        var r = level.enemyRockets[i];
        if(this.x+this.radius > r.x && this.x-this.radius<r.x && this.y+this.radius > r.y && this.y-this.radius<r.y){
            r.active = false;
            game.explosions.push(new Explosion(r));
        }
    }
}

function Village(where){
    this.x = where.x;
    this.y = where.y;
    this.active = true;
}
Village.prototype.draw = function(){
    var startAt = { x: this.x-settings.CW*0.02, y: this.y-settings.CH*0.02};

    helpers.drawFromData("green", startAt, gDATA.house);
    helpers.drawFromData("blue", startAt, gDATA.houseRoof);

}


function superBullet(target, origin){
    this.x = origin.x;
    this.y = origin.y;
    this.goal = target;
    this.active = true;
    this.vx = 3333;
    this.vy = 3333;
}
function Monkey(where){
    this.x = where.x;
    this.y = where.y;
    this.superBullets = [];
    this.active = true;
}
Monkey.prototype.update = function(){
    //this.tryToShoot();
}
Monkey.prototype.draw = function(){
    ctx.beginPath();
    ctx.fillStyle = "purple";
    ctx.arc(this.x, this.y,(settings.CW+settings.CH)/60, 0, Math.PI*2);
    ctx.fill();
}

Monkey.prototype.tryToShoot = function(){
    if(this.superBullets.length<=0){
        this.superBullets.push(new superBullet(6848964864684865446854/*TODO*/ ,this));
    }
}



$(document).ready(function(){
    setInterval(function() {
        game.update();
        game.draw();
        game.count++;
    }, 1000/settings.FPS);
});
