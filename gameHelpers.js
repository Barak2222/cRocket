var settings = {
    FPS: 30,
    CW: 1920, // canvas width
    CH: 979, // canvas height
    DH: 10,
    speed: 3,
    isResizedScreen: true,
}

settings.setWindowSize = function() {
  if (typeof (window.innerWidth) == 'number') {
    myWidth = window.innerWidth;
    myHeight = window.innerHeight;
  } else {
    if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
      myWidth = document.documentElement.clientWidth;
      myHeight = document.documentElement.clientHeight;
    } else {
      if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
        myWidth = document.body.clientWidth;
        myHeight = document.body.clientHeight;
      }
    }
  }
  var min = Math.min(myWidth, myHeight);
  var max = Math.max(myWidth, myHeight);
  if(max/min>1.75 && max/min<1.79){
    settings.CW = min;
    settings.CH = max*0.9;
  } else {
    if(max/min<=1.75){
      settings.CW = max/1.77;
      settings.CH = max*0.9;
    } else {
      settings.CW = min;
      settings.CH = min*1.77*0.9;
    }
  }
}

var helpers = {
  distance: function(a,b){
      return Math.sqrt((a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y));
  },
  tryToDestroy: function(arr){
    return arr.filter(function(item){
      return item.active;
    });
  },
  drawFromData: function(color, startAt, dataRef){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(startAt.x+dataRef[0].x, startAt.y+dataRef[0].y);
    for(i=1; i<dataRef.length; i++){
        ctx.lineTo(startAt.x+dataRef[i].x, startAt.y+dataRef[i].y)
    }
    ctx.closePath();
    ctx.fill();
  }
}

var webElements = {
  buttons: [],
  init: function(){
    var canvasElement = $("<canvas id='canvas'></canvas>'")
    .attr({
      'width': settings.CW,
      'height': settings.CH
    })
    .appendTo('#gameBoard');
    settings.DH = settings.CH/9; /*{TODO} MOVE THIS LINE*/
    var divElement = $("<div id='dash'></div>'")
    .css({
      'width': settings.CW,
      'height': settings.DH,
      'background-color': '#ddd',
    })
    .appendTo('#dashBoard');
    ctx = canvasElement.get(0).getContext("2d");

    for(var i = 0; i < 6; i++){
      this.buttons[i] = $("<div class='btn btn-info' id='dash-" + i + "'>" + i + "</div>'")
      .css({
        'width': settings.CW/3,
        'height': settings.DH/2,
      })
      .appendTo('#dash')
    }
  },
  getPosition: function(event){
    var x = event.pageX;
    var y = event.pageY;
  
    var c = document.getElementById("canvas");
    x -= c.offsetLeft;
    y -= c.offsetTop;
    gDATA.userClick = {x: x, y: y, newClick: true};
  },
}


/*  @@@@@@@@@@@@@@@@@@@@@@@@@*/
/*  @@@@@@@ initialize @@@@@@*/
/*  @@@@@@@@@@@@@@@@@@@@@@@@@*/

settings.setWindowSize();
var gDATA = getGameDATA();
var ctx;
webElements.init();

$(document).ready(function(){
  $('#gameBoard').on('click', 'canvas', function(e){
    webElements.getPosition(e);
  })
})
