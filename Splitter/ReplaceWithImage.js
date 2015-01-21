// Replace With An Image v.1.2

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
var size = 100;


items = document.selectedItems.clone();
for (si in items) {

    var item = items[si]; 
    var color = item.fillColor;
    var R = (Math.round(color.red  *255)).toString(16); if (R.length<2) R='0'+R;
    var G = (Math.round(color.green*255)).toString(16); if (G.length<2) G='0'+G;
    var B = (Math.round(color.blue *255)).toString(16); if (B.length<2) B='0'+B;
    var hex = R+G+B;

    if (item && hex) {
        

        
        // NEW URL
        // http://labs.tineye.com/multicolr/rest/color_search/
        //     ?limit=73
        //     &offset=0
        //     &return_metadata=
        //        %3CuserID%2F%3E
        //        %3CphotoID%2F%3E
        //        %3CimageWidth%2F%3E
        //        %3CimageHeight%2F%3E
        //     &colors%5B0%5D=e7402d
        //     &weights%5B0%5D=100
        

        
        var url = new URL(
            'http://labs.tineye.com/multicolr/rest/color_search/?'+
            'limit=50&'+
            'offset=0&'+
            'return_metadata='+
            '%3CuserID%2F%3E'+
            '%3CphotoID%2F%3E'+
            '%3CimageWidth%2F%3E'+
            '%3CimageHeight%2F%3E&'+
            'colors%5B' +1+'%5D='+bg   +'&'+
            'colors%5B' +0+'%5D='+hex  +'&'+
            'weights%5B'+1+'%5D='+bg_w +'&'+
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

            // NEW URL
            // http://img.tineye.com/flickr-images/?filepath=labs-flickr-public/images/
            //     49/7584251048_4900a64b9b_m.jpg
            //     &size=76

            var file = data.result[Math.floor(Math.random()*50)]['filepath'];
            var name = file.split('/')[1];
            var path = "http://img.tineye.com/flickr-images/?size=" + size + "&filepath=labs-flickr-public/images/" + file;
            print(path);

            url = new java.net.URL(path);
            
            var input = new java.io.BufferedInputStream(url.openStream());
            var output = new java.io.FileOutputStream(name);
            var data = [];
            var b = 0
            while ((b = input.read()) != -1) {
                output.write(b);
            }
            input.close()
            output.close()
            var img = new java.io.File("./"+name);
            var image = new PlacedFile(img);
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
