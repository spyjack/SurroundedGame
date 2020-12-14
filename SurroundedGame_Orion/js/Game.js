var config = {
	type: Phaser.AUTO,
	width: 720,
	height: 256,
	backgroundColor: "black",
	physics: {
		default: "arcade",
		arcade: {
gravity: {x: 0, y: 0 }
		}
	},
	scene: [
		SceneMainMenu,
		SceneGame
	],
	pixelArt: true,
	roundPixels: true,
    scale: {
    parent: 'gameScreen',
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

var game = new Phaser.Game(config);
