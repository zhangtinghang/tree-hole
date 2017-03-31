

function plusReady(){
		var imageWidth = document.getElementById("imageWidth");
		var imgFormat = '';
		var line = document.getElementById("line");
		init();
		photo();
		picture();
		//点击图片预览大图
		mui.previewImage();
	}
	if(window.plus){
		plusReady();
	}else{
		document.addEventListener('plusready', plusReady, false);
	}
	
	//初始化
	function init(){
		var content_textarea = document.getElementById("content_textarea");
		var contact = document.getElementById("contact");
		content_textarea.value = '';
		contact.value = '';
		
		imageWidth.style.display = 'none';
		line.style.display = 'none';
		plus.storage.removeItem('imgFormat');
		plus.storage.removeItem('Imgbase64');
	}
	
	//取消事件
	document.getElementById("btn-return").addEventListener('tap',function(){
		init();
		mui.back();
	})
	
	//监听长按事件
	mui("#line").on('tap','.deleteBtn',function(){
		imageWidth.style.display = 'none';
		line.style.display = 'none';
		plus.storage.removeItem('imgFormat');
		plus.storage.removeItem('Imgbase64');
	})
	//发送数据
	document.getElementById("btn_send").addEventListener('tap',function(){
		var imageWidth = document.getElementById("imageWidth");
		var content_textarea = document.getElementById("content_textarea");
		var contact = document.getElementById("contact");
		var token = plus.storage.getItem('name_token');
		var Imgbase64 = plus.storage.getItem('Imgbase64');
		var imgFormat = plus.storage.getItem('imgFormat');
		if (content_textarea.value == '' ||contact.value == '') {
			return mui.toast('信息填写不符合规范');
		}
		if (content_textarea.value.length > 200 ||contact.value.length > 6) {
			return mui.toast('信息超长,请重新填写~')
		}
		//判断网络连接
		if(plus.networkinfo.getCurrentType()==plus.networkinfo.CONNECTION_NONE){
			return mui.toast("连接网络失败，请稍后再试");
		}
		var w=plus.nativeUI.showWaiting("处理中，请等待...\n", {padlock:true});
			if(imageWidth.style.display == 'block'){
				upPic(token,Imgbase64,imgFormat,w);
			}else{
				upData(token,content_textarea,contact,w);
			}
			
		});
		
	//拍照
	function photo(){
			document.getElementById("photo").addEventListener("tap", function() {
					/**
					 * 获取摄像头对象
					 * http://www.html5plus.org/doc/zh_cn/camera.html#plus.camera.getCamera
					 */
					var camera = plus.camera.getCamera();
					/**
					 * 进行拍照操作
					 * http://www.html5plus.org/doc/zh_cn/camera.html#plus.camera.Camera.captureImage
					 */
					camera.captureImage( function ( path ) {
						plus.gallery.save( path ,function(){
							console.log('保存照片成功')
							basepic('file:///'+path);
						},function(){
							console.log('保存照片失败')
						});
						var path=plus.io.convertLocalFileSystemURL(path);	
						line.style.display = 'block';
						imageWidth.style.display = 'block';
						imageWidth.src = path;
					}, function ( path ) {
					line.style.display = 'none';
					imageWidth.style.display = 'none';
					mui.toast( "取消拍照" );
				}, {filename:"_doc/gallery/",index:1} );
		});
	}

//相册选择
	function picture(){
		document.getElementById("picture").addEventListener('tap',function(){
			plus.gallery.pick( function(path){
				//提取出格式
				imgFormat = path.substr(path.lastIndexOf('.') + 1);
				console.log(path)
				basepic(path);
				line.style.display = 'block';
				imageWidth.style.display = 'block';
				imageWidth.src = path;
			}, function(path){
				line.style.display = 'none';
				imageWidth.style.display = 'none';
				mui.toast('取消拍照');
			}, {});	
		})
	}
	
//将图片转化为base64
	function basepic(path){
		//提取出格式
		var imgFormat = path.substr(path.lastIndexOf('.') + 1);
		console.log('这是照片格式'+imgFormat)
		var bitmap = new plus.nativeObj.Bitmap("test"); //test标识谁便取
		// 从本地加载Bitmap图片
		var Img=bitmap.load(path, function() {
			var base64 = bitmap.toBase64Data();
			plus.storage.setItem('Imgbase64',base64);
			plus.storage.setItem('imgFormat',imgFormat);
		}, function(e) {
			console.log('加载图片失败：' + JSON.stringify(e));
		}); 
	}

//照片上传
function upPic(token,Imgbase64,imgFormat,w){	
			mui.ajax('http://139.219.189.127:5000/api/uploadImg',{
				data:{
					token:token,
					img:Imgbase64,
					imgFormat:imgFormat
				},
				dataType:'json',//服务器返回json格式数据
				type:'post',//HTTP请求类型
				timeout:10000,//超时时间设置为10秒；
				success:function(data){
					var data = JSON.stringify(data);
					var dataobj = eval("(" + data + ")");
					if(dataobj.success ==true){
						upData();
					}
				},
				error:function(xhr,type,errorThrown){
					w.close();
					mui.toast('上传数据出错，请重试！');
					console.log('图片上传出错：'+type);
				}
			})
	}

//数据上传
function upData(token,content_textarea,contact,w){
	mui.ajax('http://139.219.189.127:5000/api/announce', {
			data: {
				token:token,
				title:'1',
				text:content_textarea.value,
				type:0,
				tag:contact.value
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: { 'Content-Type': 'application/json' },
			success: function(data) {
				var data = JSON.stringify(data);
				var dataobj = eval("(" + data + ")");
				if(dataobj.success ==true){
					w.close();
					init();
					mui.openWindow({
							url: 'main.html',
							id: 'main.html'
						});
				}else{
					//TODO 获取数据失败
					w.close();
					mui.toast('获取数据出错，请稍后再试！');
				}
			},
			error: function(xhr, type, errorThrown) {
				w.close();
				//异常处理；
				mui.toast('上传数据失败，请稍后再试！');
				console.log(type);
			}
		});
		
}


