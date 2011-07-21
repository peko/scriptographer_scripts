// Script author peko [peko@gasubasu.com]
// http://gasubasu.com

// CIRCLE PACKING (look wiki)

var last;

function onMouseDown(event) {
    var center;
    var first;
    var circle = new Path.Circle(event.point, 10);
    if (last) circle.moveBelow(last);
    last = circle;
            
    while (circle) {    
        if (circle) {
            var s = 1+2/circle.bounds.width;
            if (!center) circle.scale(s);
            else circle.scale(s, center);
            
            var r = circle.bounds.width/2;
            
            for (var i=0; i<36; i++) {
                var p =new Point(
                    r*Math.sin(i*10/180*3.1415926),
                    r*Math.cos(i*10/180*3.1415926)
                )  + circle.bounds.center;
                
                var hit = document.hitTest(p,1);
                if (hit && circle !== hit.item) {
                    if(!center){
                        //new Path.Circle(p, 2);
                        center = p;
                        first = hit.item;
                    } else if (hit.item !== first) {
                        //new Path.Circle(p, 2);
                        circle = null;
                        break;
                    } 
                    
                }
                
            }        
                        
        }
        if(circle && circle.bounds.width > 200) break;
    }
}
