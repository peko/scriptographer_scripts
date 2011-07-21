// Script author peko [peko@gasubasu.com]
// http://gasubasu.com

// REPLACING PATH WITH AN IMAGE FROM FLICKR
// PATH USED AS A CLIP MASK

importPackage(java.net); 
importPackage(java.io); 

var bg = 'FFFFFF';

items = document.selectedItems.clone();
for (si in items) {
    var item = items[si]; 
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

        if (!data) {
            print("Data parse Error\n"+json);
        } else {
            url = new java.net.URL(data.result[Math.floor(Math.random()*50)][1]); 
            var image = new PlacedFile(url);
            image.bounds = item.bounds;
            var group = new Group();
            group.appendChild(image);
            group.appendChild(item);
            group.clipped = true;
            item.clipMask = true; 
        }
    }
    document.redraw();
}