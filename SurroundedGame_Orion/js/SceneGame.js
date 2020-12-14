var gameSpeed = 1;

var leftEnemyQueue = [];
var rightEnemyQueue = [];
var lmb = false;
var rmb = false;
var self;
var weaponRange = 125;
var stunned = false;
var deadPile = [];
var distanceToMove;
var distanceMoved;
var kills = 0;
var maxEnemyHealth = 0;
var gameIsOver = false;
var isPaused = false;
var firstLeft = false;
var firstRight = false;

var absDistance = function ()
{
    return Math.abs(distanceToMove);
}

function ResetGame()
{
    gameSpeed = 1;

    leftEnemyQueue = [];
    rightEnemyQueue = [];
    lmb = false;
    rmb = false;
    self = null;
    weaponRange = 125;
    stunned = false;
    deadPile = [];
    distanceToMove = 0;
    distanceMoved = 0;
    kills = 0;
    maxEnemyHealth = 0;
    gameIsOver = false;
    isPaused = false;
}

class SceneGame extends Phaser.Scene 
{
    constructor() 
    {
            super({ key: "SceneGame" });
    }
    
    
    
    preload() 
    {
        this.load.image("healthIcon", "content/PixelHeart.png");
        
        this.load.spritesheet("IdleRight", "content/Player_IdleRight.png", { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("IdleLeft", "content/Player_IdleLeft.png", { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("AttackRight", "content/Player_SwingRight.png", { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("AttackLeft", "content/Player_SwingLeft.png", { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("Death", "content/Player_Death.png", { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("ZombieWalkLeft", "content/Zombie_WalkLeft.png", { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("ZombieWalkRight", "content/Zombie_WalkRight.png", { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("ZombieDieLeft", "content/Zombie_DieLeft.png", { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("ZombieDieRight", "content/Zombie_DieRight.png", { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("ZombieAttackLeft", "content/Zombie_AttackLeft.png", { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("ZombieAttackRight", "content/Zombie_AttackRight.png", { frameWidth: 16, frameHeight: 16});
        
        this.load.spritesheet("QuitButton", "content/QuitButton.png", { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("RetryButton", "content/RetryButton.png", { frameWidth: 16, frameHeight: 16});

        this.load.audio("explosionSound", "content/sndExplode.wav");
        this.load.audio("PlayerDeath", "content/PlayerDeath.wav");
        this.load.audio("hit01", "content/hit01.wav");
        this.load.audio("hit02", "content/hit02.wav");
        this.load.audio("hit03", "content/hit03.wav");
        this.load.audio("hit04", "content/hit04.wav");
        this.load.audio("miss", "content/miss.wav");
        this.load.audio("zAttack01", "content/zombieAttack01.wav");
        this.load.audio("zAttack02", "content/zombieAttack02.wav");
        this.load.audio("zDeath01", "content/zombieDeath01.wav");
        this.load.audio("zDeath02", "content/zombieDeath02.wav");
        this.load.audio("zDeath03", "content/zombieDeath03.wav");
        this.load.audio("zDeath04", "content/zombieDeath04.wav");
        
        this.load.audio("Click", "content/buttonClick.wav");
        this.load.audio("music", "content/music.wav");
    }
    
    //FUNCTIONS
    SpawnEnemy = function()
    {
        //Change these to difficulty based params
        let delay = Phaser.Math.Between(800/gameSpeed,3000/gameSpeed);
        if(!gameIsOver)
        {
        var timer = this.time.delayedCall(delay, this.SpawnEnemy, null, this);
        this.CreateEnemy(Phaser.Math.Between(0,1));
        }
    }
    
    CreateEnemy(direction)
    {
    if (direction<1)
        {
            //console.log("Spawned on left side");
            var enemy = this.enemies.create(-100, config.height-100, "ZombieWalkRight");
            enemy.setScale(4);
            enemy.setVelocityX(100*gameSpeed);
            enemy.play("ZombieWalkRight");
            enemy.health=[0];
            enemy.healthBars=[];
            enemy.isDead = false;
            enemy.inRange = false;
            enemy.isAttacking = false;
            this.CreateEnemyHealthQueue(Phaser.Math.Between(0,maxEnemyHealth), enemy);
            
            this.DrawEnemyHealth(enemy);
            leftEnemyQueue.push(enemy);
        }else
        {
            //console.log("Spawned on right side");
            var enemy = this.enemies.create(config.width + 100, config.height-100, "ZombieWalkLeft");
            enemy.setScale(4);
            enemy.setVelocityX(-100*gameSpeed);
            enemy.play("ZombieWalkLeft");
            enemy.health=[1];
            enemy.healthBars=[];
            enemy.isDead = false;
            enemy.inRange = false;
            enemy.isAttacking = false;
            this.CreateEnemyHealthQueue(Phaser.Math.Between(0,maxEnemyHealth), enemy);
            
            this.DrawEnemyHealth(enemy);
            rightEnemyQueue.push(enemy);
        }   
    }

    CreateEnemyHealthQueue(totalHP, enemy)
    {
        for(var i = 0; i < totalHP; i++)
            {
                enemy.health.push(Phaser.Math.Between(0,1));
            }
    }

    DrawEnemyHealth(enemy)
    {
    for(var i = 0; i < enemy.health.length; i++)
                {
                    var colorOfBar;
                    if(enemy.health[i] == 0) {colorOfBar = "0xac3232"}else{colorOfBar = "0x5b6ee1"}
                    enemy.healthBars.push(self.add.rectangle(enemy.x, enemy.y+36+(12*i), 32, 8, colorOfBar));
                }
    }

    EnemyAttack(enemy, direction)
    {
    var attackTimer = this.time.delayedCall(1000, function(){
            enemy.isAttacking = false;
        }, null, self);
        
        if(direction <= 0)
            {
                //Right facing attack animation
                enemy.play("ZombieAttackRight");
            }else
            {
                //Left facing attack animation
                enemy.play("ZombieAttackLeft");
            }
        this.sfx.zombieAttacks[Phaser.Math.Between(0,1)].play();
        
        if(this.player.health > 1)
        {
            this.player.health--;
            this.healthText.setText(this.player.health);
        }else if(!gameIsOver)
        {
            this.healthText.setText("0");
            this.GameOver();
            this.sfx.death.play();
            this.player.play("Death"); 
        }
        
    }

    EnemyHurt(enemy)
    {
        //Lose one health
        if(enemy.isDead){return;}
        
        if(enemy.healthBars[0]) //near the beginning of the EnemyHurt definition
        {
                enemy.healthBars[0].destroy();
                enemy.healthBars.shift();
                this.player.hitSounds[Phaser.Math.Between(0,3)].play();
        }
        
        for(var i = 0; i < enemy.healthBars.length; i++)
                {
                    enemy.healthBars[i].y = enemy.y+36+(12*i);
                }
        //Die if out of health
        if(enemy.health.length-1 <= 0 && !enemy.isDead)
        {
                //Replace with death animation
                
                //this.sfx.explosionSound.play();
                enemy.isDead;
                enemy.setVelocityX(0);
                enemy.play("ZombieDieLeft");
                deadPile.push(enemy);
                console.log("Gamespeed at: " + gameSpeed);
                gameSpeed += 0.001;
                kills++;
                this.killsText.setText(kills);
                this.speedText.setText("Speed: " + Phaser.Math.RoundTo(gameSpeed, -1) + "x");
                if(enemy.health[0] == 0)
                {
                    leftEnemyQueue.shift();
                }else
                {
                    rightEnemyQueue.shift();
                }
                this.sfx.zombieDeaths[Phaser.Math.Between(0,3)].play();
                this.CheckDifficultyRamp();
                enemy.health.shift();
                return;
        }else if(enemy.health[0] != enemy.health[1])
        {//Swap sides if needed
            if(enemy.health[0] == 1)
                {
                    //Swap to the left side
                    leftEnemyQueue.unshift(enemy);
                    enemy.play("ZombieWalkRight");
                    enemy.x = self.player.x-200;
                    rightEnemyQueue.shift(); 
                }else
                {
                    //Swap to the right side
                    rightEnemyQueue.unshift(enemy);
                    enemy.play("ZombieWalkLeft");
                    enemy.x = self.player.x+200;
                    leftEnemyQueue.shift(); 
                }
            enemy.health.shift();
            enemy.inRange = true;
        }else
        {
            if(enemy.health[1] == 1)
                {
                    enemy.x = enemy.x+100;
                    enemy.play("ZombieWalkLeft");
                }else
                {
                    enemy.x = enemy.x-100;
                    enemy.play("ZombieWalkRight");
                }
            enemy.health.shift();
            enemy.inRange = true;
        }
        
            
        
        //otherwise play hurt animation?
    }

    StunPlayer()
    {
        stunned = true;
        this.missText.setScale(1);
        var timer = this.time.delayedCall(1000, function(){
            stunned = false;
            this.missText.setScale(0);
        },
        null, self);
        
    }

    MoveWorld = function()
    {
        //console.log("Moving " + (distanceToMove) + " Distance.");
        this.increment = 0;
        if(distanceToMove > 0)
            {
                this.increment = 10;
            }else if (distanceToMove < 0)
            {
                this.increment = -10;
            }

        if(distanceToMove > 10 && distanceMoved < distanceToMove)
        {
            //console.log("moving World");
            var timer = this.time.delayedCall(10, this.MoveWorld, null, self);
            this.MoveWorldIterator(this.increment);
        }else if(distanceToMove < -10 && distanceMoved > distanceToMove)
        {
            var timer = this.time.delayedCall(10, this.MoveWorld, null, self);
            this.MoveWorldIterator(this.increment);
        }else
        {
            distanceMoved = 0;
        }
    }
    
    MoveWorldIterator(increment)
    {
        for(var rq = 0; rq < rightEnemyQueue.length; rq++)
            {
                rightEnemyQueue[rq].x += increment;
            }
        for(var lq = 0; lq < leftEnemyQueue.length; lq++)
            {
               leftEnemyQueue[lq].x += increment;
            }
        for(var dp = 0; dp < deadPile.length; dp++)
            {
               deadPile[dp].x += increment;
                if(deadPile[dp].x > config.width + 16 || deadPile[dp].x < - 16)
                {
                    deadPile[dp].destroy();
                    deadPile.slice(dp, 1,);
                }
            }
            distanceToMove -= increment;
    }

    CheckDifficultyRamp()
    {
        if(kills > 2000)
           {
           maxEnemyHealth = 5;
           }else if(kills > 1000)
           {
               maxEnemyHealth = 4;
           }else if(kills > 600)
           {
               maxEnemyHealth = 3;
           }else if(kills > 250)
           {
               maxEnemyHealth = 3;
           }else if(kills > 100)
           {
               maxEnemyHealth = 2;
           }else if(kills > 25)
           {
               maxEnemyHealth = 1;
           }
    }

    GameOver() 
    {
        //Play player death animation
        //Display GAME OVER
        this.gameOverText = this.add.text(config.width/2,86, "Game Over", {fontFamily: "Arcadepix", fontSize: '64px', fill: '#fff', align: 'center'});
        this.gameOverText.setOrigin(0.5);
        
        //Enable restart and exit buttons
        this.buttonRetry.setScale(4);
        this.buttonQuit.setScale(4);
        
        gameIsOver = true;
    }
    
    //Main Events
    create() 
    {
        self = this;
    
    this.input.mouse.disableContextMenu();
        
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);//Pause key
        
    this.player = this.physics.add.sprite(config.width/2, config.height-100, "IdleLeft");
    this.player.setCollideWorldBounds(true);
    
    this.player.setScale(4);
    this.player.health = 10;
    this.player.stamina = 100;
    this.player.leftWeaponRangeBar = this.add.rectangle(this.player.x - weaponRange/2, this.player.y + 46, weaponRange-24, 16, 0xac3232);
    this.player.rightWeaponRangeBar = this.add.rectangle(this.player.x + weaponRange/2, this.player.y + 46, weaponRange-24, 16, 0x5b6ee1);
    
    this.enemies = this.physics.add.group();
        
    this.sfx = {
        hit01: this.sound.add("hit01"),
        hit02: this.sound.add("hit02"),
        hit03: this.sound.add("hit03"),
        hit04: this.sound.add("hit04"),
        miss: this.sound.add("miss"),
        death: this.sound.add("PlayerDeath"),
        zAttack01: this.sound.add("zAttack01"),
        zAttack02: this.sound.add("zAttack02"),
        zDeath01: this.sound.add("zDeath01"),
        zDeath02: this.sound.add("zDeath02"),
        zDeath03: this.sound.add("zDeath03"),
        zDeath04: this.sound.add("zDeath04"),
        click: this.sound.add("Click"),
        music: this.sound.add("music")
    };
        
    this.player.hitSounds = [this.sfx.hit01, this.sfx.hit02, this.sfx.hit03, this.sfx.hit04];
    this.sfx.zombieAttacks = [this.sfx.zAttack01, this.sfx.zAttack02];
    this.sfx.zombieDeaths = [this.sfx.zDeath01,this.sfx.zDeath02,this.sfx.zDeath03,this.sfx.zDeath04];
    
    this.sfx.music.play();
        this.sfx.music.setLoop(true);
    /*this.time.addEvent( 
        {
        delay: 1000,
        callback: function() {
            var y = Phaser.Math.Between(50, config.height - 50);
            var enemy = this.enemies.create(config.width, y, "enemy");
            enemy.setScale(0.5);
            enemy.setVelocityX(Phaser.Math.Between(-200,-100));
        },
        callbackScope: this,
        loop: true 
        });*/
    
    this.anims.create({
        key: "IdleRight",
        frames: this.anims.generateFrameNumbers("IdleRight"),
        frameRate: 2,
        repeat: -1,
    });
    this.anims.create({
        key: "IdleLeft",
        frames: this.anims.generateFrameNumbers("IdleLeft"),
        frameRate: 2,
        repeat: -1,
    });
    this.anims.create({
        key: "AttackRight",
        frames: this.anims.generateFrameNumbers("AttackRight"),
        frameRate: 32,
        repeat: 0,
    });
    this.anims.create({
        key: "AttackLeft",
        frames: this.anims.generateFrameNumbers("AttackLeft"),
        frameRate: 32,
        repeat: 0,
    }); 
    this.anims.create({
        key: "Death",
        frames: this.anims.generateFrameNumbers("Death"),
        frameRate: 16,
        repeat: 0,
    });
        
    this.anims.create({
        key: "ZombieWalkLeft",
        frames: this.anims.generateFrameNumbers("ZombieWalkLeft"),
        frameRate: 16,
        repeat: -1,
    });
    this.anims.create({
        key: "ZombieWalkRight",
        frames: this.anims.generateFrameNumbers("ZombieWalkRight"),
        frameRate: 16,
        repeat: -1,
    });
        this.anims.create({
        key: "ZombieDieLeft",
        frames: this.anims.generateFrameNumbers("ZombieDieLeft"),
        frameRate: 32,
        repeat: 0,
    });
    this.anims.create({
        key: "ZombieDieRight",
        frames: this.anims.generateFrameNumbers("ZombieDieRight"),
        frameRate: 16,
        repeat: 0,
    });
    this.anims.create({
        key: "ZombieAttackLeft",
        frames: this.anims.generateFrameNumbers("ZombieAttackLeft"),
        frameRate: 32,
        repeat: 0,
    });
    this.anims.create({
        key: "ZombieAttackRight",
        frames: this.anims.generateFrameNumbers("ZombieAttackRight"),
        frameRate: 16,
        repeat: 0,
    });
        
    this.anims.create({
        key: 'QuitButton',
        frames: [{key: 'QuitButton', frame:0}],
        frameRate: 0
    });
    this.anims.create({
        key: 'QuitButtonHover',
        frames: [{key: 'QuitButton', frame:1}],
        frameRate: 0
    });
    
    this.anims.create(  {
        key: 'RetryButton',
        frames: [{key: 'RetryButton', frame:0}],
        frameRate: 0,
    });
    this.anims.create(  {
        key: 'RetryButtonHover',
        frames: [{key: 'RetryButton', frame:1}],
        frameRate: 0,
    });
    
        this.SpawnEnemy();
        this.player.play("IdleRight");   
        
        this.killsText = this.add.text(config.width/2,32, kills, {fontFamily: "Arial", fontSize: '42px', fill: '#f62b2b', align: 'center', stroke: '#fff', strokeThickness: 2});
        this.speedText = this.add.text(16,36, 'Speed: ' + gameSpeed + 'x', {fontFamily: "Arial", fontSize: '16px', fill: '#fff'});
        this.killsText.setOrigin(0.5);
        
        this.playerHealthBar = this.add.sprite(config.width/2, config.height-20, "healthIcon").setScale(2.5);
        this.playerHealthBar.setOrigin(0.5);
        this.healthText = this.add.text(config.width/2,config.height-24, this.player.health, {fontFamily: "Arial", fontSize: '24px', fill: 'black', align: 'center', stroke: '#fff', strokeThickness: 2});
        this.healthText.setOrigin(0.5);
        
        //Missed text
        this.missText = this.add.text(config.width/2,86, "Missed!", {fontFamily: "Arial", fontSize: '64px', fill: '#ffd7d7', align: 'center'});
        this.missText.setOrigin(0.5);
        this.missText.setScale(0);
        
        this.firstLeftHint = this.add.text(16,config.height-20, 'Left Click to Attack!', {fontFamily: "Arial", fontSize: '18px', fill: '#fff'});
        this.firstLeftHint.setScale(1);
        
        this.healthHint = this.add.text(config.width/2,config.height-64, 'Your Health! \n V', {fontFamily: "Arial", fontSize: '18px', fill: '#fff', align: 'center'});
        this.healthHint.setScale(1);
        this.healthHint.setOrigin(0.5);
        
        this.scoreHint = this.add.text(config.width/2,76, '^ \n Kills Increase Score!', {fontFamily: "Arial", fontSize: '18px', fill: '#fff', align: 'center'});
        this.scoreHint.setScale(1);
        this.scoreHint.setOrigin(0.5);
        
        this.firstRightHint = this.add.text(config.width-16,config.height, 'Right Click to Attack!', {fontFamily: "Arial", fontSize: '18px', fill: '#fff'});
        this.firstRightHint.setOrigin(1);
        this.firstRightHint.setScale(1);
        
        if(firstLeft || firstRight)
            {
                this.firstRightHint.setScale(0);
                this.firstLeftHint.setScale(0);
                this.scoreHint.setScale(0);
                this.healthHint.setScale(0);
            }
        
        this.buttonQuit = this.add.sprite(
        config.width/2-64,
        config.height-32,
        "QuitButton"
        );
        this.buttonQuit.setScale(0);
        this.buttonQuit.setInteractive();

        this.buttonQuit.on("pointerover", function() {
        this.buttonQuit.play("QuitButtonHover");
        }, this);

        this.buttonQuit.on("pointerout", function() {
        this.play("QuitButton");
        });

        this.buttonQuit.on("pointerdown", function() {
        this.scene.start("SceneMainMenu");
        this.sfx.click.play();
        this.sfx.music.stop();
        ResetGame();
        }, this);

        this.buttonQuit.on("pointerup", function() {
        this.play("QuitButton");
        });
        
        this.buttonRetry = this.add.sprite(
        config.width/2+64,
        config.height-32,
        "RetryButton"
        );
        this.buttonRetry.setScale(0);
        this.buttonRetry.setInteractive();

        this.buttonRetry.on("pointerover", function() {
        this.buttonRetry.play("RetryButtonHover");
        }, this);

        this.buttonRetry.on("pointerout", function() {
        this.play("RetryButton");
        });

        this.buttonRetry.on("pointerdown", function() {
        this.scene.start("SceneGame");
        this.sfx.click.play();
        this.sfx.music.stop();
        ResetGame();
        }, this);

        this.buttonRetry.on("pointerup", function() {
        this.play("RetryButton");
        });
        
        
    }  
    
    //Occurs repeatedly at regular intervals
    update()
    {
        var pointer = this.input.activePointer;
        this.player.setVelocity(0,0);
		
		//Attack scripts
        if((this.keyA.isDown || pointer.leftButtonDown()) && lmb == false && !stunned && !gameIsOver)//Left
        {
            //Execute left attack
            lmb = true;
            this.player.play("AttackLeft"); 
            this.player.once("animationcomplete", function () {self.player.play("IdleLeft");});
            
            if(leftEnemyQueue[0] != null && ((this.player.x - leftEnemyQueue[0].x) <= weaponRange || leftEnemyQueue[0].inRange == true) )
                {
                    distanceMoved = 0;
                    distanceToMove = this.player.x - leftEnemyQueue[0].x;
                    this.MoveWorld();
                    var enem = leftEnemyQueue[0];
                    this.EnemyHurt(enem);
                    
                    if(!firstLeft)
                    {
                    firstLeft = true;
                    this.firstLeftHint.setScale(0);
                    this.scoreHint.setScale(0);
                    this.healthHint.setScale(0);
                    }
                }else //if you clicked and there is nothing there, aka, MISS
                {
                    this.StunPlayer();
                    distanceMoved = 0;
                    distanceToMove = weaponRange;
                    this.MoveWorld();
                    this.sfx.miss.play();
                }
            
        }
        else if(this.keyA.isUp && pointer.leftButtonReleased())
         {
                 lmb = false;
         }
        
        if((this.keyD.isDown || pointer.rightButtonDown()) && rmb == false && !stunned && !gameIsOver)//right
        {
            //Execute Right attack
            rmb = true;
            this.player.play("AttackRight");
            this.player.once("animationcomplete", function () {self.player.play("IdleRight");});
            if(rightEnemyQueue[0] != null && ((rightEnemyQueue[0].x - this.player.x) <= weaponRange || rightEnemyQueue[0].inRange == true))
                {
                    distanceMoved = 0;
                     distanceToMove = this.player.x - rightEnemyQueue[0].x;
                    this.MoveWorld();
                    var enem = rightEnemyQueue[0];
                    this.EnemyHurt(enem);
                    
                    if(!firstRight)
                    {
                    firstRight = true;
                    this.firstRightHint.setScale(0);
                    this.scoreHint.setScale(0);
                    this.healthHint.setScale(0);
                    }
                }else //if you clicked and there is nothing there, aka, MISS
                {
                    this.StunPlayer();
                    distanceMoved = 0;
                    distanceToMove = -weaponRange;
                    this.MoveWorld();
                    this.sfx.miss.play();
                }
        }
        else if(this.keyD.isUp && pointer.rightButtonReleased())
         {
                 rmb = false;
         }
        
        //Right range bar
        if(rightEnemyQueue[0] != null && ((rightEnemyQueue[0].x - this.player.x) <= weaponRange || rightEnemyQueue[0].inRange == true) )
        {
            this.player.rightWeaponRangeBar.fillColor = 0x5fcde4;
            this.player.rightWeaponRangeBar.setStrokeStyle(2, 0xffffff);
            if(!firstRight)
                {
                    this.firstRightHint.setScale(1);
                    this.firstRightHint.setText("Zombie in Range! Right Click to Attack!");
                }
        }else
        {
            this.player.rightWeaponRangeBar.fillColor = 0x5b6ee1;
            this.player.rightWeaponRangeBar.setStrokeStyle(0, 0xffffff);
        }
        
        //Left range bar
        if(leftEnemyQueue[0] != null && ((this.player.x - leftEnemyQueue[0].x) <= weaponRange || leftEnemyQueue[0].inRange == true))
        {
            this.player.leftWeaponRangeBar.fillColor = 0xf21d04;
            this.player.leftWeaponRangeBar.setStrokeStyle(2, 0xffffff);
            if(!firstLeft)
                {
                    this.firstLeftHint.setScale(1);
                    this.firstLeftHint.setText("Zombie in Range! Left Click to Attack!");
                }
        }else
        {
            this.player.leftWeaponRangeBar.fillColor = 0xac3232;
            this.player.leftWeaponRangeBar.setStrokeStyle(0, 0xffffff);
        }
        
        for(var i = 0; i < rightEnemyQueue.length; i++)
            {
                if(i > 0 && rightEnemyQueue[i-1].x + 32 > rightEnemyQueue[i].x)
                    {
                        rightEnemyQueue[i].setVelocityX(100 * gameSpeed);
                    }else if (rightEnemyQueue[i].x > this.player.x + 32)
                    {
                       rightEnemyQueue[i].setVelocityX(-100*gameSpeed);
                    }else
                    {
                        rightEnemyQueue[i].setVelocityX(0);
                        //trigger left facing attack once
                        if(!rightEnemyQueue[i].isAttacking && i == 0)
                        {
                            rightEnemyQueue[i].isAttacking = true;
                            var index = i;
                           //trigger attack function
                            var attackDelay = this.time.delayedCall(250, function(){
                                
                                if(rightEnemyQueue[index] != null && rightEnemyQueue[index].x <= self.player.x + 32)
                                {
                                this.EnemyAttack(rightEnemyQueue[index], 1);
                                 }
                                                 
                                                 }, null, self);
                        }
                    }
                for(var h = 0; h < rightEnemyQueue[i].health.length; h++)
                {
                    if(rightEnemyQueue[i].healthBars[h] != null && !rightEnemyQueue[i].isDead && !gameIsOver){
                    rightEnemyQueue[i].healthBars[h].x = rightEnemyQueue[i].x;}else if(gameIsOver)
                        {
                            rightEnemyQueue[i].healthBars[h].setScale(0);
                        }
                }
            }
        for(var i = 0; i < leftEnemyQueue.length; i++)
            {
                if(i > 0 && leftEnemyQueue[i-1].x - 32 < leftEnemyQueue[i].x)
                    {
                        leftEnemyQueue[i].setVelocityX(-100 * gameSpeed);
                    }else if (leftEnemyQueue[i].x < this.player.x - 32)
                    {
                       leftEnemyQueue[i].setVelocityX(100*gameSpeed);
                    }else
                    {
                        leftEnemyQueue[i].setVelocityX(0);
                        //Trigger right facing attack once
                        if(!leftEnemyQueue[i].isAttacking && i == 0)
                        {
                            leftEnemyQueue[i].isAttacking = true;
                            var index = i;
                           //trigger attack function
                            var attackDelay = this.time.delayedCall(250, function(){
                                
                                if(leftEnemyQueue[index] != null && leftEnemyQueue[index].x >= self.player.x - 32)
                                {
                                this.EnemyAttack(leftEnemyQueue[index], 0);
                                 }
                                                 
                                                 }, null, self);
                        }
                    }
                for(var h = 0; h < leftEnemyQueue[i].health.length; h++)
                {
                    if(leftEnemyQueue[i].healthBars[h] != null && !leftEnemyQueue[i].isDead && !gameIsOver){
                    leftEnemyQueue[i].healthBars[h].x = leftEnemyQueue[i].x;}else if(gameIsOver)
                        {
                            leftEnemyQueue[i].healthBars[h].setScale(0);
                        }
                }
            }
        
        
    }
    
    


}
