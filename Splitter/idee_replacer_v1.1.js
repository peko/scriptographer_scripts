// idee replacer v.1.1

// Online search engine has some changes
// So I fix request and parsing

// DESCRIPTION

// This script search for selected items images with similar color.
// Then replace selected path with radnom image and clip it with original path.
// Sorry guys, I'm to lazy to write GUI ;)

// This code under Creative Common license (CC BY-SA) 
// http://creativecommons.org/licenses/by-sa/2.0/
// It's mean YOU ARE FREE:
//    to share — to copy, distribute and transmit the work, 
//    to remix — to adapt the work
//    to make commercial use of the work

// Script author peko [peko@gasubasu.com]
// http://gasubasu.com

// Script uses online services developed by Idée Inc.
// http://ideeinc.com/



importPackage(java.net); 
importPackage(java.io); 

var bg = 'FFFFFF';
var bg_w  = 0.25; // weight if bg color
var hex_w = 0.75; // weight of main color

items = document.selectedItems.clone();
for (si in items) {
    var item = items[si]; 
    if (item.fillColor) {
        var color = item.fillColor;
        var R = (Math.round(color.red  *255)).toString(16); if (R.length<2) R='0'+R;
        var G = (Math.round(color.green*255)).toString(16); if (G.length<2) G='0'+G;
        var B = (Math.round(color.blue *255)).toString(16); if (B.length<2) B='0'+B;
        var hex = R+G+B;

        if (item && hex) {
            
            // OLD URL FORMAT
            //var url = new URL('http://labs.ideeinc.com/coloursearch/services/rest/?method=color.search&quantity=50&page=0&colors='+bg+'%2C'+hex+'&imageset=flickr');
            
            // NEW URL FORMAT (weights was added)
            // http://labs.ideeinc.com/rest/?method=flickr_color_search&limit=60&offset=0&colors%5B0%5D=e84b33&colors%5B1%5D=48a85b&weights%5B0%5D=0.5&weights%5B1%5D=0.5
            
            // %5B & %5D it's just codes for [ & ]
            var url = new URL(
                'http://labs.ideeinc.com/rest/?'+
                'method=flickr_color_search&'+
                'limit=60&'+
                'offset=0&'+
                //'colors%5B' +0+'%5D='+bg   +'&'+
                'colors%5B' +0+'%5D='+hex  +'&'+
                //'weights%5B'+0+'%5D='+bg_w +'&'+
                'weights%5B'+0+'%5D='+hex_w
            );
            
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
                
                // RETURNIG DATA FORMAT LOOKS LIKE NEXT OBJECT: 
                // .filepath:   "http://img.tineye.com/l...ic-files/2386476346.jpg"
                // .id:         "2386476346"
                // .photosite:  "http://www.flickr.com/p...46425925@N00/2386476346"
                // .score:      "99.90"
                var o = data.result[Math.floor(Math.random()*50)];
		if (o!=undefined) {
                	url = new java.net.URL(o['filepath']); 
                	var image = new PlacedFile(url);
                	image.bounds = item.bounds;
                	var group = new Group();
                	group.appendChild(image);
                	group.appendChild(item);
                	group.clipped = true;
                	item.clipMask = true;
		} 
            }
        } // item && hex
    }// item.fillColor
    document.redraw();
}