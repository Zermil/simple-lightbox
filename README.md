# Simple-Lightbox

Small JavaScript "framework", mostly for personal use, used to create small galleries for simple websites. 80% of pre-existing ones, claiming to be "lightweight" and "simple" actually have over 800+ lines of code ![PogO](./photos/PogO.png)

**DISCLAIMER**: If you are looking for something "concrete" and "well made" this is not it. This is more so a personal project/framework/thing. Please consider using one of the following if you are looking for something well made:

- [lightbox2](https://github.com/lokesh/lightbox2)
- [lightgallery.js](https://github.com/sachinchoolur/lightgallery.js/)
- [glightbox](https://github.com/biati-digital/glightbox)

## Quick start/Instructions

I don't know why would someone want to use it, but a simple demo can be found in "[index.html](https://github.com/Zermil/simple-lightbox/blob/master/index.html)" it also has "customizable" CSS so suit yourself. 

**NOTE** that it needs some sort of "server" to run (website needs to be hosted somewhere, it can be hosted locally when you are testing), because of XML request.

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
  LBcreateGallery({
    photos_directory: "./photos"
  });
</script>
</body>
</html>
```

## Mini DOCs:

**`LBcreateGallery(initializeOptions)`**: Main function generating gallery, possible 'initializeOptions' are:
- `target`: [DOM element ID, preferably div's] Specifies where to display photos.
- `photos_directory`: Path to a folder containing all photos.
- `photos_scale`: [1 > preferably > 0] Value by which to scale all 'enlarged' photos. (photos within lightbox after you click on them)

**`DEFAULTS`**:
- `target`: "gallery"
- `photos_directory`: "./photos"
- `photos_scale`: 0.75