var p2mm = 2.83464567;

for(var i=0; i<document.artboards.length; i++) {
    A = document.artboards[i];
    var text = new PointText(A.bounds.topLeft-new Point(0, 10));
    text.translate(-document.activeArtboard.bounds.topLeft);
    text.content= Math.round(A.bounds.width/p2mm)+" x "+Math.round(A.bounds.height/p2mm)+" mm";
    text.range.characterStyle.fontSize = 24;
    text.range.characterStyle.fillColor = '#202020';
    text.locked = true;
    
};
