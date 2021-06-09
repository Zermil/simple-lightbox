# Simple-Lightbox

Small JavaScript "framework", mostly for personal use, used to create small galleries for simple websites. 80% of pre-existing ones, claiming to be "lightweight" and "simple" actually have over 800+ lines of code ![PogO](./photos/PogO.png) and I just wanted something that will generate DOM with classes.

**DISCLAIMER**: If you are looking for something "concrete" and "well made" this is not it. This is more so a personal project/framework/thing. Please consider using one of the following if you are looking for something well made:

- [lightbox2](https://github.com/lokesh/lightbox2)
- [lightgallery.js](https://github.com/sachinchoolur/lightgallery.js/)
- [glightbox](https://github.com/biati-digital/glightbox)

Photos in demo: Courtesy of [Unsplash](https://unsplash.com/)

## Quick start/Instructions

I don't know why would someone want to use it, but a quick demo can be found in "[index.html](https://github.com/Zermil/simple-lightbox/blob/master/index.html)" it also has "customizable" [CSS](https://github.com/Zermil/simple-lightbox/blob/master/lightbox.css) so suit yourself. 

**NOTE** that the demo project needs some sort of "server" to run (file needs to be hosted somewhere, it can be hosted locally when you are testing, using python's SimpleHTTPServer for example), because of fetch request.

Get started template:

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
    images_array: [
      {
        "src": SOURCE,
        "alt": ALT
      }
    ]
  });
</script>
</body>
</html>
```

Local hosting with the use of SimpleHTTPServer:

```console
> python -m http.server 1337
```

## Mini DOCs:

**`LBcreateGallery(initializeOptions)`**: Main function generating gallery, possible `'initializeOptions'` are:
- `target`: [DOM element ID, preferably div's] Specifies where to display photos.
- `photos_scale`: [1 > preferably > 0] Value by which to scale all 'enlarged' photos. (photos within lightbox after you click on them)
- `images_array`: Array of photos as objects => { "src": SOURCE, "alt": ALT }

**`DEFAULTS`**:
- `target`: "gallery"
- `photos_scale`: 0.75
- `images_array`: []