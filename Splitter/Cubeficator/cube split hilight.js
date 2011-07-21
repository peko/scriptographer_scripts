// Script author peko [peko@gasubasu.com]
// http://gasubasu.com

// TOOL SPLITING PATH AND COLOR IT WITH IMAGE BEHIND

var raster; 

var SQ3 = Math.sqrt(3);

function createCube(c, r){

    var w = r*SQ3/2;
    var g = [];
    
    var k = 0.05;
    var cl = raster.getAverageColor(c);
    if (!cl) cl = new RGBColor(1,1,1);
    var cl1 = cl.clone(); // normal
    var cc = cl1.red * (1+3.0*k);
    cl1.red   = cc > 1 ? 1 : cc;
    cc = cl1.green   * (1+2.0*k);
    cl1.green = cc > 1 ? 1 : cc;
    cc = cl1.blue    * (1+1.0*k);
    cl1.blue  = cc > 1 ? 1 : cc;
    var cl2 = cl.clone(); // shadow 1 + blue a bit
    cl2.red   *= 1-3.0*k;
    cl2.green *= 1-2.0*k;
    cl2.blue  *= 1-1.0*k;
    var cl3 = cl2.clone();// shadow 2 + blue a bit
    cl3.red   *= 1-3*k;
    cl3.green *= 1-2*k;
    cl3.blue  *= 1-1*k;
    
    
     //top
    var s = new Path();
    s.add(c);
    s.add(new Point(c.x-w, c.y-r/2));
    s.add(new Point(c.x  , c.y-r  ));
    s.add(new Point(c.x+w, c.y-r/2));
    s.closed = true;
    s.fillColor = cl1;
    g[0] = s;

    
    //right
    s = new Path();
    s.add(c);
    s.add(new Point(c.x+w, c.y-r/2));
    s.add(new Point(c.x+w, c.y+r/2));
    s.add(new Point(c.x, c.y+r  ));
    s.closed = true;

    s.fillColor =  cl2;
    g[1] = s;
        
    //left
    s = new Path();
    s.add(c);
    s.add(new Point(c.x, c.y+r  ));
    s.add(new Point(c.x-w, c.y+r/2));
    s.add(new Point(c.x-w, c.y-r/2));
    s.closed = true;
    s.fillColor = cl3;
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