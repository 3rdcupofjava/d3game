//determine the key that user pressed
$(document).keypress(function(e){
	if(game_status.state == 1 && currentEnemies.length >= 1)	//allow user to press if the game is started and if there are enemies present
	{

		input = String.fromCharCode(e.keyCode);		//convert the key pressed to character and store to input
		
		$("text.enemyChar."+input+":first").attr("fill","yellow");	//highlight the first character
		setTimeout(function(){
			$(".text_holder."+input+":first").remove();		//remove the text
			$(".enemy_holder."+input+":first").remove();	//remove the enemy
		},100);	//timeout for removing the enemy
	}
});