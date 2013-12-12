(function () {

  var game,
    santa,facing='right',
    score = 0,
    lives = 3,
    won = false,
    map, tileset, layer,
    cursor,jumpButton,restartButton,jumpTimer = 0,
    scoreText,introText,livesText,winText,livesTimeout=50,
    presents, bushes,
    emitter,globalSnow,globalSnow1,globalSnow2,
    width = 480,//document.body.clientWidth, //480 px
    height = 320;//document.body.clientHeight; //320 px

  function preload() {
    var dir = 'assets/all-images/images/';
    game.load.spritesheet('santa', dir+'santa.png', 15.9, 16, 6);
    game.load.image('present', dir+'exit.png');
    game.load.image('snow', dir+'snow.png');
    game.load.image('present', dir+'exit.png');
    game.load.image('bush', dir+'holly1.png');

    game.load.tilemap('start', 'assets/maps/start.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tileset('tiles', 'assets/texturepacker-sprite.png', 16, 16);
  }

  function create() {
    this.game.stage.backgroundColor = '#2e2c3d';


    map = game.add.tilemap('start');

    var gameObject;
    presents = game.add.group();
    bushes = game.add.group();

    var objects = game.cache.getTilemapData('start').data.layers.filter(function(el){
      return (el.name == 'collide')? el : false;
    }).pop().objects.map(function(el){
      switch(el.type){
        case 'present':
          gameObject = presents.create(el.x, el.y-16, 'present');
          gameObject.body.bounce.setTo(0, 0);
          gameObject.body.immovable = true;
          break;
        case 'bush':
          gameObject = bushes.create(el.x, el.y-16, 'bush');
          gameObject.body.bounce.setTo(5, 5);
          gameObject.body.immovable = true;
          break;
        case 'win':
          console.log(el);
        break;

      }

    });

    console.log(objects);

    tileset = game.add.tileset('tiles');
    tileset.setCollisionRange(0, tileset.total - 1, true, true, true, true);

    tileset.setCollision(6, false, false, false, false);


    layer = game.add.tilemapLayer(0, 0, 480, 320, tileset, map, 0);
    layer.resizeWorld();

    santa = game.add.sprite(90, 50, 'santa');
    santa.start = {x: 90, y: 50 };
    santa.anchor.setTo(0.5, 0.5);

    santa.body.bounce.y = 0.2;
    santa.body.collideWorldBounds = true;
    santa.body.gravity.y = 6;
    santa.body.setSize(16, 16, 0, 0);

    var speed = 15;
    santa.animations.add('right', [1, 2, 3, 4, 5], speed, true);
    santa.animations.add('turn', [0], 20, true);
    santa.animations.add('left', [1, 2, 3, 4, 5], speed, true);

    game.camera.follow(santa);

    // santa.animations.add('walk'[1,2,3]);
    // santa.animations.play('walk', 200, true);
    // game.add.tween(santa).to({ x: game.width }, 5000, Phaser.Easing.Linear.None, true);

    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    restartButton = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);


    emitter = game.add.emitter(0, 0, 200);
    emitter.makeParticles('snow');
    var burstSize = 60;
    emitter.minParticleSpeed.setTo(-burstSize, -burstSize);
    emitter.maxParticleSpeed.setTo(burstSize, burstSize);
    emitter.minRotation = 0;
    emitter.maxRotation = 0;
    emitter.gravity = 1;
    emitter.bounce.setTo(0, 0);

    scoreText = game.add.text(32, height-25, 'score: '+score, { font: "20px Arial", fill: "#ffffff", align: "left" });
    introText = game.add.text(width/2, height/2, '- collect all the presents! -', { font: "30px Arial", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);
    var startWinText = '- Merry Christmas! -';
    winText = game.add.text(width/2, height/3, startWinText, { font: "40px Arial", fill: "#ff0000", align: "center" });
    winText.anchor.setTo(0.5, 0.5);
    winText.start = {content: startWinText};
    winText.visible = false;
    livesText = game.add.text(width - 100, height-25, 'lives: '+lives, { font: "20px Arial", fill: "#ffffff", align: "left" });


    globalSnow = cretateGlobalSnow();
    globalSnow1 = cretateGlobalSnow();
    globalSnow2 = cretateGlobalSnow()

    game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
    game.stage.scale.setShowAll();
    window.addEventListener('resize', function () {
      game.stage.scale.refresh();
    });
    Phaser.Canvas.setSmoothingEnabled(game.context, false);
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
  function restart(){
    won = false;
    presents.callAll('revive');
    santa.x = santa.start.x;
    santa.y = santa.start.y;
    winText.content = winText.start.content;
    winText.visible = false;
    introText.visible = true;
    lives = 3;
    score = 0;
  }

  function update() {

    game.physics.collide(santa, layer);


    game.physics.collide(santa, presents, santaGotPresent, null, this);
    game.physics.collide(santa, bushes, santaHitBush, null, this);

    santa.body.velocity.x = 0;

    if(won) {
      if (game.input.mousePointer.isDown || restartButton.isDown){
        restart();
      }
      return;
    }

    if (cursors.left.isDown)
    {
        santa.body.velocity.x = -150;

        if (facing != 'left')
        {
            santa.animations.play('left');
            facing = 'left';
            santa.scale.x = -1;
        }
    }
    else if (cursors.right.isDown)
    {
        santa.body.velocity.x = 150;

        if (facing != 'right')
        {
            santa.animations.play('right');
            facing = 'right';
            santa.scale.x = 1;
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
        introText.visible = false;
    }

    globalSnow.x = game.camera.x + width/2;
    globalSnow1.x = game.camera.x - width/2;
    globalSnow2.x = game.camera.x + width + width/2;

    scoreText.x = game.camera.x + 20;
    livesText.x = game.camera.x + width - 100;
    livesText.content = 'lives: ' + lives;
    scoreText.content = 'score: ' + score;
    //introText.x = game.camera.x + width/4;
    // santa.scale.x += 0.001;
    // santa.scale.y += 0.001;
  }

  function render(){
    //game.debug.renderSpriteBody(santa);
  }


  function santaGotPresent(santa, present){
    present.kill();

    score += 1;

    scoreText.content = 'score: ' + score;

    //  Are they any bricks left?
    if (presents.countLiving() == 0)
    {
        //  New level starts
        score += 1000;
        scoreText.content = 'score: ' + score;
        win();
    }
  }

  function win(){
    if(won) return;
    winText.x = game.camera.x + width/2;
    winText.content += '\n- your score: '+score+' -';
    winText.visible = true;
    introText.visible = false;
    won = true;
    santa.animations.stop();
  }
  function loose(){
    if(won) return;
    winText.content += '\n Sorry, you died';
    win();
  }

  function santaHitBush(santa, bush){
    console.log('hit!');
    if(game.time.now > livesTimeout){
      livesTimeout = game.time.now + 300;

      if(lives < 2){
        loose();
        lives = 0;
      }else{
        lives -= 1;
      }
    }
    livesText.content = 'lives: ' + lives;
  }


  game = new Phaser.Game(width, height, Phaser.CANVAS, 'phaser-example', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });

  window.game = game;

}());

