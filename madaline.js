const SPRITE_WIDTH = 8;
const STATES = ["standing", "running", "jumping", "falling", "skidding", "ldown", "lup"];
const HORIZONTAL_ACCELERATION = 1;
const VERTICAL_JUMP_ACCELERATION = 30;
const VERTICAL_FALL_ACCERLATION = 1;
const SCREEN_BUTTOM = 700;
const MAX_HORIZONTAL_VELOCITY = 15;
const MAX_VERTICAL_VELOCITY = 40;
const FRICTION = 0.9;
const DASH_COOLDOWN = 10;

class Madaline {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.facingRight = true;
        this.lastDash = 1000;

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/sheet.png");
        
        // standing, running, jumping, falling, skidding, ldown, lup
        this.state = "standing";
        this.jumps = 2;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {
        for (var jumps = 0; jumps < 3; jumps++) {
            this.animations[jumps] = [];
            for (var state = 0; state < STATES.length; state++) {
                this.animations[jumps][STATES[state]] = new Animator(this.spritesheet,
                    // States are back to back horizontally, and aligned vertically with 1 jump being at y=0 and the rest being stacked vetrtically starting at like 64
                    8 + SPRITE_WIDTH * state, (jumps === 1) ? 0 : 64 + SPRITE_WIDTH * jumps / 2, 
                    SPRITE_WIDTH, SPRITE_WIDTH, 1, 1, false, false, true);
            }
        }
    }

    draw(ctx) {
        this.animations[this.jumps][this.state].drawFrame(this.game.clockTick, ctx, this.x, this.y, 8, !this.facingRight);
    }

    clampNumber(number, clamp) {
        if (number > clamp) return clamp;
        if (number < -clamp) return -clamp;
        return number;
    }

    update() {
        if (this.lastDash < DASH_COOLDOWN) this.lastDash += 1;
        if (this.game.left && this.x > 0) {
            this.xVelocity -= HORIZONTAL_ACCELERATION;
            if (this.y >= SCREEN_BUTTOM) this.state = "running";
        }
        if (this.game.right && this.x < 950) {
            this.xVelocity += HORIZONTAL_ACCELERATION;
            if (this.y >= SCREEN_BUTTOM) this.state = "running";
        }
        if (this.y < SCREEN_BUTTOM) {
            this.yVelocity += VERTICAL_FALL_ACCERLATION;
            this.state =  (this.yVelocity > 0) ? "jumping" : "falling";
        }
        if (this.game.dash && this.jumps > 0 && this.lastDash >= DASH_COOLDOWN) {
            this.lastDash = 0;
            this.jumps -= 1;
        }
        if (this.y >= SCREEN_BUTTOM) {
            this.y = SCREEN_BUTTOM;
            this.yVelocity = 0;
            this.jumps = 2;
            if (this.game.jump) {
                this.yVelocity -= VERTICAL_JUMP_ACCELERATION;
            } else {
                if (!this.game.left && !this.game.right || (this.game.left && this.game.right)) this.xVelocity *= FRICTION;
                if (Math.abs(this.xVelocity) < 0.5) this.xVelocity = 0;
                if (Math.abs(this.xVelocity) <= 0) {
                    this.state = "standing";
                    if (this.game.down) this.state = "ldown";
                    if (this.game.up) this.state = "lup";
                }
            }
        }
        if (this.facingRight && this.xVelocity < 0) this.facingRight = false;
        if (!this.facingRight && this.xVelocity > 0) this.facingRight = true;

        this.xVelocity = this.clampNumber(this.xVelocity, MAX_HORIZONTAL_VELOCITY);
        this.yVelocity = this.clampNumber(this.yVelocity, MAX_VERTICAL_VELOCITY);
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        if (this.x < 0) this.x = 0;
        if (this.x > 950) this.x = 950;
    }
}

