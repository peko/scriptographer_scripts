// Script author peko [peko@gasubasu.com]
// http://gasubasu.com


importPackage(java.net); 
importPackage(java.io); 

var bg='FFFFFF';

var item = document.selectedItems[0]; 
var color = item.fillColor;
var R = (Math.round(color.red  *255)).toString(16); if (R.length<2) R='0'+R;
var G = (Math.round(color.green*255)).toString(16); if (G.length<2) G='0'+G;
var B = (Math.round(color.blue *255)).toString(16); if (B.length<2) B='0'+B;
var hex = R+G+B;

if (item && hex) {

    var url = new URL('http://labs.ideeinc.com/coloursearch/services/rest/?method=color.search&quantity=50&page=0&colors='+bg+'%2C'+hex+'&imageset=flickr');
    var stream = new DataInputStream(url.openStream());
    var json = '';
    var line;
    while ((line = stream.readLine()) != null) {
        json += line;
    };
    var data = Json.decode(json);
    var i = 0;
    for (n in data.result) {
        url = new java.net.URL(data.result[n][1]); 
        var image = new PlacedFile(url);

        image.bounds.width  = 80;
        image.bounds.height = 80;
        image.bounds.center = new Point(i%10*81, Math.floor(i/10)*81);

        document.redraw(); 
        i++;
    }
}