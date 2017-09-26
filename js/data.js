/**
 * 数据
 * @type {Object}
 */
var data = {
	menu: {
		'main' :[
			{	
				name: '新建……',
				child:[
					{
						callbackname: 'createFloder',
						name: "文件夹"
					}
				]
			},
			{
				name: '上传文件',
                callbackname: 'upload'
			},
			// {
			// 	name: '粘贴',
			// 	callbackname: 'stick'
			// },
			{	
				callbackname: 'sort',
				name: '排序',
				child: [
					{
						name: '时间排序',
						callbackname: 'timeSort'
					},{
						name: '名称排序',
						callbackname: 'nameSort'
					},{
						name: '类型排序',
						callbackname: 'typeSort'
					}
				]
			},
			{
				name: '刷新',
				callbackname: 'reFresh'
			}
		],
		'file': [
			{
				name: '打开'
			},
			{
				name: '重命名',
                callbackname: 'reName'
			},
			{
				name: '复制',
				callbackname: 'copy'
			},
			{
				name: '删除',
                callbackname: 'del'
			}
		],
        'rubbish': [
            {
                name: '清空',
                callbackname: 'delAllFile'
            },
            {
                name: '还原全部',
                callbackname: 'restoreElementAll'
            }
        ],
        'restore': [
        	{
        		callbackname: 'restoreElement',
        		name: '还原'
        	}
        ]
	},
	trash: [],
	list: [
        {
            id: -1,
            pid: 0,
            del: 'false',
            type: 'rubbishOut',
            name: '垃圾箱',
        }

	]
};
//
