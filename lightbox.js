
function createPhotoElement(src, name) {
  const photoObject = document.createElement("img");

  photoObject.classList.add("custom-photoLB");

  photoObject.setAttribute("src", src);
  photoObject.setAttribute("alt", `lightbox_${name}`);

  return photoObject;
}

function createLightbox(properties) {
  const target = document.getElementById(properties.target || "gallery");
  let dir = properties.photos_dir || "./photos/";

  if (!target) {
    console.error("Could not find specified target location: Invalid gallery/target id");
    return;
  }

  const xhr = new XMLHttpRequest();
  xhr.open("GET", dir, true);
  xhr.responseType = 'document';
  
  xhr.onload = function() {
    if (xhr.status === 200) {
      const elements = xhr.response.getElementsByTagName("a");
      
      for (element of elements) {
        if ( element.href.match(/\.(jpe?g|png)$/) ) {

          target.appendChild(
            createPhotoElement(element.href, element.title)
          );

        }
      }
    } else {
      console.error("Failed to fetch photos from folder/specified path", xhr.status);
    }
  }

  xhr.send();
}