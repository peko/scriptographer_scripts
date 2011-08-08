var p2mm = 2.83464567;

for(var i=0; i<document.artboards.length; i++) {
    var A = document.artboards[i];
    var h = A.bounds.height/Math.round(A.bounds.height/16.83);
    var w = A.bounds.width/Math.round(A.bounds.width/(16.83*1.618)); 
    
    for(var x=0; x<=A.bounds.width; x+=w) {
       var p = new Path();
       p.add(new Point(A.bounds.left+x,A.bounds.top   ));
       p.add(new Point(A.bounds.left+x,A.bounds.bottom)); 
       p.translate(-document.activeArtboard.bounds.topLeft);
    }
        
    for(var y=0; y<=A.bounds.height; y+=h) {
       var p = new Path();
       p.add(new Point(A.bounds.left, A.bounds.top+y));
       p.add(new Point(A.bounds.right,A.bounds.top+y)); 
       p.translate(-document.activeArtboard.bounds.topLeft);
    }

};
