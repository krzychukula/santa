(function () {

  var game,
    santa,facing='right',
    map, tileset, layer,
    cursor,jumpButton,jumpTimer = 0,
    emitter,globalSnow,globalSnow1,globalSnow2,
    width = 480,//document.body.clientWidth, //480 px
    height = 320;//document.body.clientHeight; //320 px

  function preload() {
    var dir = 'assets/all-images/images/';
    game.load.spritesheet('santa', dir+'santa.png', 16, 16);
    game.load.image('present', dir+'exit.png');
        game.load.image('snow', dir+'snow.png');

    game.load.tilemap('start', 'assets/maps/start.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tileset('tiles', 'assets/texturepacker-sprite.png', 16, 16);

  }

  function create() {
    this.game.stage.backgroundColor = '#2e2c3d';

    map = game.add.tilemap('start');
    tileset = game.add.tileset('tiles');
    tileset.setCollisionRange(0, tileset.total - 1, true, true, true, true);
    layer = game.add.tilemapLayer(0, 0, 480, 320, tileset, map, 0);
    layer.resizeWorld();


    santa = game.add.sprite(90, 50, 'santa');
    santa.anchor.setTo(0.5, 0.5);

    santa.body.bounce.y = 0.2;
    santa.body.collideWorldBounds = true;
    santa.body.gravity.y = 6;
    santa.body.setSize(16, 16, 0, 0);

    santa.animations.add('left', [1, 2], 10, true);
    santa.animations.add('turn', [0], 20, true);
    santa.animations.add('right', [3,4], 10, true);

    game.camera.follow(santa);

    // santa.animations.add('walk'[1,2,3]);
    // santa.animations.play('walk', 200, true);
    // game.add.tween(santa).to({ x: game.width }, 5000, Phaser.Easing.Linear.None, true);

    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


    emitter = game.add.emitter(0, 0, 200);
    emitter.makeParticles('snow');
    var burstSize = 60;
    emitter.minParticleSpeed.setTo(-burstSize, -burstSize);
    emitter.maxParticleSpeed.setTo(burstSize, burstSize);
    emitter.minRotation = 0;
    emitter.maxRotation = 0;
    emitter.gravity = 1;
    emitter.bounce.setTo(0, 0);

    globalSnow = cretateGlobalSnow();
    globalSnow1 = cretateGlobalSnow();
    globalSnow2 = cretateGlobalSnow()

    game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
    game.stage.scale.setShowAll();
    window.addEventListener('resize', function () {
      game.stage.scale.refresh();
    });
  }

  function cretateGlobalSnow(){
    var globalSnow;
    globalSnow = game.add.emitter(0, 0, 200);
    globalSnow.makeParticles('snow');
    globalSnow.minParticleSpeed.setTo(-40, 0);
    globalSnow.maxParticleSpeed.setTo(40, 150);
    globalSnow.minRotation = 0;
    globalSnow.maxRotation = 0;
    globalSnow.gravity = 0.1;
    globalSnow.bounce.setTo(0, 0);
    globalSnow.x = 0;
    globalSnow.y = -200;
    //explode, lifespan, frequency, quantity
    globalSnow.start(false, 5000, 100);
    return globalSnow;
  }

  function particleBurst() {
    emitter.x = santa.x;
    emitter.y = santa.y;
    emitter.start(true, 2000, null, 8);

}

  function update() {
    game.physics.collide(santa, layer);

    santa.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        santa.body.velocity.x = -150;

        if (facing != 'left')
        {
            santa.animations.play('left');
            facing = 'left';
        }
    }
    else if (cursors.right.isDown)
    {
        santa.body.velocity.x = 150;

        if (facing != 'right')
        {
            santa.animations.play('right');
            facing = 'right';
        }
    }
    else
    {
        if (facing != 'idle')
        {
            santa.animations.stop();

            if (facing == 'left')
            {
                santa.frame = 0;
            }
            else
            {
                santa.frame = 5;
            }

            facing = 'idle';
        }
    }

    if ((cursors.up.isDown || jumpButton.isDown) && santa.body.touching.down && game.time.now > jumpTimer)
    {
        santa.body.velocity.y = -250;
        jumpTimer = game.time.now + 750;

        particleBurst();
    }

    globalSnow.x = game.camera.x + width/2;
    globalSnow1.x = game.camera.x - width/2;
    globalSnow2.x = game.camera.x + width + width/2;
    // santa.scale.x += 0.001;
    // santa.scale.y += 0.001;


  }

  function render(){
    //game.debug.renderSpriteBody(santa);

  }


  game = new Phaser.Game(width, height, Phaser.CANVAS, 'phaser-example', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });

  window.game = game;

}());

