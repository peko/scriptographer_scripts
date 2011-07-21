var items = document.selectedItems.clone();
var SQ3 = Math.sqrt(3);

for (si in items) {
    var i = items[si];
    var r = i.bounds.height / 4;
    var w = r * SQ3/2
    var rnd = Math.floor(Math.random()*3);
    
    switch (rnd) {
        case 0:
            i.position+= new Point( 0, -r);
            break;
        case 1:
            i.position+= new Point( w, r/2);
            break;
        case 2:
            i.position+= new Point(-w, r/2);
            break;
        
    }
    
}