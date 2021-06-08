// Utilities
window.LButils = {
  createTag: function(tag, className) {
    const element = document.createElement(tag);
  
    if (className) {
      element.className = className;
    }

    element.LBatt = function(attributes) {
      for (const attributeName in attributes) {
        this.setAttribute(attributeName, attributes[attributeName]);
      }

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

  createLightboxComponent: function(element, onclose = null) {
    const controlPanel = LButils.createTag("div", "lightbox-controlLB")
      .LBchildren(
        LButils.createTag("span", "lightbox-buttonLB")
          .LBhtml("&times;")
          .LBclick(() => this._closeLightboxComponent(onclose))
      );

    // Append everything
    document.body.appendChild(
      LButils.createTag("div", "lightboxLB")
        .LBclick(() => this._closeLightboxComponent(onclose))
    );
    
    document.body.appendChild(
      LButils.createTag("div", "lightbox-containerLB")
        .LBchildren(controlPanel, element)
    );
  },

  clearDOMElement: function(element) {
    while(element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },

  _closeLightboxComponent: function(onclose = null) {
    document.body.removeChild(
      document.querySelector(".lightbox-containerLB")
    );
  
    document.body.removeChild(
      document.querySelector(".lightboxLB")
    );

    if (onclose) onclose();
  }
};
//=========================

const LBdefaults = {
  target: "gallery",
  photos_directory: null,
  photos_scale: 0.75,
  images_array: [],
};

function LB(initializeOptions = {}) {
  this._options = Object.assign({}, LBdefaults, initializeOptions);
  this._photoElements = [];
  this._currentIndex = 0;
  this._onResizeEvent = null;
}

LB.prototype._onResize = function() {
  document.querySelector(".lightbox-photo-enlargedLB").style.cssText = `
    max-width: ${screen.width * this._options.photos_scale}px;
    max-height: ${screen.height * this._options.photos_scale}px;
  `;
}

LB.prototype._createEnlargedPhotoElement = function(from) {
  const lightboxPhoto = LButils.createTag("img", "lightbox-photo-enlargedLB")
    .LBatt({ "src": from.src, "alt": `large_${from.alt}` })
    .LBstyle(
      // Scale images so that they don't cover the entire screen if they are too big
      `max-width: ${screen.width * this._options.photos_scale}px; 
      max-height: ${screen.height * this._options.photos_scale}px;`
    );
    
  const swapPanel = LButils.createTag("div", "lightbox-controlLB")
    .LBchildren(
      LButils.createTag("span", "lightbox-buttonLB lightbox-swapLB").LBhtml("&lt;").LBclick(() => {
        this._currentIndex = this._currentIndex <= 0 ? 0 : this._currentIndex - 1;
        lightboxPhoto.src = this._photoElements[this._currentIndex].src;
      }),

      LButils.createTag("span", "lightbox-buttonLB lightbox-swapLB").LBhtml("&gt;").LBclick(() => {
        this._currentIndex = this._currentIndex >= this._photoElements.length - 1 ? this._photoElements.length - 1 : this._currentIndex + 1;
        lightboxPhoto.src = this._photoElements[this._currentIndex].src;
      }),
    );

  return LButils.createTag("div").LBchildren(lightboxPhoto, swapPanel);
}

LB.prototype._appendPhotos = function(photos) {
  this._photoElements = photos; // IMPORTANT!

  const target = document.getElementById(this._options.target);
  const fragment = document.createDocumentFragment();

  for (const photo of this._photoElements) {
    const img = LButils.createTag("img", "lightbox-photoLB")
      .LBatt({ "src": photo.src, "alt": photo.alt })
      .LBclick(() => {
        this._currentIndex = this._photoElements.findIndex(element => element.src === photo.src);
        this._onResizeEvent = (this._onResize).bind(this);

        LButils.createLightboxComponent(
          this._createEnlargedPhotoElement(photo),
          () => { window.removeEventListener("resize", this._onResizeEvent); this._onResizeEvent = null; }
        );
        
        // Responsive images
        window.addEventListener("resize", this._onResizeEvent);
      });

    fragment.appendChild(img);
  }

  target.appendChild(fragment);
}

LB.prototype._fetchAndAppendPhotosFromDirectory = function() {
  const _this = this;

  // Why is web-development like this...
  const xhr = new XMLHttpRequest();
  xhr.open("GET", this._options.photos_directory);
  xhr.responseType = "document";

  xhr.onload = function() {
    if (this.status === 200) {

      const allPhotos = [...this.response.getElementsByTagName('a')]
        .filter(photo => photo.href.match(/\.(jpe?g|png)$/i))
        .map(photo => photo = {
          "src": photo.href,
          "alt": photo.textContent.split('.')[0]
        });

      /*
        * You need a callback function like this
        * otherwise you can't "retrive"/assign photos
        * like so -> _this._photoElements = allPhotos;
        * yay web-dev/js
      */
      _this._appendPhotos([...allPhotos, ..._this._options.images_array]);

    } else {

      console.error(
        `Gallery id: '${_this._options.target}' -> Failed to fetch photos from specified 'path' (photos_directory): '${_this._options.photos_directory}'`
      );

    }
  }

  xhr.send();
}

LB.prototype._errorCheck = function() {
  const errorMessages = [];

  if (!(document.getElementById(this._options.target))) {
    errorMessages.push(
      `Gallery id: '${this._options.target}' -> DOM element with specified id ('target') does not exist`
    );
  }

  if (this._options.photos_scale <= 0) {
    errorMessages.push(
      `Gallery id: '${this._options.target}' -> Option: 'photos_scale' must be greater than 0, provided: ${this._options.photos_scale}`
    );
  }

  if (!(this._options.photos_directory) && this._options.images_array.length === 0) {
    errorMessages.push(
      `Gallery id: '${this._options.target}' -> Both 'photos_directory' and 'images_array' are empty/not specified, could not add photos`
    );
  }

  return errorMessages;
}

LB.prototype._initializeGallery = function() {
  // Error check could be improved
  const errorMessages = this._errorCheck();

  if (errorMessages.length) {
    for (const errorMsg of errorMessages) {
      console.error(errorMsg);
    }

    return;
  }

  if (!(this._options.photos_directory)) // Gallery not specified, no need to try and fetch photos
    this._appendPhotos(this._options.images_array);
  else // Gallery specified
    this._fetchAndAppendPhotosFromDirectory();
}

LB.prototype.changePhotosAndSwapDirectory = function(newDirectory) {
  this._options.photos_directory = newDirectory;
  LButils.clearDOMElement(document.getElementById(this._options.target));

  this._fetchAndAppendPhotosFromDirectory();
}

// Wrapper function
// Feels weird and wrong, but it works ugh...
function LBcreateGallery(initializeOptions) {
  const instance = new LB(initializeOptions);
  instance._initializeGallery();

  return instance;
}