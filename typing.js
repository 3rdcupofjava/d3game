//determine the key that user pressed
$(document).keypress(function(e){
	if(game_status.state == 1 && currentEnemies.length >= 1 && e.keyCode != 32 && e.keyCode != 13)	//allow user to press if the game is started and if there are enemies present
	{

		var key = String.fromCharCode(e.keyCode);		//convert the key pressed to character and store to input

		input.push(key);

		$("text.enemyChar."+key+"[status=target]:first").attr("fill","yellow");	//highlight the first character
		$("text.enemyChar."+key+"[status=target]:first").attr("status","targeted");	//change the status
		$("circle.enemy."+key+"[status=target]:first").attr("status","targeted");
     
		// setTimeout(function(){
		// 	$(".text_holder."+key+":first").remove();		//remove the text
		// 	$(".enemy_holder."+key+":first").remove();	//remove the enemy
		// },100);	//timeout for removing the enemy
	}
	// else if(e.keyCode == 13)
	// {
	// 	while(x != input.length)
          // {
          
          // playSound.go();
          // if(typeof $(".line") !== 'undefined') {
          //   $(".line").remove();
          // }
          // var enemy = $("circle.enemy").first();
          // /*
          // * get first circle coordinates
          // * */
          // var enemyCx = enemy.attr("cx");
          // var enemyCy = enemy.attr("cy");

          // var lineData = [ {"x": 250, "y": 250},
          //                  {"x": enemyCx, "y": enemyCy}];

          // var lineFunction = d3.svg.line()
          //                         .x(function(d) { return d.x; })
          //                         .y(function(d) { return d.y; })
          //                         .interpolate("linear");

          // var lineGraph = svg.append("path")
          //                         .attr("class", "line")
          //                         .attr("d", lineFunction(lineData))
          //                         .attr("stroke", "red")
          //                         .attr("stroke-width", 2)
          //                         .attr("fill", "none");


          // // it cheat with health...
          // if(enemy.attr("fill") === '#1f77b4') {
          //   game_status.health[0] +=parseInt(enemy.attr("r"));
          // }
          // if(enemy.attr("fill") === '#aec7e8') {
          //   game_status.health[1] +=parseInt(enemy.attr("r"));
          // }
          // if(enemy.attr("fill") === '#ff7f0e') {
          //   game_status.health[2] +=parseInt(enemy.attr("r"));
          // }

          // for(var i=0; i<$("text.enemyChar").length; i++)
          // {
          //   var cId = "text_"+enemy.attr("id");
          //   if(cId == $("text.enemyChar")[i].id)
          //   {
          //     $("text.enemyChar")[i].remove();
          //   }
          // }
          // enemy.remove(); //remove the enemy
          // $("svg.enemy_holder").first().remove();
          // $("svg.text_holder").first().remove();

          // d3.select("body").on("keyup",function(){
          //      if(typeof $(".line") !== 'undefined') {
          //       $(".line").remove();
          //     }

          //     if(d3.event.keyCode == 37){
          //       control_status.rotate = 0;
          //     }
          //     else if(d3.event.keyCode == 39){
          //       control_status.rotate = 0;
          //     }
          //   });
          // }//end while
	// }
});