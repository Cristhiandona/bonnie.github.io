var AMOUNT_DIAMONDS = 50;
var AMOUNT_BOOBLES = 30;//trampa

GamePlaymanager = {
    init: function(){
        //Para hacer el juego Responsive
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        this.flagFirstMouseDown = false;
        this.amountDiamondsCaught = 0;
        this.endGame = false;

        this.countSmile = -1;

    },
    preload: function(){
        game.load.image('background','background.png');
        game.load.spritesheet('horse','horse.png',84,156,2);
        game.load.spritesheet('diamonds','diamonds.png', 81, 84,4);

        game.load.image('explosion','explosion.png');
        game.load.image('shark','lobo.png');
        game.load.image('fishes','ciaf.png');
        game.load.image('mollusk','FotoJet.png');
        game.load.image('booble1','lobo.png');
        game.load.image('booble2','trampa1.png');

    },

    create: function(){
        game.add.sprite(0,0,'background');
        this.shark = game.add.sprite(500,10, 'shark');

        this.boobleArray = [];

        for(var i=0; i < AMOUNT_BOOBLES; i++){
            var xBooble = game.rnd.integerInRange(1, 1140);
            var yBooble = game.rnd.integerInRange(600, 950);

            var booble = game.add.sprite(xBooble, yBooble, 'booble' + game.rnd.integerInRange(1,2));
            booble.vel = 0.2 + game.rnd.frac()*2;
            booble.alpha = 0.9;
            booble.scale.setTo(0.2 + game.rnd.frac());
            this.boobleArray[i] = booble;
        }

        this.fishes = game.add.sprite(100,230, 'fishes');
        this.mollusk = game.add.sprite(200,250, 'mollusk');
        this.horse = game.add.sprite(0,0,'horse');
        this.horse.frame = 0;//Cambiar entren imagenes
        this.horse.x = game.width/2;
        this.horse.y = game.height/2;
        this.horse.anchor.setTo(0.5);

        game.input.onDown.add(this.onTap,this);

        //Posicion de los elementos
        this.diamonds = [];
        for(var i=0; i < AMOUNT_DIAMONDS; i++){
            var diamond = game.add.sprite(100,100,'diamonds');
            diamond.frame = game.rnd.integerInRange(0,3);
            diamond.scale.setTo(0.30 + game.rnd.frac());
            diamond.anchor.setTo(0.5);
            diamond.x = game.rnd.integerInRange(50,1050);
            diamond.y = game.rnd.integerInRange(50,600);

            this.diamonds[i] = diamond;
            var rectCurrenDiamond = this.getBoundsDiamond(diamond);
            var rectHorse = this.getBoundsDiamond(this.horse);

            while(this.isOverlappingOtherDiamond(i, rectCurrenDiamond) || this.isRectanglesOverlapping(rectHorse, rectCurrenDiamond)){
                diamond.x = game.rnd.integerInRange(50,1050);
                diamond.y = game.rnd.integerInRange(50,600);
                rectCurrenDiamond = this.getBoundsDiamond(diamond);
            }
        }

        this.explosionGroup = game.add.group();

        for(var i = 0; i < 10; i++){

        this.explosion = this.explosionGroup.create(100,100, 'explosion');
        this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
            x: [0.4, 0.8, 0.4],
            y: [0.4, 0.8, ,0.4]
        }, 600, Phaser.Easing.Exponential.Out, false,0,0,false);

        this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
            alpha: [1, 0.6, 0]
        }, 600, Phaser.Easing.Exponential.Out, false,0,0,false);

        this.explosion.anchor.setTo(0.5);
        this.explosion.kill();

        }

        this.currentScore = 0;
        var style = {
            font: 'bold 30pt Arial',
            fill: '#FFFFFF',
            align: 'center'
        }

        this.scoreText = game.add.text(game.width / 2, 40, '0', style);
        this.scoreText.anchor.setTo(0.5);

        this.totalTime = 10; //Tiempo para realizar el juego
        this.timerText = game.add.text(1000, 40, this.totalTime +'', style);
        this.timerText.anchor.setTo(0.5);

        this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function(){
            if(this.flagFirstMouseDown){
                this.totalTime--;
                this.timerText.text = this.totalTime+'';
                if(this.totalTime <= 0){
                    game.time.events.remove(this.timerGameOver);
                    this.endGame = true;
                    this.showFinalMessage('GAME OVER');
                }
            }
        }, this);

        
    },

    increaseScore:function(){
        this.countSmile = 0;
        this.horse.frame = 1;

        this.currentScore += 100;
        this.scoreText.text = this.currentScore;

        this.amountDiamondsCaught += 1;
        if(this.amountDiamondsCaught >= AMOUNT_DIAMONDS){
            game.time.events.remove(this.timerGameOver);
            this.endGame = true;
            this.showFinalMessage('FELICITACIONES HAS GANADO !!');
        }
    },

    showFinalMessage:function(msg){
        var bgAlpha = game.add.bitmapData(game.width, game.height);
        bgAlpha.ctx.fillStyle = '#000000';
        bgAlpha.ctx.fillRect(0, 0, game.width, game.height);

        var bg = game.add.sprite(0, 0, bgAlpha);
        bg.alpha = 0.5;

        var style = {
            font: 'bold 30pt Arial',
            fill: '#FFFFFF',
            align: 'center'
        }

        this.textFieldFinalMsg = game.add.text(game.width/2, game.height/2, msg, style);
        this.textFieldFinalMsg.anchor.setTo(0.5);
    },

    onTap:function(){
        this.flagFirstMouseDown = true;
    },

    getBoundsDiamond:function(currentDiamond){
        return new Phaser.Rectangle(currentDiamond.left, currentDiamond.top, currentDiamond.width, currentDiamond.height);
    },

    isRectanglesOverlapping: function(rec1, rect2){
        if(rec1.x > rect2.x + rect2.width || rect2.x > rec1.x + rec1.width){
            return false;
        }

        if(rec1.y > rect2.y + rect2.height || rect2.y > rec1.y + rec1.height){
            return false;
        }
        return true;
    },

    isOverlappingOtherDiamond: function(index, rect2){
        for(var i=0; i < index; i++){
            var rect1 = this.getBoundsDiamond(this.diamonds[i]);
            if(this.isRectanglesOverlapping(rect1, rect2)){
                return true;
            }
        }
        return false;
    },

    getBoundsHorse: function(){
        var x0 = this.horse.x - Math.abs(this.horse.width) / 4;
        var width = Math.abs(this.horse.width)/4;
        var y0 = this.horse.y - this.horse.height / 2;
        var height = this.horse.height;

        return new Phaser.Rectangle(x0, y0, width, height);
    },

    render:function(){
        //game.debug.spriteBounds(this.horse);
        for(var i=0; i < AMOUNT_DIAMONDS; i++){
            //game.debug.spriteBounds(this.diamonds[i]);
        }
    },

    update: function(){
        if(this.flagFirstMouseDown &&! this.endGame){

            for(var i = 0; i < AMOUNT_BOOBLES; i++){

                var booble = this.boobleArray[i];
                booble.y -= booble.vel;
                if(booble.y < -50){
                    booble.y = 700;
                    booble.x = game.rnd.integerInRange(1, 1140);
                }
            }

            if(this.countSmile >= 0){
                this.countSmile++;
                if(this.countSmile > 50){
                    this.countSmile = -1;
                    this.horse.frame = 0;
                }
            }

            this.shark.x--;
            if(this.shark.x < -300){
                this.shark.x = 1300;
            }
            var pointerX = game.input.x;
            var pointerY = game.input.y;

            var distX = pointerX - this.horse.x;
            var distY = pointerY - this.horse.y;

            if(distX>0){
                this.horse.scale.setTo(1,1);
            }else{
                this.horse.scale.setTo(-1,1);
            }

            this.horse.x += distX * 0.12; //Velocidad para seguir el cursor
            this.horse.y += distY * 0.12;

            for(var i=0; i < AMOUNT_DIAMONDS; i++){
                var rectHorse = this.getBoundsHorse();
                var rectDiamond = this.getBoundsDiamond(this.diamonds[i]);

                if(this.diamonds[i].visible && this.isRectanglesOverlapping(rectHorse, rectDiamond)){
                    this.increaseScore();
                    this.diamonds[i].visible = false;
                    
                    var explosion = this.explosionGroup.getFirstDead();
                    if(explosion != null){

                        explosion.reset(this.diamonds[i].x, this.diamonds[i].y);
                        explosion.tweenScale.start();
                        explosion.tweenAlpha.start();

                        explosion.tweenAlpha.onComplete.add(function(currentTarget, currentTween){
                            currentTarget.kill();
                        }, this);
                    }
                }
            }
        }
    }
}

var game = new Phaser.Game(1136,640,Phaser.AUTO);

game.state.add('gameplay', GamePlaymanager);
game.state.start('gameplay');

