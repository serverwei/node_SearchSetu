const request = require("request");
const fs = require("fs");
const readline = require("readline");

const config = JSON.parse((fs.readFileSync('config.json')).toString());

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("输入Tag, 多个Tag空格隔开, 最多2个")
rl.on('line', (data) => {
    let tmp = "";
    let tag = [];
    let tag_list = new Array();

    for (let i = 0; i < data.trim().length + 1; i++) {
        //console.log(tmp);
        if ((data.trim()[i] == " " && tmp != "") ||
            (data.trim().length == i && tmp != "")) {
            tag.push({ tag: tmp });
            tmp = "";
        }
        if (data.trim()[i] != " ") {
            tmp += data.trim()[i];
        }
        if (tag.length == 2) {
            break;
        }
    }
    //console.log(tag);

    for (let i = 0; i < tag.length; i++) {
        tag_list.push(tag[i].tag);
    }
    //console.log(tag_list);
    lolicon(config.R18, 1, "", "", tag_list, config.Size, "", "", "", false);
})

function lolicon(r18, num, uid, keyword, tag, size, proxy, dataAfter, dataBefore, dsc) {
    if (config.pixiv_proxy == "" && proxy == "") {
        proxy = "i.pixiv.cat";
    } else {
        if (config.pixiv_proxy != "") {
            proxy = config.pixiv_proxy;
        }
    }

    const lolicon_api = "https://api.lolicon.app/setu/v2";
    let request_url = lolicon_api + "?r18=" + r18 + "&num=" +
        num + "&uid=" + uid + "&keyword=" + keyword + "&size=" +
        size + "&proxy=" + proxy + "&dataAfter=" + dataAfter + "&dataBefore=" + dataBefore + "&dsc=" + dsc;

    for (let i = 0; i < tag.length; i++) {
        request_url += "&tag=" + tag[i];
    }
    request_url = encodeURI(request_url);
    //console.log(request_url);

    const params = {
        timeout: 5000,
        url: request_url
    };

    request.get(params, (err, res, body) => {
        if (err) {
            console.log(err);
            console.log("色图搜索获取失败");

            console.log(" ");
            console.log("输入Tag, 多个Tag空格隔开, 最多2个");
            return;
        }
        //console.log(res);
        if (JSON.parse(body).data[0] == undefined) {
            console.log("搜不到你想要的色图呢变态！");

            console.log(" ");
            console.log("输入Tag, 多个Tag空格隔开, 最多2个");
            return;
        }

        // console.log(JSON.parse(body).data[0]);
        console.log("找到变态想要的色图啦！");
        console.log(JSON.parse(body).data[0]);
        let lolicon_data = JSON.parse(body).data[0];

        GetIMG(lolicon_data);
    })
}

function GetIMG(lolicon_data) {
    let local_proxy;
    if (config.local_proxy == "") {
        local_proxy = false;
    } else {
        local_proxy = config.local_proxy;
    }

    let referer;
    if(config.pixiv_proxy == "null"){
        referer = "http://pixiv.net";
    }else{
        referer = "";
    }

    const proxy_config = {
        timeout: 5000,
        url: lolicon_data.urls[config.Size],
        proxy: local_proxy,
        headers: {
            "referer": referer,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3100.0 Safari/537.36",
            "Accept-Encoding": "gzip" // 使用gzip压缩让数据传输更快
        },
        encoding: null,  // 方便解压缩返回的数据
    };
    console.log("下载色图: " + lolicon_data.urls[config.Size]);
    let size = 0;
    let downsize = 0;
    const req = request.get(proxy_config, (err, res, body) => {
        if (err) {
            //console.log(err);
            console.log("色图下载失败！");

            console.log(" ");
            console.log("输入Tag, 多个Tag空格隔开, 最多2个");
            return;
        }
        console.log("正在下载: 100%");
        console.log("色图下载完毕！");

        //console.log(body.toString());
        if (body.toString().includes("405 Not Allowed")) {
            console.log("405 Not Allowed 色图下载失败！");

            console.log(" ");
            console.log("输入Tag, 多个Tag空格隔开, 最多2个");
            return;
        }
        if (lolicon_data.r18) {
            if (config.R18Path == "") {
                path_head = __dirname + "\\Setu\\R18\\";

            } else {
                path_head = config.R18Path;
            }
        } else {
            if (config.NormalPath == "") {
                path_head = __dirname + "\\Setu\\Normal\\";
            } else {
                path_head = config.NormalPath;
            }
        }
        CheckPath(path_head);//检查路径

        fs.writeFile(path_head + "pid_" + lolicon_data.pid + "_uid_" + lolicon_data.uid + "." + lolicon_data.ext, body, "binary", (err) => {
            if (err) {
                console.log("色图保存失败！");
            } else {
                console.log("色图保存至： " + path_head + "pid_" + lolicon_data.pid + "_uid_" + lolicon_data.uid + "." + lolicon_data.ext);

                console.log(" ");
                console.log("输入Tag, 多个Tag空格隔开, 最多2个");
            }
        })
    });

    req.on('response', (data) => {
        size = Number(data.headers['content-length']);//文件大小
    });

    req.on('data', (data) => {//下载进度
        downsize += data.toString().length;
        console.log("正在下载: " + parseInt(downsize / size * 100) + "%");
        readline.moveCursor(process.stdout, -10, -1);
    });
}

function CheckPath(path) {//检查文件夹路径存在
    try {
        fs.accessSync(path, constants.R_OK | constants.W_OK);
        console.log("exist");
    } catch (err) {
        try {
            fs.mkdirSync(path, { recursive: true });
            //console.log("保存路径文件夹创建成功");
        } catch (err) {
            //console.log("保存路径文件夹创建失败");
        }
    }
}

