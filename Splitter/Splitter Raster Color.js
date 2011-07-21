// Script author peko [peko@gasubasu.com]
// http://gasubasu.com

// TOOL SPLITING PATH AND COLOR IT WITH IMAGE BEHIND

var raster; 

function segment(item, position) {

    i = item.clone();
    i.scale(0.5, position);
    c = raster.getAverageColor(i);
    i.fillColor = c; 
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