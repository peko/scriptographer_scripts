// Script author peko [peko@gasubasu.com]
// http://gasubasu.com

// TOOL SPLIT PATH ON 7 PARTS

function onMouseDown(event) { 
	if(event.item) { 
        
        var dx = event.item.bounds.width/4;
        var dh = event.item.bounds.width/2;
        var dy = event.item.bounds.width/4*Math.sqrt(3);
        
        event.item.clone().scale(0.3333, event.item.bounds.center); 
        event.item.clone().scale(0.3333, event.item.bounds.center+new Point( dx, dy));         
        event.item.clone().scale(0.3333, event.item.bounds.center+new Point(-dx, dy));         
        event.item.clone().scale(0.3333, event.item.bounds.center+new Point( dx,-dy));         
        event.item.clone().scale(0.3333, event.item.bounds.center+new Point(-dx,-dy));         
        event.item.clone().scale(0.3333, event.item.bounds.center+new Point( dh,  0));
        event.item.clone().scale(0.3333, event.item.bounds.center+new Point(-dh,  0));         

        event.item.remove();
	} 
}