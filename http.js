'use strict';

var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');
var log = console.log;

//房间在线人数列表
var userMap = new Map(),
	msgArr = {};

//消息主体，type※id※msg
var msgObj={},
	msgType,
	msgID,
	msg,
	lastMsg,msgCounter=1,hasNewMsg=false;


// 创建http server，并传入回调函数:
var server = http.createServer(function (request, response) {
    // 回调函数接收request和response对象,
    // 获得HTTP请求的method和url:
    
	
	 if(request.method == "POST"){
		 var inputArr=[],
			postdata='';//这里不设置'',则为undefined
			
        request.addListener("data",function(postchunk){
            //postdata = postchunk;
			//如果不加+=,那么数据为Buffer
            postdata+= postchunk;
	  })
	  
     //POST结束输出结果
		request.addListener("end",function(){
			inputArr = postdata.split('※')
			msgType=inputArr[0];
			msgID=inputArr[1];
			msg=inputArr[2];

			if(msgType=='getMsg'){
				
				if(msgObj[msgID]!=null){
					if(lastMsg!=msgObj[msgID]){
						msgCounter=1;
						hasNewMsg=true;
						lastMsg=msgObj[msgID];
					}
					
//限定输出50次，这个次数可以根据房间人数确定，从而节约开支
					if(hasNewMsg || msgCounter<50){
					log('output "'+msgObj[msgID]+'" to room : '+msgID)
					response.writeHead(200);
					response.end(msgObj[msgID]);
					hasNewMsg=false;
					msgCounter++;
					}else{
						response.writeHead(200);
						response.end();
					}
				}
				else{
					//房间里还没有聊天记录
					response.writeHead(200);
					response.end();
				}
				
			}
			else if(msgType=='getOnline'){
						var rs=userMap.get(msgID)	
						response.writeHead(200);
						if(rs==true){
							response.end(''+rs);
						}else{
							response.end();
						}
						
					}
			
			else if(msgType=='setMsg'){

				//if(msgObj[msgID]!=null){
				//msgObj[msgID].push(msg)
				//}
				//else{
				//上面为堆栈结构，服务器储存多条记录，下面只储存一条
				
				msgObj[msgID]=msg;				
				response.writeHead(200);
				response.end();
			}
        })
		
		
    }

	 
	 
	 //GET method request
	 else{
		 
	var filepath = "./xTrans"+url.parse(request.url).pathname;
	var queryStr = url.parse(request.url).query;
	
	fs.stat(filepath, function (err, stats) {

			if(filepath.toLowerCase()=='./xtrans/index.html' || filepath=='./xTrans/'){
						if(queryStr!==null){
								if (queryStr.indexOf('id')==0){
									
								//房间号
								var requestID=queryStr.substr(3)
								if(userMap.get(requestID)===undefined){
									userMap.set(requestID,false)
									log('a room has created! ID : '+requestID)
								}
								else{
									userMap.set(requestID,true)
									log('somebody joined this room ID : '+requestID)
								}
							}
							
						}
			response.writeHead(200);
			fs.createReadStream('./xTrans/index.html').pipe(response);
			}
           else{
			           if (!err && stats.isFile()) {
		   response.writeHead(200);
				fs.createReadStream(filepath).pipe(response);
        } else {

            response.writeHead(404);
            response.end('404 Not Found');
			
        }
			 
		   }

    });
	 }

	//log(request.method + ': ' + request.url);
	
});

// 让服务器监听80端口:
server.listen(process.env.PORT);
log('Server is running');