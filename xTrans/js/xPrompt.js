var isOnAnimation = 0;
function xPrompt(type,msg){
if(!isOnAnimation){
isOnAnimation =1;
var bgColor;
if(type=='alert'){
bgColor="#ed6369"
msg="☭"+msg
}
else if(type=='ok'){
bgColor="#199260"
msg="✓"+msg
}
else{
bgColor="#f7e400"
msg="?"+msg
}

var msgDiv = "<div id='msgDiv'>" + msg + "</div>";
$("body").append(msgDiv);

$("#msgDiv").css({
"position": "fixed",
"color":"#fff",
"text-align": "center",
"font-size":"2em",
"line-height":"2em",
"left": "0",
"top": "-10%",
"width": "100%",
"height": "10%",
"background-color" : bgColor,
"z-index": "99999998"
}).animate({"top":"1%"},300,function(){
	  $("#msgDiv").animate({"top":"-2.5%"},100,function(){
		 $("#msgDiv").animate({"top":"0.5%"},100,function(){
			 $("#msgDiv").animate({"top":"-1.5%"},100,function(){
				$("#msgDiv").animate({"top":"0%"},100,function(){
					$("#msgDiv").delay(1500).animate({"top":"-10%"},500,function(){
						$("#msgDiv").remove();
						isOnAnimation = 0;
					});
	});});});});});
		
}			
}