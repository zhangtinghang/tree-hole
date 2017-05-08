var w;
var content_textarea;
var contact;
var token;
var Imgbase64;
var imgFormat ='';
var imageWidth;
function plusReady(){
		imageWidth = document.getElementById("imageWidth");
		var line = document.getElementById("line");
		init();//初始化页面
		photo();//拍照
		picture();//相册
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
	});
	
	//监听点击事件
		mui("#line").on('tap','.deleteBtn',function(){
		imageWidth.style.display = 'none';
		line.style.display = 'none';
		plus.storage.removeItem('imgFormat');
		plus.storage.removeItem('Imgbase64');
	});

	//发送数据
		document.getElementById("btn_send").addEventListener('tap',function(){
		content_textarea = document.getElementById("content_textarea");
		contact = document.getElementById("contact");
		token = plus.storage.getItem('name_token');
		Imgbase64 = plus.storage.getItem('Imgbase64');
		imgFormat = plus.storage.getItem('imgFormat');
		if (content_textarea.value == '') {
			return mui.toast('亲，秘密为空哟~');
		}
		if (content_textarea.value < 10) {
			return mui.toast('亲，可以多说点哟~');
		}
		if(contact.value == ''){
			return mui.toast('亲，请填写关键字哟~');
		}
		//判断网络连接
		if(plus.networkinfo.getCurrentType()==plus.networkinfo.CONNECTION_NONE){
			return mui.toast("连接网络失败，请稍后再试");
		}
		w=plus.nativeUI.showWaiting("处理中，请等待...\n", {padlock:true});
			if(imageWidth.style.display == 'block'){
				console.log('走的上传图片')
				upPic();
			}else{
				upData();
				console.log('走的上传数据')
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
						var url=plus.io.convertLocalFileSystemURL(path);
						plus.gallery.save( path ,function(){
							console.log('保存照片成功')						
							var path = 'file://'+url;
							//提取出格式
							var name = path.substr(path.lastIndexOf('/') + 1);
							//图片压缩
							plus.zip.compressImage({
									src:path,
									dst:"_doc/" + name,
									quality:50,
									overwrite:true
								},
								function(event) {
									var target = event.target;
									var size = event.size; // 压缩转换后图片的大小，单位为字节（Byte）
									basepic(target);
									line.style.display = 'block';
									imageWidth.style.display = 'block';
									imageWidth.src = path;
								},function(error) {
									mui.toast('照片选取出错！');
							});	
						},function(){
							console.log('保存照片失败')
						});							
					}, function ( path ) {
					line.style.display = 'none';
					imageWidth.style.display = 'none';
					mui.toast( "取消拍照" );
				}, {filename:"_doc/gallery/",index:1} );
		});
	}

//相册选择
	function picture(){
		var size = 0;
		document.getElementById("picture").addEventListener('tap',function(){
			plus.gallery.pick( function(path){
				//提取出格式
				var name = path.substr(path.lastIndexOf('/') + 1);
				//图片压缩
				plus.zip.compressImage({
						src:path,
						dst:"_doc/" + name,
						quality:50,
						overwrite:true
					},
					function(event) {
						var target = event.target;
						var size = event.size; // 压缩转换后图片的大小，单位为字节（Byte）
						console.log(size)
						basepic(target);
						line.style.display = 'block';
						imageWidth.style.display = 'block';
						imageWidth.src = path;
					},function(error) {
						mui.toast('照片选取出错！');
				});				
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
function upPic(){
			mui.ajax('http://112.74.215.22:5000/api/uploadImg',{
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
						imgURL =dataobj.imgURL;
						upData(imgURL);
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
function upData(imgURL){
	var Arr =new Array();
	Arr.push(imgURL);
	console.log('数组长度'+Arr.length);
	console.log('这是数组'+Arr[1]);
	mui.ajax('http://112.74.215.22:5000/api/announce', {
			data: {
				title:'1',
				token:token,
				extra:Arr,
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
					mui.back();
				}else{
					console.log(data)
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


