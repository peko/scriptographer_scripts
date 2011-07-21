var items = document.selectedItems.clone();
var SQ3 = Math.sqrt(3);
var gt = "linear";
for (si in items) {
    var i = items[si];
    var c = i.bounds.center;
    var r = i.bounds.height / 2;
    var w = r * SQ3 / 2;
    var ml = 1.1;
    var sm = 0.5;
    if (i.children.length == 3) {
        
        var s = i.children[0];
        if (s.fillColor) {
            if (s.fillColor.type != "rgb") s.fillColor = s.fillColor.convert("rgb");
            var c1 = s.fillColor.clone();
            var c2 = c1.clone();
            c2.red   *= ml; c2.red   += sm;
            c2.green *= ml; c2.green += sm;
            c2.blue  *= ml; c2.blue  += sm;
            var gr = new Gradient() {type: gt, stops:[new GradientStop(c2, 0), new GradientStop(c1, 1)]};
            s.fillColor = new GradientColor(gr, new Point(c.x  , c.y-r), c);
        }
        
        
        s = i.children[1];
        if (s.fillColor) {
            if (s.fillColor.type != "rgb") s.fillColor = s.fillColor.convert("rgb");
            c1 = s.fillColor.clone();
            var c2 = c1.clone();
            c2.red   *= ml; c2.red   += sm;
            c2.green *= ml; c2.green += sm;
            c2.blue  *= ml; c2.blue  += sm;
            var gr = new Gradient() {type: gt, stops:[new GradientStop(c2, 0), new GradientStop(c1, 1)]};
            s.fillColor = new GradientColor(gr, new Point(c.x+w, c.y+r/2), c);
        }
        
        s = i.children[2];
        if (s.fillColor) {
            if (s.fillColor.type != "rgb") s.fillColor = s.fillColor.convert("rgb");
            var c1 = s.fillColor.clone();
            var c2 = c1.clone();
            c2.red   *= ml; c2.red   += sm;
            c2.green *= ml; c2.green += sm;
            c2.blue  *= ml; c2.blue  += sm;
            var gr = new Gradient() {type: gt, stops:[new GradientStop(c2, 0), new GradientStop(c1, 1)]};
            s.fillColor = new GradientColor(gr, new Point(c.x-w, c.y+r/2), c);
        }
    } else print("NOT CUBE");
       
}