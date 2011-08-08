if(document.selectedItems.length>0) {
    var item  = document.selectedItems[0];
    for(var i=0; i<document.artboards.length; i++) {
        A = document.artboards[i];
        var clone = item.clone();
        clone.position = A.bounds.center;
        clone.bounds = A.bounds;
        clone.bounds.height = item.bounds.height*A.bounds.width/item.bounds.width;
        //for (var n in clone) print(n+": "+clone[n]);
        clone.translate(-document.activeArtboard.bounds.topLeft);
       
        if (clone.bounds.height>A.bounds.height) {
            var mask = new Path.Rectangle(A.bounds);
            var g = new Group();
            g.appendChild(clone);
            g.appendChild(mask);
            g.clipped = true;
            mask.clipMask = true; 
            mask.translate(-document.activeArtboard.bounds.topLeft);
      }
    };
    item.remove();
    
}