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

    if (onclose && typeof(onclose) === "function") 
      onclose();
  }
};
//=========================

const LBdefaults = {
  target: "gallery",
  photos_scale: 0.75,
  images_array: [],
};

function LB(initializeOptions = {}) {
  this._options = Object.assign({}, LBdefaults, initializeOptions);
  this._onResizeEvent = null;
  this._currentIndex = 0;
}

LB.prototype._onLighboxPhotoResize = function(lightboxPhoto) {
  lightboxPhoto.style.cssText = `
    max-width: ${window.innerWidth * this._options.photos_scale}px; 
    max-height: ${window.innerHeight * this._options.photos_scale}px;
  `;
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

  if (this._options.images_array.length === 0) {
    errorMessages.push(
      `Gallery id: '${this._options.target}' -> Array: 'images_array' is empty, could not add photos`
    );
  }

  return errorMessages;
}

LB.prototype._createEnlargedPhotoElement = function(from) {
  const lightboxPhoto = LButils.createTag("img", "lightbox-photo-enlargedLB")
    .LBatt({ "src": from.src, "alt": `large_${from.alt}` })
    .LBstyle(
      // Scale images so that they don't cover the entire screen if they are too big
      `max-width: ${window.innerWidth * this._options.photos_scale}px; 
      max-height: ${window.innerHeight * this._options.photos_scale}px;`
    );
    
  const swapPanel = LButils.createTag("div", "lightbox-controlLB")
    .LBchildren(
      LButils.createTag("span", "lightbox-buttonLB lightbox-swapLB").LBhtml("&lt;").LBclick(() => {
        this._currentIndex = this._currentIndex <= 0 ? 0 : this._currentIndex - 1;
        lightboxPhoto.src = this._options.images_array[this._currentIndex].src;
      }),

      LButils.createTag("span", "lightbox-buttonLB lightbox-swapLB").LBhtml("&gt;").LBclick(() => {
        this._currentIndex = this._currentIndex >= this._options.images_array.length - 1 ? this._options.images_array.length - 1 : this._currentIndex + 1;
        lightboxPhoto.src = this._options.images_array[this._currentIndex].src;
      }),
    );
  
  // Responsive images
  this._onResizeEvent = (this._onLighboxPhotoResize).bind(this, lightboxPhoto);
  window.addEventListener("resize", this._onResizeEvent);

  return LButils.createTag("div").LBchildren(lightboxPhoto, swapPanel);
}

LB.prototype._appendPhotos = function() {
  const target = document.getElementById(this._options.target);
  const fragment = document.createDocumentFragment();

  const callback = () => {
    window.removeEventListener("resize", this._onResizeEvent);
    this._onResizeEvent = null;
  }

  for (const photo of this._options.images_array) {
    const img = LButils.createTag("img", "lightbox-photoLB")
      .LBatt({ "src": photo.src, "alt": photo.alt })
      .LBclick(() => {
        this._currentIndex = this._options.images_array.findIndex(element => element.src === photo.src);
        LButils.createLightboxComponent(this._createEnlargedPhotoElement(photo), callback);
      });

    fragment.appendChild(img);
  }

  target.appendChild(fragment);
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

  this._appendPhotos();
}

LB.prototype.changePhotos = function(newPhotos) {
  // Check if two arrays containing objects are the same...
  if (JSON.stringify(this._options.images_array) === JSON.stringify(newPhotos))
    return;

  this._options.images_array = newPhotos;
  LButils.clearDOMElement(document.getElementById(this._options.target));
  
  this._appendPhotos();
}

// Wrapper function
// Feels weird and wrong, but it works ugh...
function LBcreateGallery(initializeOptions) {
  const instance = new LB(initializeOptions);
  instance._initializeGallery();

  return instance;
}