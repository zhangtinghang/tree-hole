var server = ** ** ** ** ** ; //上传文件的端口
var files = []; //文件的数组
document.getElementById( & quot; ContractID - btn & quot;).addEventListener('tap', function() {
	plus.gallery.pick(function(e) {
		document.getElementById( & quot; ContractID - btn & quot;).innerText = '选择照片(' + e.files.length + ')张';
		//从相册添加文件
		appendFile(e); //添加文件
	}, function(e) {
		// outSet(&quot;取消选择图片&quot;);
	}, {
		filter: & quot;image & quot;,
		multiple: true,
		system: false
	});
});
//上传文件
function uploadContract() {
	var task = plus.uploader.createUpload(server, {
		method: & quot;POST & quot;
	}, function(t, status) {
		if(status == 200) {
			plus.nativeUI.closeWaiting();
			mui.toast('上传成功');
			ContractZIP = JSON.parse(t.responseText).fileName;
			rowContract = JSON.parse(t.responseText).rawFiles;
		} else {
			alert('上传失败,请重试');
		}
	});
	task.addData( & quot; fileType & quot;, & quot; 合同 & quot;);
	task.addData( & quot; customerId & quot;, CustomerId);
	for(var i = 0; i & lt; files.length; i++) {
		var f = files[i];
		task.addFile(f.path, {
			key: f.name
		});
	}
	task.start();
}
//添加文件 
function appendFile(p) {
	plus.nativeUI.showWaiting( & quot; 正在上传... & quot;);
	var index = 1;
	files = []; //清空数组，防止重复上传
	for(var i = 0; i & lt; p.files.length; i++) {
		var n = p.files[i].substr(p.files[i].lastIndexOf('/') + 1);
		files.push({
			name: & quot;uploadkey & quot; + index,
			path: p.files[i]
		});
		index++;
	}
	uploadContract(); //添加完文件，开始上传
}