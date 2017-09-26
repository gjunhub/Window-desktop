/**
 * 获取指定id的数据信息
 * @param id 要查找的id
 * @return {Object} 满足条件的数据
 */
function getInfo(id) {
    console.log(data.list);
	return data.list.filter(function(item){
		return item.id == id;
	})[0];
	//获取的是一个数组，不能直接拿来用，哪怕只有一项，需要加下标。
}

function getParent(id) {
	var info = getInfo(id);
	if(info) {
		// 根据自己的pid获取父级的info
		return getInfo(info.pid);
	}
}
/**
 * 获取指定id的所有父级（不包括自己）
 * @param id
 * @return {Array} 返回一个包含所有父级数据的数组
 */
function getParents(id){
	var parents = [];
	var parentInfo = getParent(id);
	if(parentInfo) {
		// 把当前父级的信息保存到parents里面
		parents.push(parentInfo);
		var more = getParents(parentInfo.id);
		parents = more.concat(parents);
		//将递归得到的(例如10 9 8 1)的值，由父级到最小的级排序。
	}
	return parents;
}
/**
 * 根据指定的id，返回其下的所有一级子数据
 * @param id 要查找的id
 * @returns {Array} 包含一级子数据的数组
 */
function getChildren(id) {
	return data.list.filter(function(item){
		return item.pid == id;
	});
}

function getTrashChildren(id) {
	console.log(data.trash);
    return data.trash.filter(function (item) {
        return item.pid == id;
    });
}

//垃圾桶
function getTrashChildernChild(id) {
    return getTrashChildernChild(id);
}

//根据指定的id获取对应的pid所对应的数据
// function getchilds(id) {
//     return getChildernChild(id);
// }

//根据当前的id查看下面还有没有数据
function getChildernChild(id) {
	var childInfo = getChildval(id);
    var childs = [];
    childInfo.forEach(function (item) {
        // 如果子级信息存在
        if (item) {
            // 把当前子级的信息保存到parents里面
            childs.push(item);
            var more = getChildernChild(item.id);
            childs = more.concat(childs);
        }
    });
    return childs;
}

//根据当前的id查看下面还有没有数据垃圾桶
function getTrashChildernChild(id) {
    var childInfo = getTrashChildval(id);
    var childs = [];
    childInfo.forEach(function (item) {
        // 如果子级信息存在
        if (item) {
            // 把当前子级的信息保存到parents里面
            childs.push(item);
            var more = getTrashChildernChild(item.id);
            childs = more.concat(childs);
        }
    });
    return childs;
}

//再通过对应的数据所对应的id获取对应的数据
function getChildval(id) {
    var arr = [];
    arr = data.list.filter(function (item) {
        if(item.pid == id){
            return true;
        }
        return false;
    });
    return arr;
}

//垃圾桶里面的筛选
function getTrashChildval(id) {
    var arr = [];
    arr = data.trash.filter(function (item) {
        if(item.pid == id){
            return true;
        }
        return false;
    });
    return arr;
}

//检测重命名后是否和当前数组中的文件夹重名。
function hasName(value,type,pid,ext) {
	for(var i = 0;i < data.list.length;i++){
		if(_this.item != data.list[i] && value == data.list[i].name && type == data.list[i].type && pid == data.list[i].pid && ext == data.list[i].extname) {
			return true;
		}
	}
	return false;
}