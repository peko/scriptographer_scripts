for(var y=0; y<=100; y+=10) {

    for(var m=0; m<=100; m+=10) {
        for(var c=0; c<=100; c+=10) {
            var r = new Path.Rectangle(new Point(c*1.1 + y%30*13, m*1.1+ Math.floor(y/30)*130), new Size(10, 10));
            r.fillColor = new CMYKColor(c/100, m/100, y/100, 0);
            r.strokeColor = null;
        }
    }
    
}

for(var y=0; y<=110; y+=10) {
    for(var m=0; m<=100; m+=10) {
        var text = new PointText(new Point( y%30*13 - 5,  m*1.1 + Math.floor(y/30)*130+7) );
        text.content = ""+m;
        text.characterStyle.fontSize = 6;
        text.paragraphStyle.justification = 'center';
    }
    
    for(var c=0; c<=100; c+=10) {
        var text = new PointText(new Point( c*1.1 + y%30*13+5, Math.floor(y/30)*130-3) );
        text.content = ""+c;
        text.characterStyle.fontSize = 6;
        text.paragraphStyle.justification = 'center';
    }
}