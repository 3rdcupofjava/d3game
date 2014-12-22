var height = 500;   // Border height
    width = 500;    // Border width
    svg = null;
    base_circle = {x: width/2, y: height/2 , r: 70}
    color = d3.scale.category20();
    collision_targets = [base_circle];
    //enemies = [];
    threshold = 50;
    pause_text = "Game Paused Press Space to Start";
    pattern_interval = 4000;
    enemyCount = 0;
  
var enemyGeneration = -1;
var controlInterval = -1;

var defenders = [
    generatePointOnCircle(0,85),
    generatePointOnCircle(120,85),
    generatePointOnCircle(240,85)
  ];

$(defenders).each(function(i,d){
    d.r = 10;
    d.x = width/2+d.x;
    d.y = height/2+d.y;
});

var game_status = { 
  base_rotation: 0,
  level: 0,
  buf: -1,
  score: 0,
  state: 0, //0 before, 1: ongoing, 2 pause, 3 end, 
  health: [100,100,100],
  multiplier: 1,
  progress: 0
}

var cannonAttr = {
  cx: 200,
  cy: 250,
  rx: 50,
  ry: 10,
  crotation: 90
}

var ld = cannonAttr.crotation%360+180; //laser direction

var control_status ={
  rotation:0 //0-> do nothing, -1 rotate left, 1 rotate right
}


//----------------------------------------------------------------------------

var arc = d3.svg.arc()  // base arc of each arc
    .innerRadius(20)
    .outerRadius(70)
    .startAngle(function(d){ return (d + game_status.base_rotation) * (Math.PI/180)}) //converting from degs to radians
    .endAngle(function(d){ return (d + game_status.base_rotation + 120) * (Math.PI/180)})

var innerArc = d3.svg.arc()   // inner circle
    .innerRadius(20)
    .outerRadius(function(d){ return d/100 * 50 + 20;})
    .startAngle(function(d,i){ return (i*120 + game_status.base_rotation) * (Math.PI/180)}) //converting from degs to radians
    .endAngle(function(d,i){ return (i*120 + game_status.base_rotation + 120) * (Math.PI/180)})

var inArc = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(19)
    .startAngle(0) //converting from degs to radians
    .endAngle(0);

var shieldArc = d3.svg.arc()
    .innerRadius(70)
    .outerRadius(70)
    .startAngle(0) //converting from degs to radians
    .endAngle(2*Math.PI);

function changeArc(svg){
  svg.selectAll(".arcs")
    .attr("d", arc);
  svg.selectAll(".inner-arcs")
    .attr("d", innerArc);
  d3.select("#cannon").attr("transform","rotate("+cannonAttr.crotation%360+" 250 250)");

  ld = (cannonAttr.crotation%360)+180;

  if(typeof $(".laser") !== 'undefined') 
  {
    d3.select(".laser")
      .attr("transform","rotate("+ld+" 250 250)");
  }

}

function tickTween(d,i){
  return function(t){
    var element = d3.select(this);
    element.attr("T",t);
    d.x = element.attr("cx");
    d.y = element.attr("cy");
    circleCollision(d,function(target){
      if(target == base_circle){               
        if(element.attr("D") == null){
          element.attr("D",true);
          //game logic here haha, reduce or get health
          var hit_angle = coordsToAngle(d.x-width/2,d.y-height/2);
          var section = getColideSection(hit_angle);
          if(section == d.type){
            game_status.score += (d.r*game_status.multiplier);
            updateScore(d.r);
            element.attr("fill-opacity","100%").transition().duration(100).attr("r",0).attr("fill-opacity","50%").remove();
          }else{
            var h_update = [0,0,0];
            h_update[section] -= d.r;
            updateHealth(h_update);
            element.attr("fill-opacity","100%").transition().duration(100).attr("r",15).attr("fill-opacity","50%").remove();
          }
        }
        //desdroy of the element do not work correctly. The callback may be triggerred twice when collision
        //need a flag D to mark the element so that we know is is handled before.
        
      }
    });
  }
}

/*function generateDots(svg){
  enemies =[
    generatePointOnCircle(Math.round(Math.random()*360),width)
  ]

  $(enemies).each(function(i,d){
    d.r = Math.round(Math.random()*10)+5;
    d.x = width/2+d.x;
    d.y = height/2+d.y;
    d.type = Math.floor(Math.random()*3)
  });

  svg.selectAll(".enemy").data(enemies).enter().append("circle")
    .attr("class","enemy")
    .attr("r",function(d,i){ return d.r; })
    .attr("cx", function(d,i){ return d.x; } )
    .attr("cy", function(d,i){ return d.y; } )
    .attr("fill",function(d,i){ return color(d.type);} )
    .attr("AT",5000) //set at time tracker for game pause;
    .transition().duration(5000).ease("linear")
    .tween("assignment", tickTween)
    .attr("cx", width/2)
    .attr("cy", height/2)
    .remove();
}*/

/*function generateShield(svg){
  svg.selectAll(".shield").data([10]).enter().append("path")
    .attr("d",shieldArc)
    .attr("fill","white")
    .attr("transform", "translate("+height/2+","+width/2+")")
    .transition().duration(1000)
    .attr("d",shieldArc.outerRadius(75))
    .transition().duration(1000)
    .attr("d",shieldArc.outerRadius(70))
    .remove();
}*/

/*function generateDefenders(svg){
  var distance = 85;
  
  svg.selectAll(".defender").data(defenders).enter().append("circle")
    .attr("fill","white")
    .attr("r",function(d){return d.r;})
    .attr("cx",function(d,i){ return d.x})
    .attr("cy",function(d,i){ return d.y})
    .transition().duration(2000).ease("linear")
    .attrTween("cx",function(d,i){
      var it = d3.interpolate(1,360);
      return function(t){
        var p = generatePointOnCircle(120*i+it(t),distance);
        return (p.x + width/2)
      }
    }).attrTween("cy",function(d,i){
      var it = d3.interpolate(1,360);
      return function(t){
        var p = generatePointOnCircle(120*i+it(t),distance);
        return (p.y + height/2);
      }
    }).remove();
}*/

function generatePointOnCircle(angle,r){//in degree
  var rads = angle/180*Math.PI;
  var x = Math.cos(rads)*r;
  var y = Math.sin(rads)*r;
  return {x:x,y:y};
}

function circleCollision(d1,callback){
  //$(enemies).each(function(i,d1){
    var collide = false;
    $(collision_targets).each(function(i2,d2){
      var  l=  Math.sqrt( (d1.x-d2.x) *(d1.x-d2.x) + (d1.y-d2.y)*(d1.y-d2.y) );
      if(l< (d2.r+d1.r)){ //if center distance is less than sum of r, then overlap
        collide = true;
        callback(d2);
      }
    });
    return collide;
  //});
}

//----------------- game management -----------------
function startGame(){
  svg.select("#state_indicator").remove();
  enemyGeneration = setInterval(function(){

    // var patterns = [ singleColorDotsOpposite, singleColorDotsConsecutive ];
    var patterns = [ singleColorDots];
    var e = patterns[Math.floor(Math.random()*patterns.length)]();
    

    svg.selectAll(".empty").data(e).enter().append("circle")
    .attr("class","enemy")
    .attr("id",function(d){return d.angle;})
    .attr("r",function(d,i){ return d.r; })
    .attr("cx", function(d,i){ return d.x; } )
    .attr("cy", function(d,i){ return d.y; } )
    .attr("fill",function(d,i){ return color(d.type);} )
    .attr("AT",5000) //set at time tracker for game pause;
  .transition().duration(5000).delay(function(d,i){ return d.delay(d,i); }).ease("linear")
    .tween("assignment", tickTween)
    .attr("cx", width/2)
    .attr("cy", height/2)
    .remove();
  },pattern_interval);
}

function pauseGame(){
  d3.selectAll(".enemy").transition().duration(0);
  svg.select("#state_indicator").remove();
  svg.append("text")
    .attr("id","state_indicator")
    .attr("x",width/2)
    .attr("y",height/2 - 100)
    .attr("font-family", "sans-serif")
    .attr("font-size", "20px")
    .attr("fill","white")
    .attr("text-anchor","middle")
    .text(pause_text);
  clearInterval(enemyGeneration);
}

function lossGame(){
  game_status.state = 3;
  pauseGame();
  svg.select("#state_indicator")
    .text("You lost game, press space to start again");
}

function resumeGame(){
  
  svg.selectAll(".enemy").transition().duration(function(d,i){
      var remain = 1-d3.select(this).attr("T");
      var time = d3.select(this).attr("AT");
      var remain_time = time*remain;
      d3.select(this).attr("AT",remain_time);
      return remain_time;
    })
    .ease("linear")
    .tween("assignment", tickTween)
    .attr("cx", width/2)
    .attr("cy", height/2)
    .remove();
  startGame();
}

function setGameState(state){
  switch(state) {
    case 1:
      if(game_status.state == 2){
        resumeGame();
      }else{
        startGame();
      }
      break;
    case 2:
      pauseGame();
      break;
  }
  game_status.state = state;
}

function coordsToAngle(x,y){
  if(y == 0 && x >0) {
    return 90;
  }
  else if(y==0 && x<0){
    return 270;
  }
  else if(x==0 && y<0){
    return 180;
  }
  else if(x==0 && y>0){
    return 0;
  }

  var t = Math.atan(x/y);
  var temp_r = null;
  if(y>0){
    temp_r = Math.PI - t;
  }
  else if(y<0&& x>0){
    temp_r = -t;
  }
  else if(y<0&& x<0){
    temp_r = 2*Math.PI - t
  }
  return temp_r/Math.PI * 180;

}

function updateHealth(d){
  game_status.health[0] = game_status.health[0] + d[0];
  game_status.health[1] = game_status.health[1] + d[1];
  game_status.health[2] = game_status.health[2] + d[2];
  svg.selectAll(".inner-arcs").data(game_status.health).attr("d", innerArc);
}

function getColideSection(hit_angle){
  var b = game_status.base_rotation;
  if(hit_angle >= b && hit_angle < b + 120){
    return 0;      
  }
  else if(hit_angle >= b+120 && hit_angle < b + 240 ){
    return 1;       
  }
  else if(hit_angle >= b+240 && hit_angle < b + 360 ){
    return 2;      
  } 
  else if(hit_angle <= b && hit_angle > b - 120 ){
    return 2;     
  }
  else if(hit_angle <= b-120 && hit_angle > b - 240 ){
    return 1;     
  }
  else if(hit_angle <= b-240 && hit_angle > b - 360 ){
    return 0;      
  }      
}

function updateScore(score){
  svg.select("text").transition().duration(500).ease("linear").tween("text", function() {
      var i = d3.interpolate(this.textContent, game_status.score);
      return function(t) {
        this.textContent = Math.floor(i(t));
      };
    });


  var begin = (game_status.progress/threshold)*Math.PI*2;   
  var end = ((game_status.progress+score)/threshold)*Math.PI*2;
  var end_score = game_status.progress+score;
  var t = svg.select(".indicator").transition().ease("linear").duration(500)
    .attrTween("d", function(){
     
      //if full, then animated to maxmun
      if(end_score > threshold) end = 2*Math.PI;
      var i = d3.interpolate(begin,end);
      return function(t){
        //inArc.startAngle(begin);
        inArc.endAngle(i(t));
        return inArc();
      }

      
    }).each("start",function(){
      if(end_score > threshold){
        game_status.multiplier ++;
        game_status.progress = 0;
        //reset indicator
        inArc.endAngle(0)
        d3.select(this).attr("d",inArc);
        d3.select(".mIndicator").text("x "+ game_status.multiplier);
      }
      else{
        game_status.progress+=score;
      }
    });
  
}
//-------------------------------patterns----------
//single color - three dots 
function singleColorDots(){
  var n =  1;
  var t = Math.floor(Math.random()*3);
  var base_point  = generatePointOnCircle(Math.round(Math.random()*360),width);
  var enemies = [];

  var temp_angle = (Math.atan2(Math.abs(base_point.y),Math.abs(base_point.x)))*(180/Math.PI);
  var final_angle;

  if(base_point.x < 0 && base_point.y > 0)
  {
    final_angle = (90-temp_angle)+270;
  }
  else if(base_point.x > 0 && base_point.y > 0)
  {
    final_angle = temp_angle+180;
  }
  else if(base_point.x > 0 && base_point.y < 0)
  {
    final_angle = (90-temp_angle)+90;
  }
  else if(base_point.x < 0 && base_point.y < 0)
  {
    final_angle = temp_angle;
  }

  for (i = 0; i<n ; i++){

    enemies.push(
      {
        x: base_point.x + Math.random()*50,
        y: base_point.y + Math.random()*50,
        angle: final_angle,
        type: t
      }
    );
  }

  $(enemies).each(function(i,d){
    d.r = Math.round(Math.random()*10)+5;
    d.x = width/2+d.x;
    d.y = height/2+d.y;
    d.delay = function(d,i){return Math.random()*1000;}
  });

  console.log("base "+base_point.x,base_point.y);
  console.log("enemies "+enemies[0].x, enemies[0].y, enemies[0].angle);
  return enemies;
}
//single color - consective
function singleColorDotsConsecutive(){
  var n =  8;
  var t = Math.floor(Math.random()*3);
  var base_angle  = Math.round(Math.random()*360); 
  var rads = Math.round(Math.random()*10)+2;
  var enemies = [];
  var direction = Math.floor(Math.random()*2);
  for (i = 0; i<n ; i++){
    var point;
    if(direction==0){ point = generatePointOnCircle(base_angle+i*15,width);}
    else{ point = generatePointOnCircle(base_angle-i*15,width); }
    enemies.push(
      {
        x: point.x,
        y: point.y,
        type: t,
        r: rads
      }
    );
  }

  $(enemies).each(function(i,d){
    d.x = width/2+d.x;
    d.y = height/2+d.y;
    d.delay = function(d,i){return i*200;}
  });

  return enemies;

}

//single color - opposite
function singleColorDotsOpposite(){
  var n =  4;
  var t = Math.floor(Math.random()*3);
  var base_point  = generatePointOnCircle(Math.round(Math.random()*360),width);
  var enemies = [];

  var temp_angle = (Math.atan2(Math.abs(base_point.y),Math.abs(base_point.x)))*(180/Math.PI);
  var final_angle;

  if(base_point.x < 0 && base_point.y > 0)
  {
    final_angle = (90-temp_angle)+270;
  }
  else if(base_point.x > 0 && base_point.y > 0)
  {
    final_angle = temp_angle+180;
  }
  else if(base_point.x > 0 && base_point.y < 0)
  {
    final_angle = (90-temp_angle)+90;
  }
  else if(base_point.x < 0 && base_point.y < 0)
  {
    final_angle = temp_angle;
  }

  for (i = 0; i<n ; i++){
    enemies.push(
      {
        x: base_point.x + Math.random()*50,
        y: base_point.y + Math.random()*50,
        angle: final_angle,
        type: t,
        delay:function(d,i){return i*1000;}
      }
    );
  }

  $(enemies).each(function(i,d){
    d.r = Math.round(Math.random()*10)+5;
    if(i%2==0){
      d.x = width/2+d.x;
      d.y = height/2+d.y;
    }
    else{
      d.x = (width/2-d.x);
      d.y = (height/2-d.y);
     
    }
    // d.type = Math.floor(Math.random()*3);
  });
  // console.log("sa "+Math.round(Math.random()*360));

  return enemies;

}

//-----------------------------------execution-------------------------------

$(function(){
  setup();
});


function setup(){
  game_status.state = 0;
  game_status.health = [100,100,100];
  game_status.base_rotation = 0;
  game_status.progress = 0;
  game_status.multiplier = 1;
  enemies = [];
  cannonAttr.crotation = 90;

  svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("style","background-color:black");

  svg.append("text")
    .attr("x",50)
    .attr("y",50)
    .attr("font-family", "sans-serif")
    .attr("font-size", "20px")
    .attr("fill","white")
    .text(game_status.base_rotation);

  svg.append("text")
    .attr("id","state_indicator")
    .attr("x",width/2)
    .attr("y",height/2 - 100)
    .attr("font-family", "sans-serif")
    .attr("font-size", "20px")
    .attr("fill","white")
    .attr("text-anchor","middle")
    .text(pause_text);

  //inner buf indicator
  inArc.endAngle(0);
  svg.append("path")
    .attr("class","indicator")
    .attr("d", inArc)
    .attr("transform", "translate("+height/2+","+width/2+")")
    .attr("fill", "white")
    .attr("fill-opacity", "60%");
 
  d3.select("body")
    .on("keydown", function()
    {
      if(d3.event.keyCode == 37) //press left
      {
        control_status.rotate = 1;
      }
      else if(d3.event.keyCode == 39)//press right
      {
        control_status.rotate = -1;
      }
      else if(d3.event.keyCode == 32) //press space
      {
        if(game_status.state == 0)
        {
          setGameState(1);
        }
        else if(game_status.state == 1)
        {
          setGameState(2);
        }
        else if(game_status.state == 2)
        {
          setGameState(1);
        }
        else if(game_status.state == 3)
        {
          clearInterval(controlInterval);
          svg.remove();
          setup();
        }
      }
      else if(d3.event.keyCode == 8) //press backspace
      {
          if(typeof $(".laser") !== 'undefined') 
          {
            $(".laser").remove();
          }

          var enemy = $(".enemy");

          var laserFire = svg.append("rect")
                              .attr("class","laser")
                              .attr("x","250")
                              .attr("y","250")
                              .attr("width","350")
                              .attr("height","1")
                              .attr("fill","white")
                              .attr("stroke","white")
                              .attr("transform","rotate("+ld+" 250 250)");



          d3.select("body").on("keyup",function(){
               if(typeof $(".laser") !== 'undefined') {
                $(".laser").remove();
              }

              if(d3.event.keyCode == 37){
                control_status.rotate = 0;
              }
              else if(d3.event.keyCode == 39){
                control_status.rotate = 0;
              }
            });

          if(enemy.attr("id") > (cannonAttr.crotation%360)-((enemy.attr("r")/2)+4) && enemy.attr("id") < (cannonAttr.crotation%360)+((enemy.attr("r")/2)+4))
          {
            enemy.remove();
          }
          // console.log("cannon "+cannonAttr.crotation%360);


      }
      else if(d3.event.keyCode == 13) { //press enter

        if(typeof $(".line") !== 'undefined') {
          $(".line").remove();
        }
        var enemy = $("circle").first();
        /*
        * get first circle coordinates
        * */
        var enemyCx = enemy.attr("cx");
        var enemyCy = enemy.attr("cy");

        var lineData = [ {"x": 250, "y": 255},
                         {"x": enemyCx, "y": enemyCy}];

        var lineFunction = d3.svg.line()
                                .x(function(d) { return d.x; })
                                .y(function(d) { return d.y; })
                                .interpolate("linear");

        var lineGraph = svg.append("path")
                                .attr("class", "line")
                                .attr("d", lineFunction(lineData))
                                .attr("stroke", "red")
                                .attr("stroke-width", 2)
                                .attr("fill", "none");


        // it cheat with health...
        if(enemy.attr("fill") === '#1f77b4') {
          game_status.health[0] +=parseInt(enemy.attr("r"));
        }
        if(enemy.attr("fill") === '#aec7e8') {
          game_status.health[1] +=parseInt(enemy.attr("r"));
        }
        if(enemy.attr("fill") === '#ff7f0e') {
          game_status.health[2] +=parseInt(enemy.attr("r"));
        }

        enemy.remove();

        d3.select("body").on("keyup",function(){
             if(typeof $(".line") !== 'undefined') {
              $(".line").remove();
            }

            if(d3.event.keyCode == 37){
              control_status.rotate = 0;
            }
            else if(d3.event.keyCode == 39){
              control_status.rotate = 0;
            }
          });
      }
      
    })
   .on("keyup", function(){
      if(d3.event.keyCode == 37){
        control_status.rotate = 0;
      }
      else if(d3.event.keyCode == 39){
        control_status.rotate = 0;
      }
    });


  //data is offsets
  svg.selectAll(".arcs").data([0,120,240]).enter().append("path")
    .attr("class","arcs")
    .attr("d", arc)
    .attr("transform", "translate("+ base_circle.x +","+ base_circle.y +")")
    .attr("fill",function(d,i){return color(i);})
    .attr("fill-opacity","60%");

  svg.selectAll(".inner-arcs").data(game_status.health).enter().append("path")
    .attr("class","inner-arcs")
    .attr("d", innerArc)
    .attr("transform", "translate("+height/2+","+width/2+")")
    .attr("fill",function(d,i){return color(i);});

  svg.append("text")
    .attr("class","mIndicator")
    .attr("x",width/2)
    .attr("y",height/2+5)
    .attr("font-family", "sans-serif")
    .attr("font-size", "15px")
    .attr("text-anchor", "middle")
    .attr("fill","white")
    .text("x 1");


  var cannon = svg.append("ellipse")
    .attr("id","cannon")
    .attr("cx",cannonAttr.cx)
    .attr("cy",cannonAttr.cy)
    .attr("rx",cannonAttr.rx)
    .attr("ry",cannonAttr.ry)
    .attr("fill","gray");

  controlInterval = setInterval(function(){
    //if(gameState == )
    if(game_status.state == 1){
      if(control_status.rotate == 0 ){
      //do nothing
      }
      else if(control_status.rotate > 0){
        game_status.base_rotation -= 4;
        cannonAttr.crotation -= 4;
      }
      else if(control_status.rotate < 0){
        game_status.base_rotation += 4;
        cannonAttr.crotation += 4;
      }
    }

    game_status.base_rotation = game_status.base_rotation%360;
    if(game_status.base_rotation<0) game_status.base_rotation = 360 + game_status.base_rotation;

    $(game_status.health).each(function(i,d){
      if(d <= 0){
        lossGame();
      }
    });

    changeArc(svg);
  },20);

}

