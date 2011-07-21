// Script author peko [peko@gasubasu.com]
// http://gasubasu.com

// TOOL SPLITING PATH AND COLOR IT WITH IMAGE BEHIND

var raster; 

var SQ3 = Math.sqrt(3);

function createCube(c, r){

    var w = r*SQ3/2;
    var g = [];
    
    //top
    var s = new Path();
    s.add(c);
    s.add(new Point(c.x-w, c.y-r/2));
    s.add(new Point(c.x  , c.y-r  ));
    s.add(new Point(c.x+w, c.y-r/2));
    s.closed = true;
    s.fillColor = raster.getAverageColor(s);
    if (s.fillColor == null) s.fillColor = new RGBColor(1,1,1);
    g[0] = s;

    //right
    s = new Path();
    s.add(c);
    s.add(new Point(c.x+w, c.y-r/2));
    s.add(new Point(c.x+w, c.y+r/2));
    s.add(new Point(c.x, c.y+r  ));
    s.closed = true;
    s.fillColor = raster.getAverageColor(s);
    if (s.fillColor == null) s.fillColor = new RGBColor(1,1,1);
    g[1] = s;
        
    //left
    s = new Path();
    s.add(c);
    s.add(new Point(c.x, c.y+r  ));
    s.add(new Point(c.x-w, c.y+r/2));
    s.add(new Point(c.x-w, c.y-r/2));
    s.closed = true;
    s.fillColor = raster.getAverageColor(s);
    if (s.fillColor == null) s.fillColor = new RGBColor(1,1,1);
    g[2] = s;
    
    new Group(g);
        
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
        if(event.item instanceof Raster) 
            createCube(event.item.bounds.center, event.item.bounds.width/SQ3);
        else if (event.item instanceof Group) {
            var b = event.item.bounds;
            var c = b.center;
            var r = b.height/2;
            var w = r*SQ3/2;
            
            createCube(new Point(c.x+w/2, c.y+r/4), r/2);
            createCube(new Point(c.x-w/2, c.y+r/4), r/2);
            createCube(new Point(c.x    , c.y-r/2), r/2);
            
            createCube(new Point(c.x+w/2, c.y-r/4), r/2);
            createCube(new Point(c.x-w/2, c.y-r/4), r/2);
            createCube(new Point(c.x    , c.y+r/2), r/2);
            
            createCube(c, r/2);
            
            event.item.remove();    
        }
	} 
}