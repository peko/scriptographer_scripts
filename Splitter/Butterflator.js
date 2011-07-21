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
    
    c1 = raster.getAverageColor(i);
	if (c1==null && c1==undefined) c1 = new RGBColor(1,1,1);
    var c2 = c1.clone();
    
    c1.red   *= 1-k;
    c1.green *= 1-k;
    c1.blue  *= 1-k;
    
    c2.red   *= 1+k;
    c2.green *= 1+k;
    c2.blue  *= 1+k;
    
    var gr = new Gradient() {type: "linear", stops:[
        new GradientStop(c2, 0), 
        new GradientStop(c1, 1)]};


    i.fillColor = new GradientColor(gr, i.bounds.topLeft, i.bounds.bottomRight); 
}

function onMouseDown(event) {
    
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
            return;
        }  
    }

	if(event.item) { 
        if (event.item instanceof Path || event.item instanceof CompoundPath) {
            var s = 0.5;
            for (var c=0; c<27; c++) {
                segment(event.item, s-Math.random()*0.25);
            }
            event.item.remove();    
        }
	} 
}