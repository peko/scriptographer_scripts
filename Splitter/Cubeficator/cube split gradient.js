// Script author peko [peko@gasubasu.com]
// http://gasubasu.com

// TOOL SPLITING PATH AND COLOR IT WITH IMAGE BEHIND

var raster; 

var SQ3 = Math.sqrt(3);

function createCube(c, r){

    var w = r*SQ3/2;
    var g = [];
    
    var cl = raster.getAverageColor(c);
    
    var cl0 = cl.clone(); // reflex + yellow a bit
    cl0.red   *= 1.3;
    cl0.green *= 1.2;
    cl0.blue  *= 1.1;
    var cl1 = cl.clone(); // normal
    var cl2 = cl.clone(); // shadow 1 + blue a bit
    cl2.red   *= 0.9;
    cl2.green *= 0.8;
    cl2.blue  *= 0.7;
    var cl3 = cl2.clone();// shadow 2 + blue a bit
    cl3.red   *= 0.9;
    cl3.green *= 0.8;
    cl3.blue  *= 0.7;
    
    
    var gt = "linear";
    var gr1 = new Gradient() {type: gt, stops:[new GradientStop(cl0, 0), new GradientStop(cl1, 1)]};
    var gr2 = new Gradient() {type: gt, stops:[new GradientStop(cl1, 0), new GradientStop(cl2, 1)]};
    var gr3 = new Gradient() {type: gt, stops:[new GradientStop(cl2, 0), new GradientStop(cl3, 1)]};
        
     //top
    var s = new Path();
    s.add(c);
    s.add(new Point(c.x-w, c.y-r/2));
    s.add(new Point(c.x  , c.y-r  ));
    s.add(new Point(c.x+w, c.y-r/2));
    s.closed = true;
    s.fillColor = new GradientColor(gr1, c, new Point(c.x  , c.y-r  ));
    g[0] = s;

    
    //right
    s = new Path();
    s.add(c);
    s.add(new Point(c.x+w, c.y-r/2));
    s.add(new Point(c.x+w, c.y+r/2));
    s.add(new Point(c.x, c.y+r  ));
    s.closed = true;

    s.fillColor =  new GradientColor(gr2, new Point(c.x+w, c.y+r/2), c);
    g[1] = s;
        
    //left
    s = new Path();
    s.add(c);
    s.add(new Point(c.x, c.y+r  ));
    s.add(new Point(c.x-w, c.y+r/2));
    s.add(new Point(c.x-w, c.y-r/2));
    s.closed = true;
    cl.red   *= 0.618;
    cl.green *= 0.618;
    cl.blue  *= 0.618;    
    s.fillColor = new GradientColor(gr3, new Point(c.x-w, c.y+r/2), c);;
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