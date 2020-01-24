export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    normalized() {
        let length = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));

        this.x /= length;
        this.y /= length;

        return this;
    }

    randomDeviation(minAngle=0.0125) {
        let angle = minAngle * Math.random() * Math.PI;

        if (Math.random() < 0.5) {
            angle *= -1;
        }

        let x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
        let y = this.x * Math.sin(angle) + this.y * Math.cos(angle);

        this.x = x;
        this.y = y;

        return this;
    }
}
