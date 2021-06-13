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

  clearDOMElement: function(element) {
    while(element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },

  createLightboxComponent: function(element, onclose = null) {
    const controlPanel = this.createTag("div", "lightbox-controlLB")
      .LBchildren(
        this.createTag("span", "lightbox-buttonLB")
          .LBhtml("&times;")
          .LBclick(this._closeLightboxComponent.bind(this, onclose))
      );

    // Append everything
    document.body.appendChild(
      this.createTag("div", "lightboxLB")
        .LBclick(this._closeLightboxComponent.bind(this, onclose))
    );
    
    document.body.appendChild(
      this.createTag("div", "lightbox-containerLB")
        .LBchildren(controlPanel, element)
    );
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
  this._currentIndex = 0;
  this._events = [];
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

LB.prototype._nextPhoto = function() {
  this._currentIndex = this._currentIndex >= this._options.images_array.length - 1 ? this._options.images_array.length - 1 : this._currentIndex + 1;
  this._dynamicallyAddClass();

  document.querySelector(".lightbox-photo-enlargedLB").src = this._options.images_array[this._currentIndex].src;
}

LB.prototype._prevPhoto = function() {
  this._currentIndex = this._currentIndex <= 0 ? 0 : this._currentIndex - 1;
  this._dynamicallyAddClass();

  document.querySelector(".lightbox-photo-enlargedLB").src = this._options.images_array[this._currentIndex].src;
}

LB.prototype._onLighboxPhotoResize = function() {
  document.querySelector(".lightbox-photo-enlargedLB").style.cssText = `
    max-width: ${window.innerWidth * this._options.photos_scale}px; 
    max-height: ${window.innerHeight * this._options.photos_scale}px;
  `;
}

LB.prototype._onKeyboardEvent = function(e) {
  switch(e.key) {
    case "ArrowRight":
      this._nextPhoto();
      break;
    case "ArrowLeft":
      this._prevPhoto(); 
      break;
    case "Escape":
      LButils._closeLightboxComponent(this._cleanEvents.bind(this));
      break;
  }
}

LB.prototype._handleAppendClick = function(photo) {
  this._currentIndex = this._options.images_array.findIndex(element => element.src === photo.src);
  this._createEnlargedPhotoElement(photo);
  this._appendEnlargedPhotoListeners();
  this._dynamicallyAddClass();
}

LB.prototype._appendEnlargedPhotoListeners = function() {
  this._events.push({ type: "resize", func: (this._onLighboxPhotoResize).bind(this) });
  this._events.push({ type: "keyup", func: (this._onKeyboardEvent).bind(this) });

  for (const event of this._events) {
    window.addEventListener(event.type, event.func);
  }
}

LB.prototype._cleanEvents = function() {
  for (const event of this._events) {
    window.removeEventListener(event.type, event.func);
  }

  this._events = [];
}

LB.prototype._dynamicallyAddClass = function() {
  switch(this._currentIndex) {
    case this._options.images_array.length - 1:
      document.querySelector(".nextLB").classList.add("lightbox-swap-inactiveLB");
      document.querySelector(".prevLB").classList.remove("lightbox-swap-inactiveLB");
      break;
    case 0: 
      document.querySelector(".nextLB").classList.remove("lightbox-swap-inactiveLB");
      document.querySelector(".prevLB").classList.add("lightbox-swap-inactiveLB");
      break;
    default:
      document.querySelector(".nextLB").classList.remove("lightbox-swap-inactiveLB");
      document.querySelector(".prevLB").classList.remove("lightbox-swap-inactiveLB");
  }
}

LB.prototype._createEnlargedPhotoElement = function(photo) {
  const lightboxPhoto = LButils.createTag("img", "lightbox-photo-enlargedLB")
    .LBatt({ "src": photo.src, "alt": `large_${photo.alt}` })
    .LBstyle(
      // Scale images so that they don't cover the entire screen if they are too big
      `max-width: ${window.innerWidth * this._options.photos_scale}px; 
      max-height: ${window.innerHeight * this._options.photos_scale}px;`
    );

  const prevBtn = LButils.createTag("span", "lightbox-buttonLB lightbox-swapLB prevLB").LBhtml("&lt;").LBclick(this._prevPhoto.bind(this));
  const nextBtn = LButils.createTag("span", "lightbox-buttonLB lightbox-swapLB nextLB").LBhtml("&gt;").LBclick(this._nextPhoto.bind(this));
  const swapPanel = LButils.createTag("div", "lightbox-controlLB").LBchildren(prevBtn, nextBtn);

  LButils.createLightboxComponent(LButils.createTag("div").LBchildren(lightboxPhoto, swapPanel), this._cleanEvents.bind(this));
}

LB.prototype._appendPhotos = function() {
  const target = document.getElementById(this._options.target);
  const fragment = document.createDocumentFragment();

  for (const photo of this._options.images_array) {
    const img = LButils.createTag("img", "lightbox-photoLB")
      .LBatt({ "src": photo.src, "alt": photo.alt })
      .LBclick(this._handleAppendClick.bind(this, photo));

    fragment.appendChild(img);
  }

  target.appendChild(fragment);
}

LB.prototype._initializeGallery = function() {
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
