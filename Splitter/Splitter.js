// Script author peko [peko@gasubasu.com]
// http://gasubasu.com

// TOOL SPLIT PATH ON 4

function onMouseDown(event) { 
	if(event.item) { 

        event.item.clone().scale(0.5, event.item.bounds.topLeft); 
        event.item.clone().scale(0.5, event.item.bounds.topRight);
        event.item.clone().scale(0.5, event.item.bounds.bottomLeft); 
        event.item.clone().scale(0.5, event.item.bounds.bottomRight);
        event.item.remove();    
        
	} 
}