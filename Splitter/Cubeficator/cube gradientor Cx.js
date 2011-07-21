var items = document.selectedItems.clone();
var SQ3 = Math.sqrt(3);
var gt = "linear";
for (si in items) {
    var i = items[si];
    var c = i.bounds.center;
    var r = i.bounds.height / 2;
    var w = r * SQ3 / 2;
    if (i.children.length == 3) {
        
        
        var c1 = i.children[0].fillColor;
        var c2 = i.children[1].fillColor;
        var c3 = i.children[2].fillColor;
        
        c1 = c1 ? c1.clone() : new RGBColor(1,1,1);
        c2 = c2 ? c2.clone() : new RGBColor(1,1,1);
        c3 = c3 ? c3.clone() : new RGBColor(1,1,1);
        
        var s = i.children[0];                                
        var gr = new Gradient() {type: gt, stops:[new GradientStop(c1, 0), new GradientStop(c2, 1)]};
        s.fillColor = new GradientColor(gr, new Point(c.x  , c.y-r), c);
        
        s = i.children[1];
        var gr = new Gradient() {type: gt, stops:[new GradientStop(c2, 0), new GradientStop(c3, 1)]};
        s.fillColor = new GradientColor(gr, new Point(c.x+w, c.y+r/2), c);
        
        s = i.children[2];
        var gr = new Gradient() {type: gt, stops:[new GradientStop(c3, 0), new GradientStop(c1, 1)]};
        s.fillColor = new GradientColor(gr, new Point(c.x-w, c.y+r/2), c);
    } else print("NOT CUBE");
       
}