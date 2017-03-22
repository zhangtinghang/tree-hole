/*!
 * ======================================================
 * FeedBack Template For MUI (http://dev.dcloud.net.cn/mui)
 * =======================================================
 * @version:1.0.0
 * @author:cuihongbao@dcloud.io
 */
(function() {
	var index = 1;
	var size = null;
	var imageIndexIdNum = 0;
	var feedback = {
		imageList: document.getElementById('image-list'),
		submitBtn: document.getElementById('btn_send')
	};
	var url = 'http://139.219.189.127/api/postComment';
	feedback.files = [];	//文件初始化
	feedback.uploader = null;  //上传文件初始化
	feedback.deviceInfo = null;  //设备信息初始化
	mui.plusReady(function() {
		//设备信息，无需修改
		feedback.deviceInfo = {
			appid: plus.runtime.appid, 
			imei: plus.device.imei, //设备标识
			images: feedback.files, //图片文件
			p: mui.os.android ? 'a' : 'i', //平台类型，i表示iOS平台，a表示Android平台。
			md: plus.device.model, //设备型号
			app_version: plus.runtime.version,
			plus_version: plus.runtime.innerVersion, //基座版本号
			os:  mui.os.version,
			net: ''+plus.networkinfo.getCurrentType()
		}	
	});
	/**
	 *提交成功之后，恢复表单项 
	 */
	feedback.clearForm = function() {
		feedback.imageList.innerHTML = '';
		feedback.newPlaceholder(); //初始化图片域占位
		feedback.files = [];
		index = 0;
		size = 0; //文件大小初始化
		imageIndexIdNum = 0;
	};
	//获取文件存入数组；将对象的数组提出来转化为数组
	feedback.getFileInputArray = function() {
		return [].slice.call(feedback.imageList.querySelectorAll('.file'));
	};
	//添加文件
	feedback.addFile = function(path) {
		feedback.files.push({name:"images"+index,path:path});
		index++;
	};
	/**
	 * 初始化图片域占位
	 */
	feedback.newPlaceholder = function() {
		//拿到转换的数组
		var fileInputArray = feedback.getFileInputArray();
		if (fileInputArray &&
			fileInputArray.length > 0 &&
			fileInputArray[fileInputArray.length - 1].parentNode.classList.contains('space')) {
			return;
		};
		imageIndexIdNum++;
		var placeholder = document.createElement('div');
		placeholder.setAttribute('class', 'image-item space');
		var up = document.createElement("div");
		up.setAttribute('class','image-up')
		//删除图片
		var closeButton = document.createElement('div');
		closeButton.setAttribute('class', 'image-close');
		closeButton.innerHTML = 'X';
		//小X的点击事件
		closeButton.addEventListener('tap', function(event) {
			setTimeout(function() {
				feedback.imageList.removeChild(placeholder);
			}, 0);
			return false;
		}, false);
		
		//fileInputDIV构成一个上传文件的容器
		var fileInput = document.createElement('div');
		fileInput.setAttribute('class', 'file');
		fileInput.setAttribute('id', 'image-' + imageIndexIdNum);
		fileInput.addEventListener('tap', function(event) {
			var self = this;
			var index = (this.id).substr(-1);//提取出标识
			
			plus.gallery.pick(function(e) { //从系统相册选择文件（图片或视频）
				console.log("event:"+e);
				//提取出名字
				var name = e.substr(e.lastIndexOf('/') + 1); //lastIndexOf返回一个指定的字符串值最后出现的位置
				console.log("name:"+name);
					
				plus.zip.compressImage({ //JSON对象，配置图片压缩转换的参数
					src: e,	//压缩转换原始图片的路径
					dst: '_doc/' + name, //压缩转换目标图片的路径
					overwrite: true, //覆盖生成新文件
					quality: 50 //压缩图片的质量
				}, function(zip) {
					size += zip.size  
					console.log("filesize:"+zip.size+",totalsize:"+size);
					if (size > (10*1024*1024)) {
						return mui.toast('文件超大,请重新选择~');
					}
					if (!self.parentNode.classList.contains('space')) { //已有图片
						//删除图片位置（位置，数目，向数组添加新项目）
						feedback.files.splice(index-1,1,{name:"images"+index,path:e});
					} else { //加号
						placeholder.classList.remove('space');
						feedback.addFile(zip.target);
						//初始化占图域
						feedback.newPlaceholder();
					}
					up.classList.remove('image-up');
					placeholder.style.backgroundImage = 'url(' + zip.target + ')';
				}, function(zipe) {
					mui.toast('压缩失败！')
				});
				
			}, function(e) {
				mui.toast(e.message);
			},{});
		}, false);
		placeholder.appendChild(closeButton);//X图标DIV
		placeholder.appendChild(up);//上传图标DIV
		placeholder.appendChild(fileInput); //文件上传DIV插入另外一个DIV
		feedback.imageList.appendChild(placeholder);
	};
	//初始化图片占位域
	feedback.newPlaceholder();
	//发送按钮监听事件
	feedback.submitBtn.addEventListener('tap', function(event) {
		//判断网络连接
		if(plus.networkinfo.getCurrentType()==plus.networkinfo.CONNECTION_NONE){
			return mui.toast("连接网络失败，请稍后再试");
		}
		//extend（）将两个对象合并成一个对象。
		feedback.send(mui.extend({}, feedback.deviceInfo, {
			images: feedback.files,
		})) 
	}, false)
	//发送
	feedback.send = function(content) {
		feedback.uploader = plus.uploader.createUpload(url, {
			method: 'POST'
		}, function(upload, status) {
//			plus.nativeUI.closeWaiting()
			console.log("upload cb:"+upload.responseText);
			if(status==200){
				//parse用于从一个字符串中解析出json对象
				var data = JSON.parse(upload.responseText);
				//上传成功，重置表单
				if (data.ret === 0 && data.desc === 'Success') {
//					mui.toast('反馈成功~')
					console.log("upload success");
//					feedback.clearForm();
				}
			}else{
				console.log("upload fail");
			}
			
		});
		//添加上传文件
		mui.each(feedback.files, function(index, element) {
			var f = feedback.files[index];
			var path = f.path;
			console.log("addFile:"+path);
			GetBase64Code(path);
		});
		
		function GetBase64Code(path) //path绝对路径
		{
			var bitmap = new plus.nativeObj.Bitmap("test"); //test标识谁便取
			// 从本地加载Bitmap图片
			bitmap.load(path, function() {
				var base64 = bitmap.toBase64Data();
				console.log(base64)
			}, function(e) {
				console.log('加载图片失败：' + JSON.stringify(e));
			});
		}
		//开始上传任务
		feedback.uploader.start();
//		plus.nativeUI.showWaiting();
	};
})();