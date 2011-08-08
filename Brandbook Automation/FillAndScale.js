if(document.selectedItems.length>0) {
    var item = document.selectedItems[0];
    for(var i=0; i<document.artboards.length; i++) {
        A = document.artboards[i];
        var clone = item.clone();
        clone.bounds = A.bounds;
        clone.translate(-document.activeArtboard.bounds.topLeft);
    };
    item.remove();
    
}