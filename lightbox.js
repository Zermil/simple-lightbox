function removeLightbox() {
  document.body.removeChild(document.querySelector(".lightboxLB"));
  document.body.removeChild(document.querySelector(".lightbox-image-containerLB"));

  removeEventListener("keydown", listenerRemoveLightbox);
}

function listenerRemoveLightbox(e) {
  if (e.key === "Escape") removeLightbox();
}

function controlPanelComponent() {
  const controlPanel = document.createElement("div");
  const closeButton = document.createElement("span");

  controlPanel.classList.add("lightbox-controlLB");
  closeButton.classList.add("close-button");
  closeButton.textContent = "X";

  closeButton.onclick = removeLightbox;

  controlPanel.appendChild(closeButton);
  return controlPanel;
}

function createLightboxElement(element) {
  //TODO: Make it customizable(?)
  const scalar = 0.756;
  
  //IMAGE
  const imageContainer = document.createElement("div");
  const image = document.createElement("img");

  imageContainer.classList.add("lightbox-image-containerLB");

  image.classList.add("custom-photo-enlargeLB");
  image.setAttribute("src", element.img);

  image.style.maxWidth = `${screen.width * scalar}px`;
  image.style.maxHeight = `${screen.height * scalar}px`;

  imageContainer.appendChild(image);
  //================

  //LIGHTBOX
  const lightbox = document.createElement("div");
  lightbox.classList.add("lightboxLB");

  lightbox.onclick = removeLightbox;
  addEventListener("keydown", listenerRemoveLightbox);
  //================

  //CONTROL
  imageContainer.appendChild(controlPanelComponent());
  //================
  
  document.body.appendChild(lightbox);
  document.body.appendChild(imageContainer);
}

function createPhotoElement(element) {
  const photoObject = document.createElement("img");

  photoObject.classList.add("custom-photoLB");

  photoObject.setAttribute("src", element.img);
  photoObject.setAttribute("alt", `lightbox_${element.name}`);

  photoObject.onclick = () => createLightboxElement(element);

  return photoObject;
}

function createGallery(properties) {
  const target = document.getElementById(properties.target || "gallery");
  let dir = properties.photos_dir || "./photos/";

  if (!target) {
    console.error("Could not find specified target location: Invalid gallery/target id");
    return;
  }
  
  //Why is web-development like this...
  const xhr = new XMLHttpRequest();
  xhr.open("GET", dir, true);
  xhr.responseType = 'document';
  
  xhr.onload = function() {
    if (xhr.status === 200) {
      const elements = 
        [...xhr.response.getElementsByTagName("a")]
        .filter(photo => photo.href.match(/\.(jpe?g|png)$/))
        .map((photo, index) => photo = {
          index,
          img: photo.href,
          name: photo.title
        });

      for (element of elements) {
        target.appendChild(
          createPhotoElement(element)
        );
      }
    } else {
      console.error("Failed to fetch photos from folder/specified path", xhr.status);
    }
  }

  xhr.send();
}