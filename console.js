(function(){
document.onselect = false;
function bind(elm,action,listener){
	if (window.attachEvent) {
        elm.attachEvent("on" + action, listener);
    }
    else {
        elm.addEventListener(action, listener, false); 
    }
}
/* 单例模式 */
function vConsole(config){

    if( typeof vConsole.unique !== 'undefined' ){
        return vConsole.unique; 
    }
    vConsole.unique = this;
    var commandRecord = {
    	commands : [], //存放命令的记录
    	index : 0
    } ;
    var that = this;
    var consoleBox = document.createElement("div");
    var titleBar = document.createElement("div");
    	titleBar.select = false;
    var messageBox = document.createElement("div");
    var commandBox = document.createElement("div");
    var commandInput = document.createElement("input");
    	commandInput.type = "text";
    	commandInput.index = 0;
    var runButton = document.createElement("input");
    	runButton.type = "button";
  
    function ajax (config){
    	config = config || {};
    	config.method = config.method || "get";
    	config.url = config.url || "console.css";
    	config.callback = config.callback || function(){};
    	var xhr;
        if(window.ActiveXObject){ //如果是IE浏览器  
            xhr = new ActiveXObject("Microsoft.XMLHTTP");  
        }else if(window.XMLHttpRequest){ //非IE浏览器  
           	xhr = new XMLHttpRequest();  
        }  
		xhr.open(config.method, config.url);
		xhr.send();
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4) {
			    if(xhr.status == 200) {
			    	config.callback(xhr.responseText);
				}
			}
		}
    }
 
    function init(){
  
		ajax({
			callback : function(res){
				try{
    				var style = document.createElement("style"),
						head = document.getElementsByTagName("head")[0];
						style.innerHTML = res;
						head.appendChild(style);
				}
				catch(e){
					//兼容IE
					document.createStyleSheet("javascript:'" + res + "'");
				}
				//document.body.innerHTML = "<div class = 'consoleBox'>12312</div>"
				addChild();
			}
		});
		function addChild(){
			consoleBox.className = "consoleBox" ;
	    	messageBox.className = "messageBox" ;
	    	titleBar.className = "titleBar";
	    	titleBar.innerHTML = "console<div style='position:absolute;right:0px;top:0px;'><input type = 'button' value = '关闭' onclick ='console.close()'/></div>";
	    	commandInput.className = "commandInput";
	    	runButton.value = "run";
	    	document.body.appendChild(consoleBox);
	    	consoleBox.appendChild(titleBar);
	    	titleBarDrag();
	    	consoleBox.appendChild(messageBox);
	    	consoleBox.appendChild(commandBox);
	    	commandBox.appendChild(commandInput);
	    	commandInput.focus();
	    	commandBox.appendChild(runButton);
	    	//绑定键盘监听
	    	bind(commandInput,"keydown",function(e){
	    		e = e || window.event;	
	    		var key = e.keyCode || e.which;
	    		var handle = {
	    			38 : function(){	//上
	    				getHistoryCommand_up();
	    			},
	    			40 : function(){	//下	
	    				getHistoryCommand_down;
	    			},
	    			13 : function(){
	    				runCommand(e);
	    			}
	    		}
	    		if(typeof handle[key] === 'function'){
	    			handle[key]();
	    			e.preventDefault();
	    		}
	    	});
	    	bind(runButton ,"click",runCommand);
    	}
    	function titleBarDrag(){

    		var select = false,
    			startX,
    			startY,
    			left,
    			top;
    		bind(titleBar,'mousedown',function(e){
	    		e = e || window.event;
	    		select = true;
	    		titleBar.style.cursor = "pointer";
	    		startX = e.clientX;
	    		startY = e.clientY;
	    		left = consoleBox.offsetLeft;
	    		top  =consoleBox.offsetTop;
	    	});
	    	bind(document,"mousemove",function(e){
	    		if(!select)
	    			return ;
	    		e = e || window.event;
	    		consoleBox.style.left = left + e.clientX - startX + "px";
	    		consoleBox.style.top = top + e.clientY - startY + "px";
	    	});
	    	bind(titleBar,"mouseup",function(e){
	    		titleBar.style.cursor = "";
	    		select = false;

	    	});
    	}
    }
    function getHistoryCommand_up(){
    	if(commandRecord.commands.length == 0 ){
			return ;
		}	
		if(commandRecord.index >= commandRecord.commands.length ){
			commandInput.value = "";
			return ;
		}else{
			if(commandRecord.index < 0){
				commandRecord.index = 0;
			}
			commandInput.value = historyCommand(commandRecord.index);
			commandRecord.index ++ ;	
		}
    }
    function getHistoryCommand_down(){
		if(commandRecord.commands.length == 0 ){
			return ;
		}
		if(commandRecord.index < 0){
			commandInput.value = "";
		}else{
			if(commandRecord.index >= commandRecord.commands.length){
				commandRecord.index = commandRecord.commands.length - 1;
			}
			commandInput.value = historyCommand(commandRecord.index);
			commandRecord.index -- ;
		}
    }
    function commandChange(command){

    }
    function historyCommand(index){
    	return commandRecord.commands[index];
    }
    function pushToHistory(command){
    	if(commandRecord.commands[0] === command){
    		return;
    	}
    	commandRecord.commands.unshift(command);
    }
    function runCommand(e){
		e = e || window.event;
		var command = commandInput.value;
		pushToHistory(command);
		commandRecord.index = 0 ; 
		commandInput.value = ""; //清空输入栏
		var result = "<div class = 'objBlock'>" 
		+ getResult(command);
		+ "</div>";
		that.log(">>" + result);
    }
    function getResult(command,callback){
    	var result;
		try{
		 	result = window.eval(command);	
		}
		catch(e){
			return "<p class = 'error' >" 
			+ e.toString() 
			+ "</p>";
		}
		return typeHandler(result);
    }
    function showInnerObject(obj){  //
    	var message = "";
    	for(var i in obj){
    		message +=  ""
    		+ "<div class = 'objrows'><span class = 'key'>" + i + "</span>" 
    		+ ":"
    		+ typeHandler(obj[i])
    		+ "</div>" ;
    	}
    	message = message.substr(0,message.length-1);
    	return message;
    }
    function minimize (){

    }
    function typeHandler(obj,type){
    
    	var handler = {
    		'object':function(obj){
    			//Aarry Date 这些都属于object
    			var objstring = "<span class = 'obj'>Object "
    			 + showInnerObject(obj) 
    			 + " }</span>";
    			 return objstring;
    		},
    		'function':function(obj){
    			return obj = "<span class = 'function' >" 
    					   + obj.toString()
    					   + "</span>";
    		},
    		'string':function(obj){
    			var str = '<span class = "string">';
    			str +=  '"' + obj + '"';
    			str += "</span>";
    			return str;
    		},
    		'number':function(obj){
    			var num = '<span class = "num">';
    			num +=  obj;
    			num += "</span>";
    			return num;
    		},
    		'boolean':function(obj){
    			var boolean = '<span class = "boolean">';
    			boolean +=  obj;
    			boolean += "</span>";
    			return boolean;
    		},
			'undefined':function(obj){
				var undefined = '<span class = "undefined">undefined</span>';
				return undefined;
			}

    	};
    	var type = typeof obj;
    	return handler[type](obj);
    }
    this.log =  function(msg){
    	msg = msg || "";
    	messageBox.innerHTML += msg; 
    	messageBox.scrollTop = messageBox.scrollHeight;
    }
    this.dir = function(){

    }
    //测试运行时间
    var timeRecord = [];
    this.time = function(timename){
    	timeRecord[timename] = {};
    	timeRecord[timename] = new Date();
    }
    this.timeEnd = function(timename){
    	var nowtime = new Date();
    	var timespan = nowtime.getTime() - timeRecord[timename].getTime();
    	this.log(timespan.toString() + "ms");
    	delete timeRecord[timename]; //清空所占内存
    }
    //查看函数调用 
    this.trace = function(){
    	 alert(arguments.callee);
    	 console.log(this.trace.caller);
    }
   	//测试表达式真假
    this.assert = function(exp){ 

    }
    this.clear = function(){
    	messageBox.innerHTML = "";
    }
    this.close = function(){
    	consoleBox.parentNode.removeChild(consoleBox);
    	console = null;
    }

    init();
}
console = new vConsole();
})();