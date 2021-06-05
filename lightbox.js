function LB() {
  this.options = {
    target: "gallery",
    photos_directory: "./photos",
    photos_scale: 0.75
  };
}

// Utilities
LB.prototype.createTag = function(tag, className) {
  const element = document.createElement(tag);

  element.LBatt = function(name, value) {
    this.setAttribute(name, value);
    return this;
  }

  if (className) {
    element.className = className;
  }

  return element;
}

LB.prototype.closeLightboxComponent = function() {
  document.body.removeChild(
    document.querySelector(".lightbox-photo-containerLB")
  );

  document.body.removeChild(
    document.querySelector(".lightboxLB")
  );
}

LB.prototype.createLightboxComponent = function(element) {
  const lightbox = this.createTag("div", "lightboxLB");
  const lightboxPhotoContainer = this.createTag("div", "lightbox-photo-containerLB");

  const lightboxPhoto = this.createTag("img", "lightbox-photo-enlargeLB")
    .LBatt("src", element.src)
    .LBatt("alt", `large_${element.alt}`);

  // Scale images so that they don't cover the entire screen if they are too big
  lightboxPhoto.style.maxHeight = `${screen.height * this.options.photos_scale}px`;
  lightboxPhoto.style.maxWidth = `${screen.width * this.options.photos_scale}px`;

  lightbox.onclick = () => this.closeLightboxComponent();
  
  // Append everything
  lightboxPhotoContainer.appendChild(lightboxPhoto);

  document.body.appendChild(lightbox);
  document.body.appendChild(lightboxPhotoContainer);
}
//=========================

LB.prototype.errorCheck = function() {
  const errorMessages = [];

  if (!(document.getElementById(this.options.target))) {
    errorMessages.push(
      `Gallery: '${this.options.target}' -> specified 'target' id does not exist`
    );
  }

  if (this.options.photos_scale <= 0) {
    errorMessages.push(
      `Gallery: '${this.options.target}' -> 'photos_scale' needs to be greater than 0, provided: ${this.options.photos_scale}`
    );
  }

  return errorMessages;
}

LB.prototype.appendPhotos = function(photos) {
  const target = document.getElementById(this.options.target);

  for (const photo of photos) {
    const img = this.createTag("img", "lightbox-photoLB")
      .LBatt("src", photo.src)
      .LBatt("alt", photo.alt);
    
    img.onclick = () => this.createLightboxComponent(photo);

    target.appendChild(img);
  }
}

LB.prototype.fetchAndAppendPhotosFromDirectory = function() {
  const _this = this;

  // Why is web-development like this...
  const xhr = new XMLHttpRequest();
  xhr.open("GET", this.options.photos_directory);
  xhr.responseType = "document";

  xhr.onload = function() {
    if (this.status === 200) {

      const allPhotos = [...this.response.getElementsByTagName('a')]
        .filter(photo => photo.href.match(/\.(jpe?g|png)$/i))
        .map(photo => photo = {
          src: photo.href,
          alt: photo.title
        });

      _this.appendPhotos(allPhotos);

    } else {

      console.error(
        `Gallery: '${_this.options.target}' -> Failed to fetch photos from specified path (photos_directory): '${_this.options.photos_directory}'`
      );
      
    }
  }

  xhr.send();
}

LB.prototype.initialize = function(initializeOptions) {
  Object.assign(this.options, initializeOptions);

  // Error check could be improved
  const errorMessages = this.errorCheck();

  if (errorMessages.length > 0) {
    for (const errorMsg of errorMessages) console.error(errorMsg);
    return;
  }
  
  this.fetchAndAppendPhotosFromDirectory();
}

// Feels weird but it works ugh...
function createGallery(initializeOptions) { 
  new LB().initialize(initializeOptions); 
}