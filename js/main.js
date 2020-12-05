"use strict";

(()=>{

  //ボールの位置をランダムに生成させる
  function rand( min, max ){
    return Math.random() * (max - min) + min;
  }

    class Ball {
      constructor(canvas){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.x = rand(30,250);
        this.y = 30;
        this.r = 10;
        this.vx = rand(3,5) * (Math.random() < 0.5 ? 1 : -1);//反射した際の挙動を一定数でランダムにする
        this.vy = rand(3,5);//反射した際の挙動を一定数でランダムにする
        this.isMissed = false;
        }

        //クラスの外部（paddle）から直接プロパティを操作することは推奨されていないため、とりあえず以下のメソッドを作成
        getMissedStatus(){
          return this.isMissed;
        }

        bounce(){
          this.vy *= -1;
        }
        reposition(paddleTop){
          this.y = paddleTop - this.r;
        }

        getX(){
          return this.x;
        }
        getY(){
          return this.y;
        }
        getR(){
          return this.r;
        }

      update(){
        this.x +=this.vx; 
        this.y +=this.vy;
        
        if(this.y + this.r > this.canvas.height){
          this.isMissed = true;
        }
        if(
          //ボールがめり込んでから反射しない様に、半径分の距離を足したり引いたりする
          this.x - this.r < 0 || 
          this.x + this.r > this.canvas.width
          ){
          this.vx *= -1;
        }
        if(this.y - this.r < 0 ){
          this.vy *= -1;
        }
      }

      draw(){
        this.ctx.beginPath();
        this.ctx.fillStyle = "#fdfdfd";
        this.ctx.arc(this.x , this.y , this.r , 0 ,2 * Math.PI);
        this.ctx.fill();
      }

    }

    class Paddle {
      constructor(canvas ,game){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.w = 60;
        this.h = 12;
        this.x = (this.canvas.width - this.w) / 2;
        this.y = this.canvas.height - this.h;
        this.mouseX = this.x;
        this.addHandler();
        this.game = game;
      }

      addHandler(){
        document.addEventListener("mousemove",(e) =>{
          this.mouseX = e.clientX;
        });
      }

      update(ball){
        const ballBottom = ball.getY() + ball.getR();
        const ballTop = ball.getY() - ball.getR();
        const paddleTop = this.y;
        const paddleBottom = this.y + this.h;
        const ballCenter = ball.getX();;
        const paddleLeft = this.x;
        const paddleRight = this.x + this.w;

        if(
          ballBottom > paddleTop &&
          ballTop < paddleBottom &&
          ballCenter > paddleLeft &&
          ballCenter < paddleRight
        ){
          ball.bounce();
          ball.reposition(paddleTop);
          this.game.addScore();
        }

        const rect = this.canvas.getBoundingClientRect();
        this.x = this.mouseX - rect.left - (this.w / 2 );
        if(this.x < 0){
          this.x = 0;
        }
        if(this.x + this.w > this.canvas.width){
          this.x = this.canvas.width - this.w;
        }
      }
      draw(){
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(this.x, this.y,this.w ,this.h);
      }
    }


  class Game {
    constructor(canvas){
      this.canvas = canvas;
      this.ball = new Ball(this.canvas);
      this.ctx = this.canvas.getContext("2d");
      this.paddle = new Paddle(this.canvas , this);
      this.loop();
      this.isGameOver = false;
      this.score = 0;
    }
    
    addScore(){
      this.score++;
    }

        loop(){
          if(this.isGameOver){
            return;
          }
          this.update();//update処理
          this.draw();  //描画処理
          requestAnimationFrame(()=>{
            this.loop();
          });//繰り返し処理
          //アニメの描画処理に最適化されたメソッド
          //thisをrequestAnimationFrameで使うと、undefinedとなる
          //()=>{}で渡して、関数内で処理してあげる必要がある
        }

    update(){
      this.ball.update();
      this.paddle.update(this.ball);
      if (this.ball.getMissedStatus()){
        this.isGameOver = true;
      }
    }

    draw(){
      if(this.isGameOver){
        this.drawGameOver();
        return;
      }
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);//画面全体をクリアにし、下記のdraw(){}関数で再描画する
      this.ball.draw();//ボールの描画処理
      this.paddle.draw();//パドルの描画処理
      this.drawScore();
    }
    drawGameOver(){
      this.ctx.font = "28px 'Arial Black' ";
      this.ctx.fillStyle = "tomato";
      this.ctx.fillText ("GAME OVER" , 50 ,150);
    }
    drawScore(){
      this.ctx.font ="20px Arial";
      this.ctx.fillStyle = "#fdfdfd";
      this.ctx.fillText(this.score, 10 ,25);
    }
  }

  const canvas = document.querySelector("canvas");
  if(typeof canvas.getContext === "undefined"){
    return;
  }

  new Game(canvas);
})();