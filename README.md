# node_SearchSetu
基于node.js，使用lolicon接口搜索色图并自动下载。<br>

config.json说明：<br>
"local_proxy": "", //色图使用下载HTTP代理<br>
"pixiv_proxy":"i.pixiv.re", //P站反代地址, 留空使用i.pixiv.cat，使用"null"为i.pximg.net<br>
"R18": 2,//0=非R18,1=R18,2=全都要<br>
"NormalPath": "",//非R18图片保存完整路径，留空默认./Setu/Normal<br>
"R18Path": "",//R18图片保存完整路径，留空默认./Setu/R18<br>
"Size": "original"//图片尺寸 original / regular<br>
