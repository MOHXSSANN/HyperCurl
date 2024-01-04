function getCanvasMouseLocation(e) {
 
  let rect = canvas.getBoundingClientRect()


  const element = document.getElementsByTagName("html")[0]
  let scrollOffsetX = element.scrollLeft
  let scrollOffsetY = element.scrollTop

  let canX = e.pageX - rect.left - scrollOffsetX
  let canY = e.pageY - rect.top - scrollOffsetY

  return {
    x: canX,
    y: canY
  }
}

let hasHammer = 'Home';


function handleMouseDown(e) {
  if (enableShooting === false) return;
  if (!isClientFor(whosTurnIsIt)) return;

  let canvasMouseLoc = getCanvasMouseLocation(e);
  let canvasX = canvasMouseLoc.x;
  let canvasY = canvasMouseLoc.y;

  if (!iceSurface.isInShootingCrosshairArea(canvasMouseLoc)) {
    return;
  }

  stoneBeingShot = allStones.stoneAtLocation(canvasX, canvasY);

  if (stoneBeingShot === null) {
    if (shootingQueue.isEmpty()) stageStones();
    stoneBeingShot = shootingQueue.front();
    stoneBeingShot.setLocation(canvasMouseLoc);
  }

  if (stoneBeingShot != null) {
    shootingCue = new Cue(canvasX, canvasY);
    document.getElementById('canvas1').addEventListener('mousemove', handleMouseMove);
    document.getElementById('canvas1').addEventListener('mouseup', handleMouseUp);
    socket.emit('mousedown', canvasX, canvasY);
  }

  e.stopPropagation();
  e.preventDefault();
  drawCanvas();
}


function handleMouseMove(e) {
  let canvasMouseLoc = getCanvasMouseLocation(e)
  let canvasX = canvasMouseLoc.x
  let canvasY = canvasMouseLoc.y
  if (shootingCue != null) {
    shootingCue.setCueEnd(canvasX, canvasY)
    socket.emit('mousemove', canvasX, canvasY );
  }
  e.stopPropagation()
  drawCanvas()
}

function handleMouseUp(e) {
  e.stopPropagation();
  if (shootingCue != null) {
    let cueVelocity = shootingCue.getVelocity();
    
    socket.emit('mouseup', cueVelocity);

    hasHammer = hasHammer === 'Home' ? 'Visitor' : 'Home';

    shootingCue = null;
  }
  
  document.getElementById('canvas1').removeEventListener('mousemove', handleMouseMove);
  document.getElementById('canvas1').removeEventListener('mouseup', handleMouseUp);
  drawCanvas();
}



socket.on('handleMouseUp', function (cueVelocity) {
  if (stoneBeingShot != null) {
    stoneBeingShot.addVelocity(cueVelocity);
    shootingQueue.dequeue();
    enableShooting = false;

    hasHammer = hasHammer === 'Home' ? 'Visitor' : 'Home';

    shootingCue = null;

    drawCanvas();
  }
});



socket.on('handleMouseDown', function(x,y) {
  
  stoneBeingShot =allStones.stoneAtLocation(x, y)
  if(stoneBeingShot === null){
    if(iceSurface.isInShootingCrosshairArea({x,y})){
      if(shootingQueue.isEmpty()) stageStones()
      stoneBeingShot = shootingQueue.front()
      stoneBeingShot.setLocation({x,y})
    }
  }
  if (stoneBeingShot != null) {
    shootingCue = new Cue(x, y)
    document.getElementById('canvas1').addEventListener('mousemove', handleMouseMove)
    document.getElementById('canvas1').addEventListener('mouseup', handleMouseUp)
  }
      
  drawCanvas()
});


socket.on('handleMouseMove' , function(x,y){
  if (shootingCue != null) {
    shootingCue.setCueEnd(x, y)
  }  drawCanvas()
})
