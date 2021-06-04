# Simple-Lightbox

Small JavaScript library/framework, mostly for personal use, I use it to create small galleries for simple websites. 80% of pre-existing ones, claiming to be "lightweight" and "simple" actually have over 800 lines of code PogO

## Quick start/Instructions

I don't know why you would want to use it... but a simple demo can be found in "[index.html](https://github.com/Zermil/simple-lightbox/blob/master/index.html)" it also has "customizable" CSS so suit yourself. 

**NOTE** that it needs some sort of "server" to run (website needs to be hosted somewhere), because of XML request.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="./lightbox.css" />
  <title>simple-lightbox</title>
</head>
<body>
  <div id="gallery"></div>

<script src="./lightbox.js"></script>
<script>
  window.onload = () => {
    
    createGallery({
      target: "gallery",
      photos_dir: "./photos"
    });

  }
</script>
</body>
</html>
```