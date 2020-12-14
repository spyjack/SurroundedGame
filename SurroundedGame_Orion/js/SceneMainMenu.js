class SceneMainMenu extends Phaser.Scene {
	constructor() {
		super({ key: "SceneMainMenu" });
}
preload() 
{
    this.load.spritesheet("PlayButton", "content/PlayButton.png", { frameWidth: 16, frameHeight: 16});
    
    this.load.audio("Click", "content/buttonClick.wav");
}

create() 
{
    this.sfx = {
btn: this.sound.add("Click")
};

this.textTitle = this.add.text(
  this.game.config.width * 0.5,
  64,
  "SURROUNDED!",
  {
fontFamily: "Arcadepix",
fontSize: 32,
align: "center"
  }
);
this.textTitle.setOrigin(0.5);
    
this.textCredits = this.add.text(
  8,
  config.height-40,
  "Created By Terran Orion",
  {
fontFamily: "Arcadepix",
fontSize: 16,
align: "center"
  }
);
    
this.textHint = this.add.text(
  config.width/2,
  config.height/2 + 44,
  "Fend Off the Horde, Until Your Demise...",
  {
fontFamily: "Arcadepix",
fontSize: 24,
align: "center"
  }
);
this.textHint.setOrigin(0.5);
    
this.anims.create({
        key: 'PlayButton',
        frames: [{key: 'PlayButton', frame:0}],
        frameRate: 0
    });
    this.anims.create({
        key: 'PlayButtonHover',
        frames: [{key: 'PlayButton', frame:1}],
        frameRate: 0
    });

this.buttonPlay = this.add.sprite(
this.game.config.width * 0.5,
this.game.config.height * 0.5,
"PlayButton"
);
    this.buttonPlay.setScale(4);
this.buttonPlay.setInteractive();

this.buttonPlay.on("pointerover", function() {
this.buttonPlay.play("PlayButtonHover");
}, this);

this.buttonPlay.on("pointerout", function() {
this.play("PlayButton");
});

this.buttonPlay.on("pointerdown", function() {
this.scene.start("SceneGame");
this.sfx.btn.play();
}, this);

this.buttonPlay.on("pointerup", function() {
this.play("PlayButton");
});

} 
}

