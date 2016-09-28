var ID,
xmlHttp,
intervalID,
lastMsg,
hostIP='http://192.168.1.104/',
qrWidth=512,qrHeight=512,
isInputOpened = false;
//开启输入

// 定义一个摇动的阈值
var shakeThreshold = 4000,lastUpdate = 0; // 记录上一次摇动的时间
var x, y, z, lastX, lastY, lastZ; // 定义x、y、z记录三个轴的数据以及上一次触发的数据

var log = console.log;





function createxmlHttpRequest() { 
if (window.ActiveXObject) { 
xmlHttp = new ActiveXObject("Microsoft.XMLHTTP"); 
} else if (window.XMLHttpRequest) { 
xmlHttp=new XMLHttpRequest(); 
}
} 

function ajaxGet(ID){ 
// 注意在传参数值的时候最好使用encodeURI处理一下，以防出现乱码 
createxmlHttpRequest(); 
xmlHttp.open("GET",hostIP+'index.html?id='+ID); 
xmlHttp.send(null); 
xmlHttp.onreadystatechange = function() { 
if ((xmlHttp.readyState == 4) && (xmlHttp.status == 200)) { 
return true; 
} else { 
return false; 
} 
} 
} 


function ajaxPost(data){ 
createxmlHttpRequest(); 
xmlHttp.open("POST",hostIP,true); 
xmlHttp.send(data); 
xmlHttp.onreadystatechange = function() { 
if ((xmlHttp.readyState == 4) && (xmlHttp.status == 200)) { 
if(data.indexOf('getMsg')==0 && xmlHttp.responseText!=lastMsg &&xmlHttp.responseText!=''){
	pagesCount++;
	
	
	var newMsgDiv = document.createElement('div');
	newMsgDiv.setAttribute('class','pt-page pt-page-'+pagesCount)
	newMsgDiv.innerHTML = "<div></div>";
	newMsgDiv.childNodes[0].innerText =xmlHttp.responseText;
	newMsgDiv.addEventListener("click",function(){
	autoCopy(this.childNodes[0].innerText);
  }); 
	document.getElementById('pt-main').appendChild(newMsgDiv); 
	
	
	if(current!=pagesCount-2 && pagesCount!=2){
		$('.pt-page-'+(current+1)).removeClass('pt-page-current')
		//log('需要删除的元素 .pt-page-'+current)
		
		current = pagesCount-2
		
		$('.pt-page-'+current+1).addClass('pt-page-current')
		//log('需要添加的元素 .pt-page-'+(current+1))
	}
	
	$( '#next-iterateEffects' ).click()
	lastMsg=xmlHttp.responseText;
	
}
else if(data.indexOf('getOnline')==0 && (xmlHttp.responseText=='true')){
	
	document.getElementById("qrcode").remove();
	clearInterval(intervalID)	
	setReadMsg(ID);
}
return true; 
} else { 
return false; 
} 
} 
}



function initID(){
	ID= Math.floor(Math.random()*10000);
	ajaxGet(ID)
	document.getElementById('initID-box').value='ID : '+ID;
	intervalID=setInterval(function(){
	ajaxPost('getOnline※'+ID+'※null');
	},1000)
	
	
	new QRCode(document.getElementById("qrcode"), {
	text: hostIP+"index.html?id="+ID,
	width: qrWidth,
	height: qrHeight,
	colorDark : "#000000",
	colorLight : "#ffffff",
	correctLevel : QRCode.CorrectLevel.H
});
	
	
}

function setReadMsg(ID){
	console.log('已经获取到返回值，进行读取txt,id: '+ID)
	
	$('#control-btn').removeClass("hidden");
	$('#init').remove();
	if(qrHeight==300){
	
	$('.pt-page-1').html("<div><h1>操作：</h1><p>在输入界面粘贴文本或自行输入，点击submit发送或者摇一摇发送</p><p>点击收到的信息可直接复制。</p></div>");
	
	$('#input-box').removeClass("hidden");
	$('#input').focus();  
	isInputOpened = true;
	}else{
		$('.pt-page-1').html("<div><h1>操作:</h1><p>按Ctrl+V，直接提交粘贴板中的内容<br>点击收到的信息可直接复制<br>默认关闭PC端的输入界面，回车发送；shift+回车换行</p></div>");
	
		$("#open-input-btn").removeClass("hidden");
	}
	
	
	intervalID=setInterval(function(){
	ajaxPost('getMsg※'+ID+'※null');
	},1000)
	
}



function isPC()  
{  
           var userAgentInfo = navigator.userAgent;  
           var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");  
           var flag = true;  
           for (var v = 0; v < Agents.length; v++) {  
               if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }  
           }  
           return flag;  
}

 
// 运动传感器处理
function deviceMotionHandler(eventData) {
    var acceleration = eventData.accelerationIncludingGravity; // 获取含重力的加速度
    var curTime = new Date().getTime();
 
    // 100毫秒进行一次位置判断
    if ((curTime - lastUpdate) > 100) {
 
        var diffTime = curTime - lastUpdate;
        lastUpdate = curTime;
 
        x = acceleration.x;
        y = acceleration.y;
        z = acceleration.z;
 
        var speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;
        // 前后x, y, z间的差值的绝对值和时间比率超过了预设的阈值，则判断设备进行了摇晃操作
        if (speed > shakeThreshold) {
		
		
		if(!isVib){
           bellBtnClick(300)
		   setTimeout(function(){bellBtnClick(300);isVib=false;},500)
		   isVib=true;
		   }
		   
		   submit();
		   //尽管摇动手机也是自主操作，仍然无法模拟复制 粘贴
        }
 
        lastX = x;
        lastY = y;
        lastZ = z;
    }
}

function saveURL(obj)
{
	if(obj.nodeType===1) var spanObj=obj.nextSibling
	var hiddenInput=document.getElementById('this-page-URL')
	hiddenInput.value=window.location.href+'?id='+ID;
	hiddenInput.select(); 
	document.execCommand('copy');
	spanObj.innerText="房间地址已复制到粘贴板"
}

		
function GetQuery(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  decodeURI(r[2]); return null;
}

var isVib;
    function bellBtnClick(s) {
        if (navigator.vibrate) {
            navigator.vibrate(s);//震动秒数
        }else if (navigator.webkitVibrate) {
            navigator.webkitVibrate(s);
        }
    }
	
	
	
	
function submit(){
var sendText = document.getElementById('input').value;
if(sendText!=''&& sendText!=lastMsg){
ajaxPost('setMsg※'+ID+'※'+sendText);
document.getElementById('input').value='';
$('#input').focus();
}
else{
	xPrompt('quiz','请检查提交内容')
}
}

function openInput(){
if($('#input-box').hasClass("hidden")){
$('#input-box').removeClass("hidden");
$('#open-input-btn').css({
	"left": "70%",
	"background-color" : "#cf0404",
	"color":"#fff"
}).val("close input")
isInputOpened = true;
$('#input').focus();
}
else{
$('#input-box').addClass("hidden")
$('#open-input-btn').css({
	"left": "45%",
	"background-color" : "#fff",
	"color":"#aaa"
}).val("open input")
isInputOpened = false;	
}

}



function autoCopy(text){
 var textArea = document.createElement("textarea")

    textArea.style.position = 'fixed'
    textArea.style.top = 0
    textArea.style.left = 0
    textArea.style.width = '2em'
    textArea.style.height = '2em'
    textArea.style.padding = 0
    textArea.style.border = 'none'
    textArea.style.outline = 'none'
    textArea.style.boxShadow = 'none'
    textArea.style.background = 'transparent'
    textArea.value = text

    document.body.appendChild(textArea)

    textArea.select()

    try {
	document.execCommand('copy');
      xPrompt('ok','信息已复制到粘贴板');
    } catch (err) {
      xPrompt('alert','难道你用的是IE?不支持。。'+err);
    }

    document.body.removeChild(textArea)
	
}



function loadCSS(url){
                var cssLink = document.createElement("link");
                cssLink.rel = "stylesheet";
                cssLink.rev = "stylesheet";
                cssLink.type = "text/css";
                cssLink.media = "screen";
                cssLink.href = url;
                document.getElementsByTagName("head")[0].appendChild(cssLink);
}



window.onload = function(){
ID=GetQuery("id")
//有ID，PC: 通过链接进入房间的PC
if(ID!==null && isPC()){
setReadMsg(ID);	
$("#open-input-btn").removeClass("hidden");
}


//手机
else if(!isPC()){
qrWidth=300;
qrHeight=300;	
loadCSS('css/mobile.css');
if(ID!==null){
setReadMsg(ID);
}
else{
	initID();
}

// 监听传感器运动事件
if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', deviceMotionHandler, false);
} else {
    alert('浏览器太旧，不支持摇一摇，请使用最新谷歌浏览器');
} 

//防止手机输入时，输入框被挡住
$('input[type="text"],textarea').on('click', function () {
  var target = this;
  setTimeout(function(){
        target.scrollIntoViewIfNeeded();
      },400);
});
}


//没有ID，PC ： 初始二维码页面
else if(ID==null && isPC()){
initID();
}


var isShiftDown=false;
$('#input').bind('keydown', function(event) {
		if (event.keyCode == "16") {
		isShiftDown=true;
		}
	});

	$('#input').bind('keyup', function(event) {
		if (event.keyCode == "16") {
		isShiftDown=false;	
		}
	});

$('#input').bind('keypress', function(event) {
		if (event.keyCode == "13") {
			//回车执行查询
			
			if(!isShiftDown){
			event.preventDefault();
			submit();
			}
			
		}
	});


  function getClipboardText(event){
    var clipboardData = event.clipboardData || window.clipboardData;
    return clipboardData.getData("text");
  };
  document.addEventListener('paste',function(event){
	//console.log("监听到一个粘贴事件")
    var event = event || window.event;
    var text = getClipboardText(event);
	
	if(!isInputOpened){
	$('#input').val(text);
	submit();
	}
	else if(isInputOpened && isPC()){
		event.preventDefault();
		$('#input').val(text);
		submit();
	}
  }, false);	
  

}
