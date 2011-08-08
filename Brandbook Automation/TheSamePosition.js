if(document.selectedItems.length>0) {
    var item  = document.selectedItems[0];
    var active = document.activeArtboard;

    var kw = item.bounds.width/active.bounds.width;
    var dx = item.bounds.left - active.bounds.left;
    var dy = item.bounds.top  - active.bounds.top;
    
    var pos = item.bounds.center;
    
    for(var i=0; i<document.artboards.length; i++) {

        A = document.artboards[i];
        if (A === active) continue;
        
        var clone = item.clone();
        var sx = A.bounds.width/active.bounds.width  ;
        var sy = A.bounds.height/active.bounds.height;
        var ss = sx < sy ? sx : sy;
        clone.scale(ss);
        clone.position = A.bounds.topLeft+pos*ss;
        clone.translate(-document.activeArtboard.bounds.topLeft);
        
    };
    
}