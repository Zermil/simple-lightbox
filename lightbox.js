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
  element.className = className;

  element.LBatt = function(name, value) {
    this.setAttribute(name, value);
    return this;
  }

  element.LBhtml = function(html) {
    this.innerHTML = html;
    return this;
  }

  element.LBstyle = function(style) {
    this.style = style;
    return this;
  }

  element.LBchildren = function(...children) {
    for (const child of children) {
      this.appendChild(child);
    }

    return this;
  }

  element.LBclick = function(clickEvent) {
    this.onclick = clickEvent;
    return this;
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
//=========================

LB.prototype.createLightboxComponent = function(element) {
  const controlPanel = this.createTag("div", "lightbox-controlLB")
    .LBchildren(
      this.createTag("span", "lightbox-close-buttonLB")
        .LBhtml("&times;")
        .LBclick(this.closeLightboxComponent)
    );

  const lightboxPhoto = this.createTag("img", "lightbox-photo-enlargeLB")
    .LBatt("src", element.src)
    .LBatt("alt", `large_${element.alt}`)
    .LBstyle(
      // Scale images so that they don't cover the entire screen if they are too big
      `max-width: ${screen.width * this.options.photos_scale}px; 
       max-height: ${screen.height * this.options.photos_scale}px;`
    );
  
  // Append everything
  document.body.appendChild(
    this.createTag("div", "lightboxLB")
      .LBclick(this.closeLightboxComponent)
  );
  
  document.body.appendChild(
    this.createTag("div", "lightbox-photo-containerLB")
      .LBchildren(controlPanel, lightboxPhoto)
  );
}

LB.prototype.errorCheck = function() {
  const errorMessages = [];

  if (!(document.getElementById(this.options.target))) {
    errorMessages.push(
      `Gallery: '${this.options.target}' -> DOM element with specified 'target' id does not exist`
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
      .LBatt("alt", photo.alt)
      .LBclick(_ => this.createLightboxComponent(photo));

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
          alt: photo.title.split('.')[0]
        });

      _this.appendPhotos(allPhotos);

    } else {

      console.error(
        `Gallery: '${_this.options.target}' -> Failed to fetch photos from specified 'path' (photos_directory): '${_this.options.photos_directory}'`
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

// Wrapper function
// Feels weird but it works ugh...
function LBcreateGallery(initializeOptions) { 
  new LB().initialize(initializeOptions); 
}