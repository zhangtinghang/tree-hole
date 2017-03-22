	mui.plusReady(function(){
			var header_height = document.getElementById("header_box");//获取状态栏高度
			var header_box;
			if(header_height){
				header_box = header_height.offsetHeight;
			}
			var immersed = 0;//初始化状态栏高度
			var topoffset = header_box; //将状态栏高度赋值进行计算
			var ms=(/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
			if(ms && ms.length>=3){ // 当前环境为沉浸式状态栏模式
				immersed = parseFloat(ms[2]);// 获取状态栏的高度
				console.log('这是状态栏高度 = ' + immersed);
				topoffset = topoffset + immersed; //计算新的状态栏高度
				var t = document.getElementsByTagName('header')[0];//选中header标签
				var header_content = document.getElementById("header_content");
				if(t){
				t.style.paddingTop = immersed+'px'; //当有header时让header偏移出状态栏位置
				t.style.height= topoffset +'px';
				}
//				var mc = document.getElementsByClassName('mui-content')[0];
//				if (mc) {
//				var newpt =topoffset +'px';
//				mc.style.paddingTop = newpt;
//				}
			}
			
			
		plus.webview.currentWebview().setStyle({
   	 		softinputMode: "adjustResize"  // 弹出软键盘时自动改变webview的高度
		});
	})
