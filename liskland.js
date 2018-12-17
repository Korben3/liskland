//liskland by lisk delegate: korben3
//

//config variables
var network="test"; // main or test
var maxObjects=25;  // max number of transactions checked for objects 
var liskAddress="112233444L"; // lisk address used to receive the transactions

//setup
$("#maxObjects").html(maxObjects);
if(network=="test"){var networkClient=lisk.APIClient.createTestnetAPIClient();}else{var networkClient=lisk.APIClient.createMainnetAPIClient();}
$("#liskAddress").html(liskAddress);
var timestamp=0;
var qu=String.fromCharCode(34); //"

//functions
function loadObjects(){
	console.log(timestamp);
	networkClient.transactions.get({"recipientId":liskAddress,"limit":maxObjects,"offset":0,"sort":"timestamp:desc"})
	.then(res => {
		console.log(res.data[0].timestamp);
		if (timestamp!=(res.data[0].timestamp)){
			$(".liskland").html("")  //new objects detected, reset field "Incoming object!"
			timestamp=res.data[0].timestamp;

			var objectNum=0;
			for (var i=0; i<res.data.length; i++) { 
				
			   try {
					var data=JSON.parse(res.data[i].asset.data);
				}catch(e){
					var tmp="{"+qu+"liskland"+qu+":{"+qu+"object"+qu+":"+qu+"ufo01"+qu+","+qu+"move"+qu+":"+qu+"left"+qu+"}}";
					data=JSON.parse(tmp); //bad json, show ufo
				}
				
				objectNum++;
				objectSender=res.data[i].senderId;
				getDelegateName(objectNum,res.data[i].senderId);
				var img=data.liskland.object;
				if(data.liskland.move){
					//place moving object
					if(data.liskland.move=="left"){img+="rl";}else{img+="lr";}
					img="images/"+img+".png";
					$(".liskland").append("<div id='object"+objectNum+"' class='objects'><img src='"+img+"' onerror='noObject(this)'><div class='delegate' id='objectDelId"+objectNum+"'>"+objectSender+"</div></div>");
					if(data.liskland.move=="left"){
						$("#object"+objectNum).addClass("objectrlClass");
						$("#object"+objectNum).css("animation-delay",Math.floor((Math.random()*9)+1)+"s"); //randomize a bit to prevent overlap
						$("#object"+objectNum).css("animation-duration",Math.floor((Math.random()*20)+20)+"s");
						$("#object"+objectNum).css("transform","translate(-300px,170px)");
					}else{
						$("#object"+objectNum).addClass("objectlrClass");
						$("#object"+objectNum).css("animation-delay",Math.floor((Math.random()*9)+1)+"s");
						$("#object"+objectNum).css("animation-duration",Math.floor((Math.random()*20)+20)+"s");
						$("#object"+objectNum).css("transform","translate(0px,170px)");			
					}
				}else{
					//place fixed object
					img="images/"+img+".png";
					var xpos=data.liskland.x;
					if(xpos>4000 || xpos<0){xpos=Math.floor(Math.random()*4000);} //if an incorrect x value is given place it at a rnd valid position
					$(".liskland").append("<div id='object"+objectNum+"' class='objects'><img src='"+img+"' onerror='noObject(this)'><div class='delegate' id='objectDelId"+objectNum+"'>"+objectSender+"</div></div>");
					$("#object"+objectNum).css("transform","translate("+xpos+"px,170px)");
				}
			}
		}
	})			
}

//incorrect object/image show ufo
function noObject(image){
	image.onerror = "";
	image.src="images/ufo01.png";
	return(true)
};


function placeRefCode(object,canMove){
	if(canMove){
		var direction=$("#dir").val();
		if(direction!="left" && direction!="right"){direction="left";}
		var newRefCode="{"+qu+"liskland"+qu+":{"+qu+"object"+qu+":"+qu+object+qu+","+qu+"move"+qu+":"+qu+direction+qu+"}}";
	}else{
		var xValue=$("#x-pos").val();
		if(xValue>4000 || xValue<0){xValue=1875;}
		var newRefCode="{"+qu+"liskland"+qu+":{"+qu+"object"+qu+":"+qu+object+qu+","+qu+"x"+qu+":"+xValue+"}}";
	}
	$("#refCode").html(newRefCode);
}

// no need to wait for all api calls for possible delegate names, we'll just start the show and fill in the names later
function getDelegateName(id, senderId){
	networkClient.delegates.get({"address":senderId,"limit":1})
	.then(res2 => {
		try{objectSender=res2.data[0].username}catch(e){objectSender=senderId};
		$("#objectDelId"+id).html(objectSender);
	}).catch(console.error);
};

$("#menuButton").click(function(){
	$(".menuFull").toggle();
});

$(".menuImage").click( function(){
	console.log(this.className);
	if(this.className.split(" ")[1]=="canMove"){
		$("#objectFixed").hide(); $("#objectMoving").show();
		placeRefCode(this.title,true);
	}else{
		$("#objectFixed").show(); $("#objectMoving").hide();			
		placeRefCode(this.title,false);
	}
});

//fill in the x position for static objects by clicking on the playfield
$(document).click( function (event) {
	if(event.pageY>220 && $("#objectFixed").css("display")!="none"){
		var x = event.pageX;
		$("#x-pos").val(x);
		placeRefCode((JSON.parse($("#refCode").html()).liskland.object),false);
	}
});

$("#x-pos").change( function(){
	placeRefCode((JSON.parse($("#refCode").html()).liskland.object),false);
});
$("#dir").change( function(){
	placeRefCode((JSON.parse($("#refCode").html()).liskland.object),true);
});

$("#sendButton").click( function(){
	window.location.assign("lisk://wallet?recipient="+liskAddress+"&amount=0.01&reference="+$("#refCode").html());
});

//run
loadObjects();

//check for new objects - liskland is (a)live
setInterval(loadObjects,10000); 
