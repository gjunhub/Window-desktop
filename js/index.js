var _ID = 0;
/*当前所在目录的id，每当视图发生改变的时候，也就是view方法执行的时候，
需要同步该值*/

setFile(_ID);
// 渲染初始化数据，显示pid为0的数据

var back = document.querySelector('.back');
back.addEventListener('click',function(){
	var info = getInfo(_ID);// 返回上一级：获取当前目录的父级的子目录
	console.log(data.list,info,_ID);
	if(info) {
		setFile(info.pid);
	}
});
/**
 * 添加新数据
 * @param newData
 */
function addData(newData){
	newData.id = getMaxId() + 1;
	data.list.push(newData);
}
/*
* 获取数据中最大的id
* */
function getMaxId() {
	var maxId = 0;
	data.list.forEach(function(item){
		if(item.id > maxId) {
			maxId = item.id
		}
	});
	return maxId;
}
//音视频播放时禁用右键菜单；
fileDetail.oncontextmenu = function(e){
	e.stopPropagation();
	e.preventDefault();
}
fileDetail.onmousedown = function(e){
	e.stopPropagation();
}
fileDetail.onclick = function(e){
	e.stopPropagation();
}