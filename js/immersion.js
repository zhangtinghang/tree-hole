document.addEventListener('plusready',function(){
		var topoffset = '45px';
    	// 兼容immersed状态栏模式
    	if(plus.navigator.isImmersedStatusbar()){
	    	var immersed = 0;
			var ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
			// 当前环境为沉浸式状态栏模式
			if(ms&&ms.length>=3){
			    immersed = parseFloat(ms[2]);// 获取状态栏的高度
			}
			topoffset = (immersed + 45)+'px';
			/*调整高度*/
	    	document.querySelector(".mui-bar-nav").style.paddingTop = immersed+'px';
	     	document.querySelector(".mui-bar-nav").style.height = topoffset; 
	     	document.querySelector(".mui-content").style.paddingTop = topoffset; 
	    }
	},false);
