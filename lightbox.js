// Utilities
window.LButils = {
  createTag: function(tag, className) {
    const element = document.createElement(tag);
  
    if (className) {
      element.className = className;
    }

    element.LBatt = function(name, value) {
      this.setAttribute(name, value);
      return this;
    }

    element.LBhtml = function(html) {
      this.innerHTML = html;
      return this;
    }

    element.LBstyle = function(style) {
      this.style.cssText = style;
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

    element.LBtext = function(s) {
      this.innerText = s;
      return this;
    }

    return element;
  },

  createLightboxComponent: function(element) {
    const controlPanel = LButils.createTag("div", "lightbox-controlLB")
      .LBchildren(
        LButils.createTag("span", "lightbox-buttonLB")
          .LBhtml("&times;")
          .LBclick(this._closeLightboxComponent)
      );

    // Append everything
    document.body.appendChild(
      LButils.createTag("div", "lightboxLB")
        .LBclick(this._closeLightboxComponent)
    );
    
    document.body.appendChild(
      LButils.createTag("div", "lightbox-containerLB")
        .LBchildren(controlPanel, element)
    );
  },

  _closeLightboxComponent: function() {
    document.body.removeChild(
      document.querySelector(".lightbox-containerLB")
    );
  
    document.body.removeChild(
      document.querySelector(".lightboxLB")
    );
  }
};
//=========================

const LBdefaults = {
  target: "gallery",
  photos_directory: "./photos",
  photos_scale: 0.75
};

function LB(initializeOptions = {}) {
  this.options = Object.assign({}, LBdefaults, initializeOptions);
  this._currentIndex = 0;
  this._photoElements = [];
}

LB.prototype._createEnlargedPhotoElement = function(from) {
  const lightboxPhoto = LButils.createTag("img", "lightbox-photo-enlargedLB")
    .LBatt("src", from.src)
    .LBatt("alt", `large_${from.alt}`)
    .LBstyle(
      // Scale images so that they don't cover the entire screen if they are too big
      `max-width: ${screen.width * this.options.photos_scale}px; 
      max-height: ${screen.height * this.options.photos_scale}px;`
    );
    
  const swapPanel = LButils.createTag("div", "lightbox-controlLB")
    .LBchildren(
      LButils.createTag("span", "lightbox-buttonLB lightbox-swapLB").LBhtml("&lt;").LBclick(_ => {
        this._currentIndex = this._currentIndex <= 0 ? 0 : this._currentIndex - 1;
        lightboxPhoto.src = this._photoElements[this._currentIndex].src;
      }),

      LButils.createTag("span", "lightbox-buttonLB lightbox-swapLB").LBhtml("&gt;").LBclick(_ => {
        this._currentIndex = this._currentIndex >= this._photoElements.length - 1 ? this._photoElements.length - 1 : this._currentIndex + 1;
        lightboxPhoto.src = this._photoElements[this._currentIndex].src;
      }),
    );

  // Responsive images
  window.addEventListener("resize", _ => {
    if (document.querySelector(".lightbox-photo-enlargedLB")) {
      document.querySelector(".lightbox-photo-enlargedLB").style.cssText = `
        max-width: ${screen.width * this.options.photos_scale}px;
        max-height: ${screen.height * this.options.photos_scale}px;
      `;
    }
  });

  return LButils.createTag("div").LBchildren(lightboxPhoto, swapPanel);
}

LB.prototype._appendPhotos = function(photos) {
  this._photoElements = photos; // IMPORTANT!

  const target = document.getElementById(this.options.target);
  const fragment = document.createDocumentFragment();

  for (const photo of photos) {
    const img = LButils.createTag("img", "lightbox-photoLB")
      .LBatt("src", photo.src)
      .LBatt("alt", photo.alt)
      .LBclick(_ => {
        this._currentIndex = photos.findIndex(element => element.src === photo.src);
        LButils.createLightboxComponent(this._createEnlargedPhotoElement(photo));
      });

    fragment.appendChild(img);
  }

  target.appendChild(fragment);
}

LB.prototype._fetchAndAppendPhotosFromDirectory = function() {
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
      
      /*
        * You need a callback function like this
        * otherwise you can't "retrive"/assign photos
        * like so -> this._photoElements = allPhotos;
        * yay web-dev/js
      */
      _this._appendPhotos(allPhotos);

    } else {

      console.error(
        `Gallery: '${_this.options.target}' -> Failed to fetch photos from specified 'path' (photos_directory): '${_this.options.photos_directory}'`
      );

    }
  }

  xhr.send();
}

LB.prototype._errorCheck = function() {
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

LB.prototype.initializeGallery = function() {
  // Error check could be improved
  const errorMessages = this._errorCheck();

  if (errorMessages.length) {
    for (const errorMsg of errorMessages) {
      console.error(errorMsg);
    }

    return;
  }
  
  this._fetchAndAppendPhotosFromDirectory();
}

// Wrapper function
// Feels weird and wrong, but it works ugh...
function LBcreateGallery(initializeOptions) {
  const instance = new LB(initializeOptions);
  instance.initializeGallery();

  return instance;
}