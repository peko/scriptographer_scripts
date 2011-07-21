var items = document.selectedItems.clone();
var SQ3 = Math.sqrt(3);
var gt = "linear";
for (si in items) {
    var i = items[si];
    var c = i.bounds.center;
    var r = i.bounds.height / 2;
    var w = r * SQ3 / 2;
    var k = 0.05;
    if (i.children.length == 3) {
        
        var s = i.children[0];
        if (s.fillColor) {
            if (s.fillColor.type != "rgb") s.fillColor = s.fillColor.convert("rgb");
            var c1 = s.fillColor.clone();
            var c2 = c1.clone();
            c2.red   *= 1+k;
            c2.green *= 1+k;
            c2.blue  *= 1+k;
            
            var gr = new Gradient() {type: gt, stops:[new GradientStop(c2, 0), new GradientStop(c1, 1)]};
            s.fillColor = new GradientColor(gr, c, new Point(c.x  , c.y-r));
        }
        
        
        s = i.children[1];
        if (s.fillColor) {
            if (s.fillColor.type != "rgb") s.fillColor = s.fillColor.convert("rgb");
            c1 = s.fillColor.clone();
            var c2 = c1.clone();
            c2.red   *= 1-k;
            c2.green *= 1-k;
            c2.blue  *= 1-k;
            var gr = new Gradient() {type: gt, stops:[new GradientStop(c1, 0), new GradientStop(c2, 1)]};
            s.fillColor = new GradientColor(gr, new Point(c.x+w, c.y+r/2), c);
        }
        
        s = i.children[2];
        if (s.fillColor) {
            if (s.fillColor.type != "rgb") s.fillColor = s.fillColor.convert("rgb");
            var c1 = s.fillColor.clone();
            var c2 = c1.clone();
            c2.red   *= 1-2*k;
            c2.green *= 1-2*k;
            c2.blue  *= 1-2*k;
            var gr = new Gradient() {type: gt, stops:[new GradientStop(c1, 0), new GradientStop(c2, 1)]};
            s.fillColor = new GradientColor(gr, new Point(c.x-w, c.y+r/2), c);
        }
    } else print("NOT CUBE");
       
}