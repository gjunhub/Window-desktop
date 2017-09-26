var list = document.querySelector('#list');
var files = document.querySelector('.files');
var boxs = files.getElementsByClassName('file');
var upload = document.querySelector('.upload');
var fileDetail = document.querySelector('.fileDetail');
var rope = document.querySelector('.rope');
var close = document.querySelector('.fileDetail').children[1];
var rubbish = files.children[0];
//因为都是生成的，所以获取rubbish会要一点时间。下面就演示了
// setTimeout(function(){
// 	console.log(files.querySelector('.rubbish'));
// },16);
var maskBar = document.querySelector('.maskBar');//重名弹出层
var start = '新建文件夹';
var _this = null;
var _Self = null;//双击时拿到的当前this.
var isoff;

var pid = null;
var type = null;
var frontName = null;

var extNub = null;


var isblur = false;


// setFile(data.list);//渲染data中已有的数据。
//右键菜单区分 (桌面的右键菜单，文件夹上的右键菜单)
document.addEventListener('contextmenu',function(e){
	 if(e.target.className.toUpperCase() == 'FILE' ||e.target.className.toUpperCase() == 'FILE HOVER'||e.target.className.toUpperCase() == 'FILE HOVER ACTIVE'|| e.target.parentNode.className.toUpperCase() == 'FILE'||e.target.parentNode.className.toUpperCase() == 'FILE HOVER'||e.target.parentNode.className.toUpperCase() == 'FILE HOVER ACTIVE'
		) {

	 	if (e.target.parentNode.className.toUpperCase() == 'FILES' && e.target.dataset.ip) {
 			showcontextmenu(e,data.menu.restore);
 			e.target.classList.add('active');
 			_this = e.target;
 			return;

		 } else if(e.target.parentNode.classList.contains('file') && e.target.parentNode.dataset.ip) {
			showcontextmenu(e,data.menu.restore);
			e.target.parentNode.classList.add('active');
			_this = e.target.parentNode;
 			return;
		 }
	/*上面这个if和elseif条件针对的是右键删除文件后，在垃圾箱中
	右键该文件，显示的- 还原 -*/
		showcontextmenu(e,data.menu.file);
//让文件夹上的右键菜单点击后选中文件夹。
		for(var i = 0;i < boxs.length;i++) {
			if(boxs[i] != e.target.parentNode) {
				boxs[i].classList.remove('active');
			}
			if(e.target.parentNode.className.toUpperCase() == 'FILES') {
				e.target.classList.add('active');
				_this = e.target;
			} else {
				e.target.parentNode.classList.add('active');
				_this = e.target.parentNode;

			/*将当前拿到的file文件存变量中，让del的删除的时候调用到*/
			}
		}
		

	} else if(e.target.className.toUpperCase() == 'FILE RUBBISH' ||e.target.className.toUpperCase() == 'FILE RUBBISH HOVER'||
		e.target.parentNode.className.toUpperCase() == 'FILE RUBBISH' ||e.target.parentNode.className.toUpperCase() == 'FILE RUBBISH HOVER'
		) {
		showcontextmenu(e,data.menu.rubbish);


	} else {
		
		showcontextmenu(e,data.menu.main);
	}
});

function showcontextmenu(e, menuData) {
	list.style.display = 'block';
	list.innerHTML = '';
	list.style.left = e.clientX + 2 + 'px';
	list.style.top = e.clientY + 2 + 'px';
	e.preventDefault();

	CreateChild(list,menuData);//利用递归动态生成子项
	setListCss();//给生成的菜单添加的移入事件
	function CreateChild(list,Data) {
		for(var i = 0;i < Data.length;i++) {
			var li = document.createElement('li');
			var p = document.createElement('p');
			p.innerHTML = Data[i].name;
			if(Data[i].callbackname) {
				li.onmousedown = contextmenuCallback[Data[i].callbackname];
				// li.className = 'addFile';
			/*给当前是新建文件夹的这个li设置一个自定义属性。
			然后就能在页面其他地方获取到它，也就能用键盘事件来操作它。-也可以直接写死，键盘事件直接调用contextmenuCallback-*/
			}

			li.appendChild(p);

			if(Data[i].child) {
				var ul = document.createElement('ul');
				ul.className = 'subList';
				CreateChild(ul,Data[i].child);
				li.appendChild(ul);
			}
			list.appendChild(li);
		}
	}

	menuOverStep(list);
	/*如果将这个调用放在 list还未生成子菜单的函数上面的话，还是会
	在maxY这过界的，因为list的top值没有过界，是他的子项在list过界处理
	之后才生成的，也就是这个时候list才有的高度，这样就过界了。*/
	//右键菜单的过界处理
	function menuOverStep(list) {
		var x = css(list,'left');
		var y = css(list,'top');
		var maxX = document.documentElement.clientWidth - list.offsetWidth;
		var maxY = document.documentElement.clientHeight - list.offsetHeight;
		list.style.left = Math.min(x,maxX - 5) + 'px';
		//上面加了 - 5的话，窗口缩小时，在右边界上面点开右键就不会有问题了
		list.style.top = (y > maxY?y - list.offsetHeight:y) + 'px';
	}

	//右键菜单子项的过界处理
	function menuChildOverStep(ul){
		var rect = ul.getBoundingClientRect();
		if(rect.right > document.documentElement.clientWidth) {
			ul.style.left = -(ul.offsetParent.clientWidth - 38) + 'px';
			ul.style.boxShadow = '0 3px 8px rgba(0,0,0,.24)';
		}
		if(rect.bottom > document.documentElement.clientHeight) {
			ul.style.top = (ul.offsetParent.clientHeight - rect.height) + 'px';
			ul.style.boxShadow = '0 3px 8px rgba(0,0,0,.24)';
		}
	}
	function setListCss() {
		var li = document.querySelectorAll('#list>li');
		for(var i = 0;i < li.length;i++) {
			li[i].addEventListener('mouseover',function(e){
				var ul = this.children[1];
				for(var i = 0;i < li.length;i++) {
					li[i].classList.remove('over');
				}
				this.classList.add('over');
				if(ul) {
					ul.style.cssText = 'display:block';
					ul.id = 'appear';
					//调用子级过界处理
					menuChildOverStep(ul);
					var uls = ul.parentNode.parentNode.getElementsByTagName('ul');
					for(var j = 0;j < uls.length;j++) {
						if(uls[j] != ul) {
							uls[j].style.display = 'none';
						}
					}
					var lis = ul.querySelectorAll('li');
					for(var i = 0;i < lis.length;i++) {
						lis[i].addEventListener('mouseover',function(e){
							for(var i = 0;i < lis.length;i++) {
								lis[i].className = '';
							}
							this.className = 'over';
						});
					}
					for(var i = 0;i < lis.length;i++) {
						lis[i].addEventListener('mouseout',function(e){
							for(var i = 0;i < lis.length;i++) {
								lis[i].className = '';
							}
						});
					}
				} else {
					var UL = document.getElementById('appear');
					if(UL) {
						UL.style.display = 'none';
						UL.id = '';
					}
				}
			});
		}
	}
}
document.addEventListener('mousedown',function(e){
	main.style.display = box3D.style.display = 'none';
	if(isoff) {
		e.preventDefault();
	}
/*input失去焦点时，让doc不清除默认事件，不然input就不能失焦*/
	for(var i = 0; i < boxs.length;i++) {
		boxs[i].classList.remove('active');
	}
	list.style.display = 'none';
});
//右键菜单生成的li所绑定的时事件。
var contextmenuCallback = {
	createFloder:function(){
		// setTimeout(function(){
			// var fileName = window.prompt('请输入文件夹名称');
		// });
		// data.list.push({
		// 	type: 'file',
		// 	name: fileName,
		// });
		if(_ID != -1) {//为了在垃圾桶中不能新建文件夹
			addData({
				pid: _ID,
				type: 'file',
				name: start,
				time: Date.now()
			});
		}
			
	/*现在渲染文件夹视图的时候，是用getChildren的方式，找到当前id
	获取旗下子元素的文件的pid是上面id的，然后将其子级全部渲染视图*/
		// data.list.push({
		// 	type: 'file',
		// 	name: start

		// });
		
		Check(data.list[data.list.length - 1]);
		setFile(_ID);
		console.log(data.list);
	},
	sort: function(){
		data.list.sort(function(a,b){
			if(a.name > b.name) {
				return 1;
			} else {
				return -1;
			}
		});
	},
	reName:function(e) {
		e.cancelBubble = true;
		var p = _this.children[1];
		var input = _this.children[2];
		p.style.display = 'none';
		input.style.display = 'block';
		input.value = p.innerHTML;

		pid = _this.item.pid;
		type = _this.item.type;
		
		setTimeout(function(){
			input.select();
		});

	input.oninput = function(){
		if(input.value.indexOf('(') != -1) {
			extNub = input.value.split('(')[1].split(')')[0];
			frontName = input.value.split('(')[0];
		}
	}
	

		list.style.display = 'none';

	/*当input.value <有select()属性>之后，让input.value
	点击时，取消冒泡，才能让光标再放对应的文字位*/
		input.addEventListener('mousedown',function(e){
			e.stopPropagation();
		});

		loseBlur();//失去焦点。
		
	},
	timeSort: function(){//时间排序
		data.list.sort(function(a,b){
			return a.time - b.time;
		});
		setFile(_ID);
		resizeOffset();
	},
	nameSort: function(){//名称排序
		data.list.sort(function(a,b){
			if(pinyin.getFullChars(a.name) > pinyin.getFullChars(b.name)) {
				return -1;
			}
			return 1;
		});
		setFile(_ID);
		resizeOffset();
	},
	typeSort: function(){//类型排序
		data.list.sort(function(a,b){
			if(a.type < b.type) {
				return 1;
			}
			return -1;
		});
		setFile(_ID);
		resizeOffset();
	},
	del: function(e) {
		var rubbish = document.querySelector('.rubbish');
		if(rubbish) {
			var trashImg = rubbish.children[0];
		}
		e.cancelBubble = true;
		files.removeChild(_this);
		resizeOffset();//删除一个文件夹之后，重排(Dom操作不好，不用这个了)
		list.style.display = 'none';
/*这个时候我们在Dom中删除了这位文件夹后，要将数组中对应位删除
这就用到之前生成文件夹时的自定义.item属性，用filter方法，过滤
掉Dom删除的改位对应数组中的这一位。如果删除的这一位id==数组中
对应的那位的id，那就return false，代表剔除这位。true就是保留
剩下的数组。*/
		
		// data.list = data.list.filter(function(item){
		// 	if(item.id == _this.item.id) {
		// 		return false;
		// 	}
		// 	return true;
		// });//这个代码是删除data中对应的数据

		_this.item.oid = _this.item.pid;
		_this.item.pid = rubbish = 'undefined'? -1:rubbish.item.id;
/*上面写三目是因为，在文件夹中，删除文件夹，其实获取不到垃圾箱
反正垃圾箱id = -1.那就写三目呗*/
		_this.item.istap = true;
		// rubbish.item.del = true;
	/*渲染In这个图---这里有坑啊，还是那个问题，在文件夹中是
	获取不到垃圾箱的。但又想让垃圾桶的加一个del= true属性。*/
		var trashBin = getInfo(-1);
		trashBin.del = true;
		// trashBin.src = 'img/rubbishIN.png';
		//删除了，说明垃圾桶满了。不加也行，因在setfile中判断了
		setFile(_ID);
	},
	upload: function(e) {
		e.cancelBubble = true;
		upload.click();
		list.style.display = 'none';
		getUpload();//检测上传的文件类型
	},
	//垃圾箱单个还原
	restoreElement: function() {
		var rubbish = document.querySelector('.rubbish');

		_this.item.pid = _this.item.oid;
		_this.item.istap = false;
	/*还原文件夹之后，将istap改成false，这样还原的文件夹右键
	的菜单就不会再是还原了。*/
		var trash = getChildren(_ID);
		// if(trash.length == 0) {
			// rubbish.item.del = false;
		// }
		setFile(_ID);
	},
	//清空操作
	delAllFile: function() {
		var rubbish = document.querySelector('.rubbish');
		var trashImg = rubbish.children[0];
		var trash = getChildren(rubbish.item.id);
		data.list = data.list.filter(function(ele){
			if(ele.istap) {//只要是删除的istap都是true
				return false;
			}
			return true;
		});
		rubbish.item.del = false;//无垃圾了，渲染Out图
		trashImg.src = 'img/rubbishOut.png';
	},
	//垃圾箱全部还原
	restoreElementAll: function(e) {
		var rubbish = document.querySelector('.rubbish');
		var trash = getChildren(rubbish.item.id);
/*因为还原的话肯定是 还原删除的这些文件夹 ，之前将删除的文件
夹都放在垃圾箱的id下了，所以现在获取垃圾箱id下的文件。*/

		trash.forEach(function(val){
			val.pid = val.oid;
			val.istap = false;
	//同300行的注释。
		});
		rubbish.item.del = false;//无垃圾，渲染Out图
		setFile(_ID);//还原文件后，渲染视图。
//垃圾箱还原全部已删除的文件夹。
	},
	copy: function(){//拷贝
		var thisFile = _this.item;
		copyFile(thisFile);
		isCopy = true;
	},
	stick: function(){//粘贴
		stickFile(stickArr[0]);
	},
	reFresh: function(){
		css(files,'opacity',1);
		alert(0)
		startMove({
			el: files,
			target: {
				opacity: 30
			},
			time: 60,
			type: "easeOut",
			callBack: function(){
				startMove({
					el: files,
					target: {
						opacity: 100
					},
					time: 60,
					type: "easeOut"
				});
			}
		});

		setFile(_ID);
	}
};
//键盘事件：新建文件夹
	// var addFile = document.querySelector('.addFile');
	document.addEventListener('keydown',function(e){
		if(e.keyCode == 78 && e.shiftKey) {
			contextmenuCallback.createFloder();
			e.preventDefault();
		} else if(e.keyCode == 113) {
			var p = null;
			var input = null;
			pid = _this.item.pid;
			type = _this.item.type;
			frontName = null;
			extNub = null;

			p = _this.children[1];
			input = _this.children[2];
			p.style.display = 'none';
			input.style.display = 'block';
			input.value = p.innerHTML;

		input.oninput = function(){
			if(input.value.indexOf('(') != -1) {
				extNub = input.value.split('(')[1].split(')')[0];
				frontName = input.value.split('(')[0];
			}
		}				

			input.select();
			input.addEventListener('mousedown',function(e){
				e.stopPropagation();
			});
			loseBlur();	//失去焦点。
		}
	});
//input重名之后，让其失去焦点。
function loseBlur() {
	isblur = true;
	p = _this.children[1];
	input = _this.children[2];
	input.onblur = function() {
		isoff = false;
		if(hasName(frontName,type,pid,extNub)) {
			maskBar.style.display = 'block';
			var mask = maskBar.children[0];
			var disappear = mask.children[0];
			css(mask,'scale',0);
		//要js控制transform 的 scale前，先要设置一下。
			console.log(mask);
			startMove({
				el: mask,
				target: {
					opacity: 100,
					scale: 100
				},
				type: "backOut",
				time: 500
			});
			disappear.addEventListener('click',function(e){
				e.stopPropagation();
				startMove({
					el: mask,
					target: {
						opacity: 0,
						scale: 0
					},
					type: "easeOut",
					time: 360,
					callBack: function(){
						maskBar.style.display = 'none';
					}
				});
				
				p.style.display = 'none';
				input.style.display = 'block';
				input.select();
		/*如果重名了，那就提示再次让input中文件名选中
		所以再次隐藏 p 显示 input 并且 select();*/
			});
		}

		if(input.value.trim() != "") {
			p.innerHTML = input.value;
		}

		p.style.display = 'block';
		input.style.display = 'none';
		_this.item.name = frontName?frontName:input.value;
		console.log(_this.item.name);
		if(extNub) {
			_this.item.extname = extNub;
		}
		//数据双向绑定，同步更改数组中信息
	}
}
/**
 * 渲染页面文件列表(视图)
 * @param pid 要渲染的文件数据的pid
 */
function setFile(pid) {
	// if(!Array.isArray(dataList)) {
 //        dataList = [];
 //    }
	 
	 var dataList = getChildren(pid);
	 _ID = pid;
 	
 	files.innerHTML = '';
	// files.innerHTML = '<div class="file rubbish" id="rubbish"></div>';
	// if(data.list.length == 2) {
	// 	data.list[1].extname = '';
	// }
	dataList.forEach(function(item){
		var file = document.createElement("div");
		var input = document.createElement('input');
		var img = document.createElement('img');
		var p = document.createElement('p');
		file.className = 'file';
		img.className = 'img';
		input.type = 'text';
		if(item.type == 'rubbishOut') {
			img.style.top = 20 + 'px';
			img.style.left = 32 + 'px';
			img.style.width = 60 + 'px';
			img.style.height = 70 + 'px';
			file.classList.add('rubbish');
			
		}
		img.src = `img/${item.type}.png`;
		p.className = 'boxName';
		p.innerHTML = `${item.name}`;

/*检测是否在当前复制文件夹的同页面下粘贴相同文件夹(为了加后缀)*/
		if(item.extname && item.type != 'rubbishOut'&&item.name == start) {
			/*最后面的&&作用是不会将中途重命名的文件加上括号和后缀*/
			if(!item.samename) {
				p.innerHTML += `(${item.extname})`;
			} else {
				p.innerHTML += `(${item.extname})${item.samename}`;
			}
		} else if(item.samename && !item.extname && item.type != 'rubbishOut'&&item.name == start) {
			p.innerHTML += `${item.samename}`;
		}
		file.appendChild(img);
		file.appendChild(p);
		file.appendChild(input);
		file.item = item;
	//自定义属性，为了之后操作文件时，找到对应数组位。
		if(file.item.istap == true) {
			file.dataset.ip = 1;
		}
/*删除的文件夹的两种方式(右键删除&拖拽删除)被删除的文件夹就会有
istap = true属性， 有属性的话，就给改文件夹套一个自定义ip，
方便在文件夹右键的时候判断是否出还原的右键菜单。*/
		var offset = getOffsetFile();//进行定位排列。
		file.style.left = offset.x + 'px';
		file.style.top = offset.y + 'px';
		file.ondblclick = function(e) {
			_Self = this;

			if(item.type == 'file'|| item.type == 'rubbishOut') {
				
				setFile(item.id);
			} else {
				openUploadFile(item.type);
				//打开上传文件
			}
		}
		var trashId = rubbish = 'undefined'?-1:rubbish.item.id;
		var trash = getChildren(trashId);
		if(trash.length == 0) {
			file.item.del = false;
		}
	/*在垃圾箱里面如果有N个文件要还原，单个还原(文件个数!=1)
	其实返回上一级，垃圾箱还是满的，要等垃圾箱里面所有的文件
	都还原了OR清除，才能变成空的垃圾桶--这里是做还原操作，在
	垃圾桶下获取所有的文件，如果，文件个数=0，那就说明没有
	垃圾文件了，都还原了呗，那么垃圾桶的del = false;*/
		if(file.item.del == true) {
				var imgs = file.children[0];
				imgs.src = 'img/rubbishIN.png';
		}
	/*当自定义事件del=true的时候，垃圾桶就渲染的是In这个图
	默认del属性是false，就是Out的这个图*/
		setHover(file);//调用文件夹的移入 点击事件。
		collision(file);//碰撞检测。
		files.appendChild(file);
	});

}

	
//拖拽碰撞检测删除 + 移入文件夹
function collision(file) {
	file.addEventListener('mousedown',function(e){
		var rubbish = document.querySelector('.rubbish');
		//放外面获取，可能一上来获取不到，因为生成延迟的关系
		if(rubbish) {
			var trashImg = rubbish.children[0];
		}
		if(e.button == 2) {
			return;
		}

		e.stopPropagation();
		e.preventDefault();
		var startX = e.clientX;
		var startY = e.clientY;
		var newFile = null;//记录当前克隆出来的文件。
		var activeArr = [];//放框选准备拖拽的元素数据
		var fileArr = [];
		var fileCss = [];
		var cloneFile = [];//一堆克隆元素
		var _self = this;
		var isDel = false;
//判断用户是否真的进行拖拽删除。一上来false未删除。
		var activeFile = null;//在move中定义后，end中也能拿到
		document.addEventListener('mousemove',move);
		document.addEventListener('mouseup',end);

		function move(e) {
			var disX = e.clientX - startX;
			var disY = e.clientY - startY;

			if(!newFile) {
				activeFile = document.querySelectorAll('.active,.hover');
				for(var i = 0;i < activeFile.length;i++) {
					// if(activeFile[i].classList.contains('rubbish')){
					// 	console.log();
					// 	continue;
					// }
					cloneFile = activeFile[i].cloneNode(true);
					cloneFile.style.opacity = '.5';
					cloneFile.style.Zindex = 5;
		/*不然拖拽元素一多会导致newFile和其他文件碰撞移入时
		先和一堆克隆元素中的某个碰撞了，因为克隆元素的层级高*/
					files.appendChild(cloneFile);
					fileArr.push(cloneFile);
					if(_self == activeFile[i]) {
						newFile = cloneFile;
					}
					fileCss[i] = {x:css(activeFile[i],'left'),y:css(activeFile[i],'top')};
				}
			}
			for(var i = 0;i < fileArr.length;i++) {
				css(fileArr[i],'left',fileCss[i].x + disX);
				css(fileArr[i],'top',fileCss[i].y + disY);
			}

		}

		function end() {
			document.removeEventListener('mousemove',move);
			document.removeEventListener('mouseup',end);
			if(!newFile) {
				return;
			}

			if(getCollide(newFile,rubbish)) {
				if(_self == rubbish){
					console.log('papapa');
					for(var i = 0;i < fileArr.length;i++) {
						files.removeChild(fileArr[i]);
					}
					return;
				}
				for(var i = 0;i < fileArr.length;i++) {
					files.removeChild(fileArr[i]);
					isDel = true;
				//进行了拖拽删除，那就变成true
					if(trashImg) {
						console.log(trashImg.src);
						trashImg.src = 'img/rubbishIN.png';
						rubbish.item.del = true;
		/*确认和垃圾桶碰撞删除之后，就将垃圾桶图换了，并设置
		一个自定义属性--为了不让渲染视图的时候，将图换成默认*/
					}
				}
			}
			for(var i = 0;i < boxs.length;i++) {
				if(_self != rubbish && newFile != boxs[i] && _self != boxs[i]) {
					if(getCollide(newFile,boxs[i])) {
						console.log('peipeipei')
						for(var j = 0;j < activeFile.length;j++) {
							activeFile[j].item.pid = boxs[i].item.id
						}
						setFile(_ID);
					}
				}
			}

			// setFile(_ID);
			if(isDel) {//判断用户是否真正的进行了删除
				activeFile.forEach(function(val){
					val.item.oid = val.item.pid; 
	                val.item.pid = rubbish.item.id;
	                val.item.istap = true;
	            });
	            
// setTimeout(function(){
// 	console.log('abc',trashImg,trashImg.parentNode.parentNode);
// },1000);				

			}
	/*上面拖拽删除将确实碰撞垃圾桶进行删除的文件夹放进
	垃圾桶的id下，然后渲染，同时记录之前的pid值给oid
	dataset.ip 为了之后让垃圾桶中的文件夹，右键单独有一个
	右键(还原的菜单)*/
		setFile(_ID);
		}
	});
}

//给添加到页面上的文件夹绑定移入，选中事件。
function setHover(file) {
	file.addEventListener('mouseover',function(e){
		file.classList.add('hover');
	});
	file.addEventListener('mouseout',function(e){
		file.classList.remove('hover');
	});
	file.addEventListener('click',function(e){
		//console.log('a')
		e.stopPropagation();
		if(!e.ctrlKey) {
			for(var i = 0;i < boxs.length;i++) {
				boxs[i].classList.remove('active');
			}
		}
		this.classList.add('active');
		_this = this;
		list.style.display = 'none';
	});
}
//设置生成的文件的定位位置。
function getOffsetFile(index){
	var boxs = document.querySelectorAll('.file');
	index = (typeof index != 'undefined')?index:boxs.length;
	// var fileW = css(boxs[0],'width') + 5;
	// var fileH = css(boxs[0],'height') + 15;
	var fileW = 124 + 5;
	var fileH = 124 + 15;
	var scale = Math.floor(document.documentElement.clientHeight / fileH);
	var x = Math.floor(index / scale);
	var y = (index % scale);
	return {x:x*fileW,y:y*fileH};
}
//当窗口改变时，位置重新计算。
window.addEventListener('resize',resizeOffset);
function resizeOffset(){
	var file = document.querySelectorAll('.file');
	for(var i = 0;i < file.length;i++) {
		var offset = getOffsetFile(i);
		startMove({
			el: file[i],
			target: {
				left: offset.x,
				top: offset.y
			},
			time: 500,
			type: 'easeOut'
		});
	}
}
//检测重命名
function checkName(filedata) {
	var sameFile = [];
	for(var i = 0;i < data.list.length;i++) {
		if(filedata.type == data.list[i].type && filedata.name == data.list[i].name && filedata.pid == data.list[i].pid) {
			sameFile.push(data.list[i]);
		}
	}
	return sameFile;
}
//给生成的文件夹进行查重过滤
function Check(filedata) {
	var existFiles = checkName(filedata);
	if(existFiles.length) {
		for(var i = 0;i <= existFiles.length;i++) {
			var X = existFiles.find(function(ele){
				return ele.extname == i;
			//找到和循环对应的i的ele.extname的这些位。满足条件就返回，不满足就
			//undefined。
			});
			if(i > 1) {
				if(X === undefined) {		
				//X位未找到，说明数组中没有对应循环中i的那一项，那我们就自动
				//为改位添加extname ，正好是i+1 ，但是因为for循环，满足条件就
				//i++自增了。所以这边就直接用i就行了。
					// if(_this != null && isblur) {
					// 	if(_this.item.extname == i) {
					// 		continue;
					// 	}

					// }
					filedata.extname = i;
					break;
				}
			}
			// if(_this != null && isblur) {
			// 	data.list = data.list.filter(function(val){
			// 		if(val.extname != _this.item.extname && val.name == start || val.name == '垃圾箱') {
			// 			return false;
			// 		}
			// 		return true;

			// 	}); 
			// }
		}
	}
	// data.list.push(filedata);
	// setFile(_ID);
	// console.log(1);
}
//文件夹框选操作
(function(){
	document.addEventListener('mousedown',function(e){
		if(e.button == 2) {
			return;
		}
		var marquee = document.createElement('span');
		marquee.className = 'marquee';
		document.body.appendChild(marquee);
		var start = {x:e.clientX,y:e.clientY};

		document.addEventListener('mousemove',move);
		document.addEventListener('mouseup',end);

		function move(e){
			var now = {x:e.clientX,y:e.clientY};
			css(marquee,'left',Math.min(start.x,now.x) - 2);
			css(marquee,'top',Math.min(start.y,now.y) - 2);
			//-2意思是让选框的left top小于鼠标的位置。
			css(marquee,'width',Math.abs(start.x - now.x));
			css(marquee,'height',Math.abs(start.y - now.y));

			for(var i = 0;i < boxs.length;i++) {
				if(getCollide(marquee,boxs[i])) {
					boxs[i].classList.add('active');
				} else {
					boxs[i].classList.remove('active');
				}
			}
		}
		function end(e) {
			document.removeEventListener('mousemove',move);
			document.removeEventListener('mouseup',end);
			document.body.removeChild(marquee);
		}
	});
})();

//碰撞检测
function getCollide(el,el2){
	var rect = el.getBoundingClientRect();
	var rect2 = el2.getBoundingClientRect();
	if(rect.right < rect2.left
	||rect.left > rect2.right
	||rect.bottom<rect2.top
	||rect.top>rect2.bottom){
		return false;
	}
	return true;
}
//上传文件
var loadFile = null;
function getUpload() {
	upload.addEventListener('change',function(e){
		loadFile = e.target.files[0];
		var fileType = loadFile.type.split('/')[0];
	//	console.log(333)
		if(!((fileType == 'text' && loadFile.type.split('/')[1] == 'plain')|| fileType == 'image' || fileType == 'video' || fileType == 'audio')) {
			alert('仅支持上传 文本` 图片` 音频` 视频`');
			return;
		}
		console.log(fileType)
//上传其实就是将数据放在数组中，然后页面进行渲染。
		addData({
			pid: _ID,
			type: fileType,
			name: loadFile.name//就是文件的名字
		});
		Check(data.list[data.list.length - 1]);
		setFile(_ID);
		upload.value = '';
	},{once:true});
}
//双击打开上传的文件
function openUploadFile(fileType) {
	
	var fileContainer = fileDetail.children[0];
	//每次打开文件前，先清空一下fileDetail中的内容。
	fileContainer.innerHTML = '';
	var reader = new FileReader();
	reader.addEventListener('load',function(e){
		fileDetail.style.display = 'block';
		var result = e.target.result;//读取的结果
		if(fileType == 'text') {
			var p = document.createElement('p');
			p.innerHTML = result;
			fileContainer.appendChild(p);
		} else if(fileType == 'image') {
			var img = new Image();
			img.src = result;
			fileContainer.appendChild(img);
		} else if(fileType == 'video') {
			var video = document.createElement('video');
			video.src = result;
			video.setAttribute('loop','');
			video.setAttribute('controls','');
			fileContainer.appendChild(video);
		} else if(fileType == 'audio') {
			var audio = document.createElement('audio');
			audio.src = result;
			audio.setAttribute('loop','');
			audio.setAttribute('controls','');
			fileContainer.appendChild(audio);
		}
	});

	if(fileType == 'text') {
		reader.readAsText(loadFile);
	} else {
		reader.readAsDataURL(loadFile);
	}
}
//关闭 打开的文件
close.addEventListener('click',function(e){
	fileDetail.style.display = 'none';
});
//面包屑导航
//由三个部分组成：顶层 + 所有父级 + 当前目录
// var pathList = getParents(_ID);

//下拉换肤功能
var imgArr = ['img/2.jpg','img/1.jpg','img/3.jpg','img/4.jpg'];
(function(){
	var bg = document.querySelector('.bg');
	var pic = bg.children[0];
	var skin = document.querySelector('.skin');
	var changeSkin = document.querySelector('.changeSkin');
	var nub = 0;
	var TC = .25;
	var AlphaP = 0;//设定一个拖拽距离和opacity的关系
	var opacP = 0;
	var disy = 0;

	var timer = setInterval(function(){
		css(skin,'scale',60);
		startMove({
			el: skin,
			target: {
				scale: 100
			},
			time: 800,
			type: "backOut"
		});
	},1500);
//换肤呼吸灯.

	skin.addEventListener('mousedown',function(e){
		clearInterval(timer);
		e.stopPropagation();
		e.preventDefault();
		var start = {x:e.clientX,y:e.clientY};
		var elY = css(skin,'top');
		var ropeY = css(rope,'top');
		var ropeH = rope.offsetHeight;

		document.addEventListener('mousemove',move);
		document.addEventListener('mouseup',end);
		function move(e) {
			var now = {x:e.clientX,y:e.clientY};
			disy = now.y - start.y;

			AlphaP = disy * 0.005;
	//设定一个拖拽距离和opacity的转换值
			if(disy > 200) {
				TC = (.45 - disy/ropeH);
				disy += disy*TC;
			}

			var y = disy + elY;
			var Y = disy + ropeY;

			css(skin,'top',y);
			css(rope,'top',Y);

			opacP = pic.style.opacity = (1 - AlphaP) < .2?.2:(1-AlphaP);
			console.log(opacP);
			startMove({
				el: pic,
				target: {
					opacity: opacP * 100
				},
				time: 500,
				type: "easeOut",
				callIn: function(){
					startMove({
						el: files,
						target: {
							opacity: opacP * 100
						},
						time: 500,
						type: "easeOut"
					});
				}

			});
		}

		function end() {
			if(disy > 50) {
				nub++;
			}
	//不能说点一下skin就换肤吧，所以我们定一个最低拖拽换肤的距离
			document.removeEventListener('mousemove',move);
			document.removeEventListener('mouseup',end);

			css(pic,'opacity');
			css(files,'opacity');
			startMove({
				el: pic,
				target: {
					opacity: 100
				},
				time: 1500,
				type: "easeOut",
				callIn: function(){
					pic.style.backgroundImage = 'url('+imgArr[nub%imgArr.length]+')';
					startMove({
						el: files,
						target: {
							opacity: 100
						},
						time: 500,
						type: "easeOut"
					});
				}
			});

			back(skin,elY);//下拉换肤归位动画操作。
			back(rope,ropeY);//下拉换肤归位动画操作。

			function back(demo,ele) {
				startMove({
					el: demo,
					target: {
						top: ele
					},
					type: "backOut",
					time: 500
				});
			}
		}
	});
})();
var stickArr = [];//复制的元素数据
var isCopy = false;//不让粘贴选项出现多个
var stickID = '';
var sameArr = [];
//复制 copy
function copyFile(thisFile) {
	stickArr = [];//让每次复制文件的时候，都清空上一次复制的
	console.log(thisFile);
	if(!isCopy) {
		data.menu.main.push({
			name: '粘贴',
			callbackname: 'stick'
		});
		isCopy = true;
	}
	stickArr.push({
		id: thisFile.id,
		pid: thisFile.pid,
		extname: thisFile.extname || '',
		type: thisFile.type,
		time: Date.now(),
		name: thisFile.name,
		del: thisFile.del
	});

};
//粘贴 stickFile
function stickFile(stickArr) {
	var stick = stickArr;
	stick.pid = _Self = 'undefined'?_ID:_Self.item.id;
/*复制的这个放入双击文件夹的id,没有双击其他文件夹的话，那就
在当前页面粘贴*/
	checkStick(stick,_ID);
	/*多次粘贴判断当前页面_ID下是否已经粘贴过了，粘贴过了
	那么就加上'-副本'的后缀，在粘贴就'-副本(/\d+/)'*/
	var InFo = getChildernChild(stick.id);//获取复制元素下所有子元素
	InFo.unshift(stick);
	var arrC = [];
	InFo.forEach(function(val){
		arrC.push(deepCopy(val));//根据InFo来深度复制一模一样的它
	});
	getStickArr(arrC,stick);
};
/*
*old(id,pid)---(5,3)
*now(id,pid,lastId)---(8,3,5)
*/
//返回修改了id和pid的数组
function getStickArr(arrC,stick) {
	
	arrC.forEach(function(val){
		val.lastId = val.id;
	});

	var num = getMaxId();

	arrC.forEach(function(val){
		val.id = ++num;
	});

	var arrD = [];
	arrC.forEach(function(val){
		arrD.push(deepCopy(val));
	});

	for(var i = 0;i<arrC.length;i++){
		for(var j = 0;j<arrD.length;j++) {
			if(arrC[i].pid == arrD[j].lastId) {
				arrC[i].pid = arrD[j].id;
			}
		}
	}
	
	arrC.forEach(function(val){
		data.list.push(val);
	});
	console.log(arrC);
	
	setFile(_ID);
};

 //粘贴时判断是否重名，添加后缀；
var extnub = 1;//判断后缀名的数字
var oldID;//记录上一步的_ID（和当前_ID比较）

function checkStick(stick,_ID){ //1211调用
	var children = getChildren(_ID);//获取当前下的所有子级
	var postfix = '-副本';
	
	var reg = /\-副本(\(\d+\))?$/; //判断后缀是不是-副本(nub)
	var reg2 = /\-副本$/;//判断有没有-副本 后缀
	stick.name = stick.name + '(' + stick.extname + ')';
	console.log(stick.name);
	var stickName = stick.name.match(/^新建文件夹(\(\d+\))?/)[0];
	/*用match抓取和正则中规则一样的字符串，返回数组，所以用
	[]下标*/
	console.log(stickName);
	if(children.length){
		children.forEach(function(child){
			var name = child.extname ? child.name + '('+ child.extname+')':child.name;
//			console.log(name)
		//用正则判断：	/\-副本(\(\d+\))?$/
		//意思是：包含"-副本"，并且后面是以"(一组数字)"结尾，最少0次，最多一次；
			
//			console.log(stick.name,stickName)

		});
		console.log(reg.test('新建文件夹(2)-副本(2)-副本'));
		//stick.name = stick.name.replace(stick.name,stickName);
		console.log(stick.name);
		
		if(oldID == _ID) {
			extnub = extnub;
			console.log('_ID==')
		} else {
			extnub = sameNub(_ID) + 1;
//在不同_ID下粘贴，判断 '-副本(nub)'中nub的接着当前的nub下++
			console.log('_ID + 1');
		}
		
		if(!reg2.test(stickName)){//没有副本时；
			console.log('aaa');
			stick.name = stickName + postfix;
			console.log(stick.name);
		} 

		if(reg.test(stick.name)){//有数字时；
			
			if(extnub == 1) {
				console.log('bbb')
				stick.name = stick.name;
				console.log(stick.name,extnub);
			} else {
				stick.name = stick.name +`(${extnub})`;
				console.log('ccc',stick.name,extnub);
			}
			extnub++;
		}
		
		oldID = _ID;

	} else {
		stick.name = stickName;
		console.log('33358')
	}
}

//获取不同页面中-副本后的最大的编号
function sameNub(_ID) {
	var children = getChildren(_ID);
	var sameNum = [];
	var maxNum = '';
	var str = [];
	var reg4 = /^新建文件夹(\(\d+\))?\-副本(\(\d+\))/;
	var reg3 = /\d+/;
	if(children.length) {
		children.forEach(function(val){
			if(reg4.test(val.name)) {
				sameNum = val.name.split('-副本');
				console.log(sameNum);
				if(sameNum[1] == '') {
					str = ['1'];
				} else {	
					str.push(sameNum[1].match(reg3)[0]);
					
				}

			}
		})
	}
	if(str.length > 1) {
		maxNum = Math.max(...str);
	} else {
		maxNum = 0;
	}
	return maxNum;
}

//深拷贝对象
function deepCopy(originObject, c) {
    var c = c || {};
    for (var i in originObject) {
        if (typeof originObject[i] === 'object') {
            c[i] = (originObject[i].constructor === Array) ? [] : {};
            deepCopy(originObject[i], c[i]);
        } else {
            c[i] = originObject[i];
        }
    }
    return c;
}

//桌面右下方的日历 时钟切换
(function(){
	var box3D = document.querySelector('.box3D');
	var showCalendar = document.querySelector('.showCalendar');
	var showTable = document.querySelector('.showTable');
	var clock = document.querySelector('.clock');
	var calendar = document.querySelector('.calendar');

	clock.addEventListener('click',e =>{
		e.stopPropagation();
		setClock();
		main.style.display = 'none';
	});
	calendar.addEventListener('click',e => {
		e.stopPropagation();
		setCalendar();
		box3D.style.display = 'none';
	});
})();

// 时钟效果
var box3D = document.querySelector('.box3D');
function setClock(){
	var watch = document.querySelector('.watch');
	var h = document.querySelector('.hours');
	var m = document.querySelector('.minutes');
	var s = document.querySelector('.seconds');
	var imgs = watch.querySelectorAll('img');
	
	var shadow = box3D.querySelector('.shadow');

	box3D.style.display = 'block';

	setTimeout(function(){
		for(var i = 0; i < imgs.length;i++) {
			css(imgs[i],'rotate',0);
			css(imgs[i],'opacity',0);
			
			startMove({
				el: imgs[i],
				target: {
					rotate: 45 * i,
					opacity: 100
				},
				time: 800,
				type: 'easeBoth',
				callBack: function(){
					startMove({
						el: h,
						target: {
							opacity: 100
						},
						time: 500,
						type: "easeOut",
						callBack: function(){
							startMove({
								el: m,
								target: {
									opacity: 100
								},
								time: 500,
								type: "easeOut",
								callIn: function(){
									startMove({
										el: shadow,
										target: {
											opacity: 60
										},
										type: "backOut",
										time: 500
									});
								},
								callBack: function(){
									startMove({
										el: s,
										target: {
											opacity: 100
										},
										time: 500,
										type: "easeOut",
										callBack: function(){
											setTime();
											setInterval(setTime,1000);
										}
									});
								}
							});
						}
					});
					
				}
			});
		}
	},300);

	function setTime() {
		var dataTime = new Date();
		var second = dataTime.getSeconds();
		var minutes = dataTime.getMinutes() + second/60;
		var hours = dataTime.getHours() + minutes/60;

		h.style.transform = 'rotate('+ hours*30 +'deg)';
		m.style.transform = 'rotate('+ minutes*6 +'deg)';
		s.style.transform = 'rotate('+ second*6 +'deg)';
	}
};

//日历
var main = document.querySelector(".main");
main.addEventListener('mousedown',e => {
	e.stopPropagation();
});
function setCalendar() {
	
	var itme = document.querySelector(".itme");
	var years = document.querySelector(".year");
	var YTD = document.querySelector(".YTD");
	var list2 = document.getElementById("list2");
	var li = list2.getElementsByTagName("li")
	
	var lis = list2.getElementsByTagName("span");
	var  updown = document.querySelectorAll(".updown img");
	
	
	var t = new Date();
	console.log(t.toLocaleDateString());//获取现在的年月日
	var month =  t.getMonth();
	var year = t.getFullYear();
	var dat =  t.getDate();
	
	var now = year + "年" + (month+1) + "月"  + dat 
	main.style.display = 'block';

	years.innerHTML = now
	
	setInterval( function() {
		var t = new Date();
		var hous = add0(t.getHours());
		var minu = add0(t.getMinutes());
		var sec  = add0(t.getSeconds());
		var str = hous + ":" + minu + ":" + sec;
		itme.innerHTML = str;
	},1000);
	
	updown[0].onclick = function() {
		month--;
		if(month < 0){
			month = 11;
			year--;
		}
		css(list2,'top',-264);////先给list2定位到元素上面点然后点击的时候让list2从上往下走
		calendar( year, month );
		move(list2,{"top":0},500,"linear",function() {
			list2.style.top = "-264px"
		});
	}
	updown[1].onclick = function() {
		month++;
		if(month >= 12){
			month = 0;
			year++;
		}   
		css(list2,'top',0);//先给list2定位到0点然后点击的时候让list2从下往上走
		calendar( year, month );
		move(list2,{"top":-264},500,"linear",function() {     
			list2.style.top = "0px"
		});
		
	}
	
	var html = '';
	calendar(year,month)
	function calendar(year,month) {
	year = Number(year);
	month = Number(month);
	
	YTD.innerHTML = "";
	YTD.innerHTML += year +'年'+ (month+1) +'月';
	var t = new Date();
	var html = '<li>';
	var nub = 0;
	for( var i = 1; i < 43; i++){//日期最多占6行，每行有7天，所以最多有42个格子
		var b = get ( year, month);//上个月的总天数
		var v = i - getFirstDay(year,month);//对应的每一个span
//		console.log( v );
	
		if( v < 1) {
			html += '<span style = "color: rgba(255,255,255,.5);">'+ (b+v) +'</span>';
		}else if( v > getDays(year,month)) {
			nub++;
			html += '<span style= "color: rgba(255,255,255,.5);">'+ nub +'</span>';
		}else if(year == t.getFullYear() && month == t.getMonth() && v==t.getDate()){//如果是当天就加上背景颜色红色
			html += '<span style="line-height: 38px; box-shadow: inset 0 0  0 2px  #000; background: #0078d7; border: 2px solid #000;">'+ v +'</span>';
		}else{
			html += '<span>' + v + '</span>';
		}
	}
	html += '</li>';
//	console.log(html)
	list2.innerHTML = html;
	list2.innerHTML += list2.innerHTML;
	}
	
	function get ( year, month) {//获取上个月的总天数
		return Number(new Date(year,month-1, 1, -1).getDate());
	}
	
	function getDays(year,month) {//获取指定的月份总天数，得到下个月的-1时0分0秒；  -1时也就是上个月最后一天的23点；
		
		return  Number(new Date(year,month+1, 1 ,-1).getDate());
	}
	function getFirstDay (year,month){//获取当月的第一天是星期几
		return new Date( year,month,1).getDay();
	}
	
	
	//鼠标移入到span的时候给span加上边框
	for( var i = 0; i < lis.length; i++ ){
		lis[i].onmouseover = function() {
			for(  var i = 0; i < lis.length; i++){
				lis[i].className = "";
			}
			this.className = "active";
		}
		lis[i].onmouseout = function() {
			this.className = "";
		}
	}
	
	//补0
	function add0(n) {
		if( n < 10 ){
			return "0" + n
		}else{
			return "" + n
		}
	}
	
	
	
	
	
	function move(obj, j, duration,ease, fn) {
		var ease = ease || "linear"
		var oldTime = new Date().getTime();
		var d = duration;
		var s = {};
		for(var attr in j) {
			s[attr] = {};
			s[attr].b = parseFloat(getComputedStyle(obj)[attr]);
			s[attr].c = j[attr] - s[attr].b;
		}
		clearInterval( obj.timer );
		obj.isplaying = true;
		obj.timer = setInterval(function() {
			var t = new Date().getTime() - oldTime;
			if(t >= d) {
				t = d
			}
			for(var attr in s) {
				var c = s[attr].c;
				var b = s[attr].b;
				var v = Tween[ease](t, b, c, d);
				if(attr == "opacity") {
					obj.style[attr] = v;
				} else {
					obj.style[attr] = v + "px";
				}
			}
			if(t == d) {
				clearInterval(obj.timer);
				obj.isplaying = false;
				fn && fn();
			}
		}, 16)

	}
}

//3D偏移时钟
(function(){
	var box3D = document.querySelector('.box3D');
	var watch = document.querySelector('.watch');
	var scale = 5.650; 

	box3D.onmouseover = function(e){

		watch.style.transition = ".2s";
		var rect = box3D.getBoundingClientRect();
		var x = (e.clientX - rect.left - box3D.clientWidth/2)/scale;
		var y = -(e.clientY - rect.top - box3D.clientHeight/2)/scale;
		watch.style.transform = "rotateX("+y+"deg) rotateY("+x+"deg)";
		
	};
	box3D.onmousemove = function(e){
		var rect = box3D.getBoundingClientRect();
		var x = (e.clientX - rect.left - box3D.clientWidth/2)/scale;
		var y = -(e.clientY - rect.top - box3D.clientHeight/2)/scale;
		watch.style.transform = "rotateX("+y+"deg) rotateY("+x+"deg)";
	};
	box3D.onmouseout = function(e){
		watch.style.transition = ".5s";
		watch.style.transform = "rotateX(0deg) rotateY(0deg)";
	};
})();