// Script author peko [peko@gasubasu.com]
// http://gasubasu.com

// TOOL SPLITING PATH AND COLORING IT WITH IMAGE BEHIND

var raster; 

function segment(item, position) {

    i = item.clone();
    i.scale(0.5, position);
    
    var gradient = new Gradient() {
        type:'linear',
        stops: [
           new GradientStop(raster.getAverageColor(i.bounds.topLeft), 0),
           new GradientStop(raster.getAverageColor(i.bounds.bottomRight), 1),  
        ]
    };
    var gradientColor = new GradientColor(gradient, i.bounds.topLeft, i.bounds.bottomRight); 
    
    c = raster.getAverageColor(i);
    i.fillColor = gradientColor; 
    print(c);
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
    
        if (event.item instanceof Path) {
            segment(event.item, event.item.bounds.topLeft);
            segment(event.item, event.item.bounds.topRight);
            segment(event.item, event.item.bounds.bottomLeft); 
            segment(event.item, event.item.bounds.bottomRight);

            event.item.remove();    
        }
	} 
}