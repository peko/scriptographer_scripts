// Script author peko [peko@gasubasu.com]
// http://gasubasu.com

// SPLITS PATHES OVER AN SELECTED IMAGE
// Rasterize image to RGB before use

var raster; 

function segment(item, position) {

    i = item.clone();
    i.scale(0.5, position);
    c = raster.getAverageColor(i);
    i.fillColor = c; 
    //print(c, i.fillColor);
}

function splitItem(item) {
    if (item instanceof Path) {
        segment(item, item.bounds.topLeft);
        segment(item, item.bounds.topRight);
        segment(item, item.bounds.bottomLeft); 
        segment(item, item.bounds.bottomRight);
        item.remove();    
    }
}
    
if (raster == null) {
    var rasters = document.getItems({ 
        type: Raster, 
        selected: true 
    }); 
    if(rasters.length > 0) { 
        raster = rasters[0]; 
    } else { 
        raster = null; 
        Dialog.alert('Please select an image first!') 
    }  
}

var splitsNum = 0;
if (raster)
while (splitsNum < 100){

    var p = Point(
        raster.bounds.left+Math.random()*raster.bounds.width,
        raster.bounds.top + Math.random()*raster.bounds.height
    );
    var hitResult = document.hitTest(p);
    if (hitResult && hitResult.item instanceof Path){
        splitItem(hitResult.item);
        splitsNum ++;
        //new Path.Circle(p, 5);
        //document.redraw();
    }
    
}