// Global
var autotileImgs = []; // 存放加载后的图片资源
var imgNames = []; // 存放图片名id
var map = []; // 存放地图数据
var selectedInfo; //存放当前选中的图片信息

var mapLayer = document.querySelector('#mapLayer')
var drawLayer = document.querySelector('#drawLayer')
var bgLayer = document.querySelector('#bgLayer')
var preDraw = document.querySelector('#preDraw')

for(i=0; i<15; i++)
  imgNames[i] = i+1

//加载图片
var loadImg = function(url){
  return new Promise(function(resolve, reject){
    var img = new Image();
    img.src = url;
    img.onload = function(){
      resolve(img);
    }
    img.onerror = function(){
      reject(new Error('Load image error at '+url));
    }
  })
}
var loadAllImg = function(){
  var p = imgNames.map(function(im){
    var url = 'img/autotile' + im + '.png'
    return loadImg(url).then(function(image){
      var autotile = {}
      autotile.id = im
      autotile.image = image
      autotileImgs.push(autotile)
    }).catch(function(err){
      console.log("image load error", err)
    })
  })

  return Promise.all(p)
}
var init = function(){
  loadAllImg().then(function(){
    imgDataInit();
    mapInit();
    listen();
  })
}
// var drawStatus = function(img){ //画出16种状态

//   var cxt = grasspic.getContext("2d");
//   var cxt_= grass_pic.getContext("2d");
//   cxt.drawImage(img,0,0);

  //0草，1水 或者说0是不会变化的区域，1是会变化的区域， 数组注释分别为1-48的块索引
  // 0 | 0
  //---+--- //0000  [10, 9, 4, 3]
  // 0 | 0

  // 0 | 0
  //---+--- //0001  [10, 9, 4, 13]
  // 0 | 1

  // 0 | 0
  //---+--- //0010  [10, 9, 18, 3]
  // 1 | 0

  // 0 | 0
  //---+--- //0011  [10, 9, 16, 15]
  // 1 | 1

  // 0 | 1
  //---+--- //0100  [10, 43, 4, 3]
  // 0 | 0

  // 0 | 1
  //---+--- //0101  [10, 31, 4, 25]
  // 0 | 1

  // 0 | 1
  //---+--- //0110  [10, 7, 2, 3]
  // 1 | 0

  // 0 | 1
  //---+--- //0111  [10, 31, 16, 5]
  // 1 | 1

  // 1 | 0
  //---+--- //1000  [48, 9, 4, 3]
  // 0 | 0

  // 1 | 0
  //---+--- //1001  [8, 9, 4, 1]
  // 0 | 1

  // 1 | 0
  //---+--- //1010  [36, 9, 30, 3]
  // 1 | 0

  // 1 | 0
  //---+--- //1011  [36, 9, 6, 15]
  // 1 | 1

  // 1 | 1
  //---+--- //1100  [46, 45, 4, 3]
  // 0 | 0

  // 1 | 1
  //---+--- //1101  [46, 11, 4, 25]
  // 0 | 1

  // 1 | 1
  //---+--- //1110  [12, 45, 30, 3]
  // 1 | 0

  // 1 | 1
  //---+--- //1111  [34, 33, 28, 27]
  // 1 | 1

  //end
//   cxt_.clearRect(0, 0, 32,32);
//   cxt_=grass_pic.getContext("2d");
//   for(var i=0;i<16;i++)
//     for(var j=0;j<4;j++){
//       var dx = i*33 + 16*(j%2), dy = 16*(~~(j/2));
//       drawBlockByIndex(cxt_, dx, dy, img, indexArrs[i][j])
//     }
// }
var indexArrs = [ //16种组合的图块索引数组; // 将autotile分割成48块16*16的小块; 数组索引即对应各个小块
  //                                       +----+----+----+----+----+----+
    [10,  9,  4, 3 ],  //0   bin:0000      | 1  | 2  | 3  | 4  | 5  | 6  |
    [10,  9,  4, 13],  //1   bin:0001      +----+----+----+----+----+----+
    [10,  9, 18, 3 ],  //2   bin:0010      | 7  | 8  | 9  | 10 | 11 | 12 |
    [10,  9, 16, 15],  //3   bin:0011      +----+----+----+----+----+----+
    [10, 43,  4, 3 ],  //4   bin:0100      | 13 | 14 | 15 | 16 | 17 | 18 |
    [10, 31,  4, 25],  //5   bin:0101      +----+----+----+----+----+----+
    [10,  7,  2, 3 ],  //6   bin:0110      | 19 | 20 | 21 | 22 | 23 | 24 |
    [10, 31, 16, 5 ],  //7   bin:0111      +----+----+----+----+----+----+
    [48,  9,  4, 3 ],  //8   bin:1000      | 25 | 26 | 27 | 28 | 29 | 30 |
    [ 8,  9,  4, 1 ],  //9   bin:1001      +----+----+----+----+----+----+
    [36,  9, 30, 3 ],  //10  bin:1010      | 31 | 32 | 33 | 34 | 35 | 36 |
    [36,  9,  6, 15],  //11  bin:1011      +----+----+----+----+----+----+
    [46, 45,  4, 3 ],  //12  bin:1100      | 37 | 38 | 39 | 40 | 41 | 42 |
    [46, 11,  4, 25],  //13  bin:1101      +----+----+----+----+----+----+
    [12, 45, 30, 3 ],  //14  bin:1110      | 43 | 44 | 45 | 46 | 47 | 48 |
    [34, 33, 28, 27]   //15  bin:1111      +----+----+----+----+----+----+
  ];
var drawBlockByIndex = function(ctx, dx, dy, autotileImg, index){ //index为autotile的图块索引1-48
  var sx = 16*((index-1)%6), sy = 16*(~~((index-1)/6));
    ctx.drawImage(autotileImg, sx, sy, 16, 16, dx, dy, 16, 16);
}
var drawMap = function(){
  function isAutotile(id){
    return Boolean(id)
  }
  var getAutotileAroundId = function(currId, x, y){ //与autotile当前id一致返回1，否则返回0
    if(x>=0 && y >=0 && x<13 && y<13 && map[y][x] == currId)
      return 1;
    else if(x<0 || y<0 || x>12 || y>12) return 1; //边界外视为通用autotile，这样好看些
    else
      return 0;
  }
  var checkAround = function(x, y){ // 得到周围四个32*32块（周围每块都包含当前块的1/4，不清楚的话画下图你就明白）的数组索引
    var currId = map[y][x];
    var pointBlock = [];
    for(var i=0; i<4; i++){
      var bsum = 0;
      var offsetx = i%2, offsety = ~~(i/2);
      for(var j=0; j<4; j++){
        var mx = j%2, my = ~~(j/2);
        var b = getAutotileAroundId(currId, x+offsetx+mx-1, y+offsety+my-1);
        bsum += b*(Math.pow(2, 3-j));
      }
      pointBlock.push(bsum);
    }
    return pointBlock;
  }
  var getAutotileIndexArr = function(x, y){
    var indexArr = [];
    var pointBlocks = checkAround(x, y);
    for(var i=0; i<4; i++){
      var arr = indexArrs[pointBlocks[i]]
      indexArr.push(arr[3-i]);
    }
    return indexArr;
  }
  
  var drawAutotile = function(ctx, x, y, autotileImg){ // 绘制一个autotile
    var blockIndexs = getAutotileIndexArr(x, y)
    ctx.clearRect(x*32, y*32, 32, 32);
    //修正四个边角的固定搭配，借助数字版autotile
    if(blockIndexs[0] == 13){
      if(blockIndexs[1] == 16) blockIndexs[1] = 14;
      if(blockIndexs[2] == 31) blockIndexs[2] = 19;
    }
    if(blockIndexs[1] == 18){
      if(blockIndexs[0] == 15) blockIndexs[0] = 17;
      if(blockIndexs[3] == 36) blockIndexs[3] = 24;
    }
    if(blockIndexs[2] == 43){
      if(blockIndexs[0] == 25) blockIndexs[0] = 37;
      if(blockIndexs[3] == 46) blockIndexs[3] = 44;
    }
    if(blockIndexs[3] == 48){
      if(blockIndexs[1] == 30) blockIndexs[1] = 42;
      if(blockIndexs[2] == 45) blockIndexs[2] = 47;
    }
    for(var i=0; i<4; i++){
      var index = blockIndexs[i];
      var dx = x*32 + 16*(i%2), dy = y*32 + 16*(~~(i/2));
      drawBlockByIndex(ctx, dx, dy, autotileImg, index);
    }
  }
  var cxt = mapLayer.getContext("2d");
  function drawTile(cxt, x, y, tileInfo){
    cxt.clearRect(x*32, y*32, 32, 32);
    if(tileInfo == 0) return;
    // 如果设置了普通图片资源则可在下面绘制
  }
  function getImgById(id){
    for(var i=0; i<autotileImgs.length; i++){
      if(autotileImgs[i].id == id)
        return autotileImgs[i].image
    }
  }
  for(var y=0; y<13; y++){
    for(var x = 0; x<13; x++){
      var id = map[y][x];
      if(isAutotile(id)){
        drawAutotile(cxt, x, y, getImgById(id));
      }else{
        drawTile(cxt, x, y, id)
      }
    }
  }
}
var mapInit = function(){ // 初始化地图背景层及其数组

  var cxt = bgLayer.getContext('2d');
  var colors=["#f8f8f8","#cccccc"];

  for(var y=0; y<13; y++){
    map[y] = [];
    for(var x = 0; x<13; x++){
      map[y][x] = 0; // 地图数组初始化为0

      //在背景层内画一个13*13的灰白相间的格子
      cxt.fillStyle = colors[(x + y + 1) % 2];
      cxt.fillRect(y*32, x*32, 32, 32);
    }
  }
}
var imgDataInit = function(){
  var cxt = preDraw.getContext('2d')
  var x = 1, y = 0;
  var pos = {};
  console.log(autotileImgs)
  preDraw.height = 8 * 4 * 32;
  for(var i=0; i<autotileImgs.length; i++){
    if(i > 7 && x==1){
      x += 3;
      y = 0;
    }
    cxt.drawImage(autotileImgs[i].image, x*32, y*32)
    pos = { x: x, y: y};
    autotileImgs[i].pos = JSON.parse(JSON.stringify(pos));
    y += 4;
  }
}
var listen = function(){
  var cxt = drawLayer.getContext('2d');

  function fillPos(pos){
    cxt.fillStyle='#'+~~(Math.random()*8)+~~(Math.random()*8)+~~(Math.random()*8);
    cxt.fillRect(pos.x*32+12,pos.y*32+12,8,8);
  }//在格子内画一个随机色块

  function eToLoc(e){//返回可用的组件内坐标
    var loc = {'x':e.clientX-drawLayer.offsetLeft,'y':e.clientY-drawLayer.offsetTop,'size':32};
    return loc;
  }//返回可用的组件内坐标

  function locToPos(loc){
    pos={'x':~~(loc.x/loc.size),'y':~~(loc.y/loc.size)}
    return pos;
  }

  var holdingPath =0;
  var stepPostfix=null;//用于存放寻路检测的第一个点之后的后续移动

  var mouseOutCheck =2;
  function clear1(){
    if(mouseOutCheck >1){
      mouseOutCheck--;
      setTimeout(clear1,500);
      return;
    }
    holdingPath=0;
    stepPostfix=[];
    cxt.clearRect(0, 0, 416,416);
  }//用于鼠标移出canvas时的自动清除状态

  drawLayer.onmousedown = function(e) {
    holdingPath=1;
    mouseOutCheck =2;
    setTimeout(clear1);
    e.stopPropagation();
    cxt.clearRect(0, 0, 416,416);
    var loc = eToLoc(e);
    pos=locToPos(loc)
    stepPostfix=[];
    stepPostfix.push(pos);
    fillPos(pos);
  }

  drawLayer.onmousemove = function(e) {

    if (holdingPath==0){return;}
    mouseOutCheck =2;
    e.stopPropagation();
    var loc =eToLoc(e);
    var pos=locToPos(loc);
    var pos0=stepPostfix[stepPostfix.length-1]
    var directionDistance=[pos.y-pos0.y,pos0.x-pos.x,pos0.y-pos.y,pos.x-pos0.x]
    var max=0,index=4;
    for(var i=0;i<4;i++){
      if(directionDistance[i]>max){
        index=i;
        max=directionDistance[i];
      }
    }
    pos=[{'x':0,'y':1},{'x':-1,'y':0},{'x':0,'y':-1},{'x':1,'y':0},false][index]
    if(pos){
      pos.x+=pos0.x;
      pos.y+=pos0.y;
      stepPostfix.push(pos);
      fillPos(pos);
    }
  }

  drawLayer.onmouseup = function(e) {
    holdingPath=0;
    e.stopPropagation();
    var loc =eToLoc(e);
    if(stepPostfix.length){
      console.log(stepPostfix);
      for(var ii=0;ii<stepPostfix.length;ii++)
        map[stepPostfix[ii].y][stepPostfix[ii].x] = typeof selectedInfo == 'object' ? selectedInfo.id : selectedInfo;
      // console.log(map);
      drawMap();
    }
  }
  // 监听图片区定位选择框
  preDraw.onmousedown = function (e) {
    e.stopPropagation();
    var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    var loc = { 
      'x': scrollLeft + e.clientX + imgSource.scrollLeft - imgSource.offsetLeft, 
      'y': scrollTop + e.clientY + imgSource.scrollTop - imgSource.offsetTop, 
      'size': 32 
    };
    var pos = locToPos(loc);
    console.log(pos)
    if(pos.x < 1){
      pos.y = 0
      selectedInfo = 0;
    }else{
      for(var i=0; i < autotileImgs.length; i++){
        var py = autotileImgs[i].pos.y;
        var px = autotileImgs[i].pos.x;
        if(pos.x < 4){
          if(px < 4 && pos.y >= py && pos.y < py + 4){
            pos.x = 1;
            pos.y = py;
            selectedInfo = autotileImgs[i];
            break;
          }
        }else{
          if(pos.y >= 7*4){
            pos.y = pos.y - 3
          }
          if( px >= 4 && pos.y >= py && pos.y < py + 4){
            pos.x = 4;
            pos.y = py;
            selectedInfo = autotileImgs[i];
            break;
          }
        }
      }
    }
    imgSelection.style.left = pos.x*32 +'px';
    imgSelection.style.top = pos.y*32 +'px';
  }
}

init();