if(document.selectedItems.length>0) {
    var item = document.selectedItems[0];
    for(var i=0; i<document.artboards.length; i++) {
        A = document.artboards[i];
        var clone = item.clone();
        var ws = A.bounds.width  / clone.bounds.width ;
        var hs = A.bounds.height / clone.bounds.height;
        var ss = ws > hs ? ws : hs;
        clone.bounds.center = A.bounds.center;
        clone.scale(ss);
        clone.translate(-document.activeArtboard.bounds.topLeft);
        var mask = new Path.Rectangle(A.bounds);
        var g = new Group();
        g.appendChild(clone);
        g.appendChild(mask);
        g.clipped = true;
        mask.clipMask = true; 
        mask.translate(-document.activeArtboard.bounds.topLeft);
       
    };
    item.remove();
    
}