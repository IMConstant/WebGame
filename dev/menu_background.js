var canvas = document.getElementById("canvi");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

particles = [];
var max_length = 2000.0;
var minim;
var date = new Date();

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    get string() {
        return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
    }
}

class Particle {
    constructor(x, y, alpha, radius, movable) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.alpha = alpha;
        this.length = 1;
        this.radius = radius;
        this.color = 'red';
        this.time = -1;
        this.movable = movable;
    }
}

Particle.prototype.updateAnimation = function(_date) {
    if (this.time == -1) {
        return true;
    }

    var current_time = _date.getTime();
    var delta = current_time - this.time;

    if (delta > 4000.0) {
        this.color.a = this.alpha / 255.0;
        this.time = -1;

        this.x = this.startX;
        this.y = this.startY;
    }
    else {
        if (this.movable) {
            if (this.startX < canvas.width / 2) {
                this.x = this.startX + (delta / 4000.0) * (1 - this.length / max_length) * 10.0;
            }
            else {
                this.x = this.startX + (delta / 4000.0) * (1 - this.length / max_length) * 10.0;
            }
        }

        if (delta < 2000.0) {
            this.color.a = (this.alpha + (255 - this.alpha) * (delta / 2000.0)) / 255.0;
        }
        else {
            this.color.a = (255.0 - (255 - this.alpha) * (delta / 2000.0 - 1)) / 255.0;
        }
    }

    return false;
}

Particle.prototype.runAnimation = function(_date) {
    if (this.time == -1) {
        this.time = _date.getTime();
    }
}

function init() {
    function draw(event) {
        var x = event.clientX - canvas.getBoundingClientRect().left;
        var y = event.clientY - canvas.getBoundingClientRect().top;

        console.log(x, y);
    }

    function wheelUpdate(event) {
        var amount = event.deltaY;
        console.log(amount);

        if (amount < 0) {
            ctx.scale(2, 2);
        }
        else {
            ctx.scale(0.5, 0.5);
        }
    }

    //canvas.addEventListener("mousewheel", wheelUpdate, false);

    minim = Math.min(canvas.width, canvas.height);

    for (var i = 0; i < 12000; i++) {
        var angle = Math.random() * Math.PI * 2;
        var height_p = 0;
        var width_p = 0;
        var movable = false;

        if (i < 8000) {
            movable = true;
            height_p = Math.pow(Math.random(), 1.5) * minim * Math.sin(angle) * 0.03;
            width_p = Math.random() * minim * Math.cos(angle);
        }
        else if (i < 10000) {
            height_p = Math.pow(Math.random(), 1.5) * minim * Math.sin(angle) * 1;
            width_p = Math.random() * minim * Math.cos(angle);
        }
        else {
            height_p = Math.pow(Math.random(), 2) * minim * Math.sin(angle) * 0.115;
            width_p = Math.random() * minim * Math.cos(angle) * 0.115;
        }

        particles.push(new Particle(canvas.width / 2 + width_p, canvas.height / 2 + height_p,
            Math.floor(0.01 * Math.random() * 256),
            0.5 * (1.0 - Math.abs(height_p) / minim), movable));

        var vector = new Vector(canvas.width / 2 - particles[i].x, canvas.height / 2 - particles[i].y);
        var length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2)) * 1.0;

        particles[i].angle = 0.001 * Math.PI / length;
        particles[i].length = length;

        var color = new Color(Math.floor((particles[i].length / max_length) * 255),
            Math.floor(255 - (particles[i].length / max_length) * 255),
            Math.floor(255),
            Math.abs(particles[i].alpha) / 255.0);

        particles[i].color = color;

        if (Math.random() < 0.05) {
            particles[i].radius = 1.25;
        }
        else {
            particles[i].radius = 0.34;//0.2 + 0.8 * (1 - length / max_length);
        }
    }
}

function draw() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var count = 1 + Math.floor(Math.random() * 200);
    var first = Math.floor(Math.random() * particles.length);
    date = new Date();
    var current_time = date.getTime();

    ctx.save();
    ctx.beginPath();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    var gradient = ctx.createRadialGradient(0, 0, 30, 0, 0, minim / 9);
    gradient.addColorStop(0, 'rgba(230, 230, 230, 1)');
    gradient.addColorStop(.4, 'rgba(2, 100, 100, 1)');
    gradient.addColorStop(.9, 'rgba(0, 0, 0, 0.51)');
    ctx.arc(0, 0, minim / 2, 0, 2 * Math.PI, true);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();

    for (var i = 0; i < particles.length; i += 1) {
        ctx.fillStyle = particles[i].color.string;
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, particles[i].radius, 0, 2 * Math.PI, true);
        ctx.fill();

        if (particles[i].updateAnimation(date) && Math.random() < 0.05) {
            particles[i].runAnimation(date);
        }
    }


    ctx.save();
    ctx.beginPath();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale((canvas.width / 2) / (canvas.height / 15), 1);

    var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, minim / 6);
    gradient.addColorStop(0, 'rgba(0, 200, 200, 1)');
    gradient.addColorStop(.4, 'rgba(44, 0, 44, 0.31)');
    gradient.addColorStop(.9, 'rgba(0, 0, 0, 0.51)');
    ctx.arc(0, 0, minim / 2, 0, 2 * Math.PI, true);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();


    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, minim);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(.7, 'rgba(50, 0, 50, 0.51)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.arc(0, 0, minim / 2, 0, 2 * Math.PI, true);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
}


var run = function() {
    window.requestAnimationFrame(run);
    draw();
}

init()
run();