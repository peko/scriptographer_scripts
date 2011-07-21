// Script author peko [peko@gasubasu.com]
// http://gasubasu.com

// TOOL SPLITING PATH AND COLOR IT WITH IMAGE BEHIND

var raster; 
var k = 0.1;

function segment(item, scale) {

    i = item.clone();
    i.scale(scale);
    i.rotate(Math.random()*360);
    i.translate(new Point(
        (0.5-Math.random())*item.bounds.width,
        (0.5-Math.random())*item.bounds.height));
}

function onMouseDown(event) {
    
  	if(event.item) { 
        if (event.item instanceof Path || event.item instanceof CompoundPath || event.item instanceof Group) {
            var s = 0.5;
            for (var c=0; c<5; c++) {
                segment(event.item, s-Math.random()*0.25);
            }
            event.item.remove();    
        }
	} 
}