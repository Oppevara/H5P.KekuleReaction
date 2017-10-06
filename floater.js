

var drag_handler = function(el, callback) {
	this.last_x = 0;
	this.last_y = 0;

	this.callback = function(dx, dy) {};

	this.handle_drag = function(e) {
		var dx = e.clientX - this.last_x;
		var dy = e.clientY - this.last_y;
		this.last_x = e.clientX;
		this.last_y = e.clientY;
		this.callback(dx, dy);
	}.bind(this);

	this.handle_up = function(e) {
		document.removeEventListener("mousemove", this.handle_drag);
		document.removeEventListener("mouseup", this.handle_up);
	}.bind(this);

	this.handle_down = function(e) {
		this.last_x = e.clientX;
		this.last_y = e.clientY;
		document.addEventListener("mousemove", this.handle_drag);
		document.addEventListener("mouseup", this.handle_up);
	}.bind(this);

	el.addEventListener("mousedown", this.handle_down);

	if (callback !== undefined) this.callback = callback;
}

var floater = function(content_, title_, x_, y_, width_, height_) {
	this.el = build("div", "floater", document.body);
	this.el.style.transform = "translate(0, 0)";

	this.title_bar = build("div", "title_bar", this.el);
	this.content_container = build("div", "content", this.el);
	this.button_bar = build("div", "button_bar", this.el);
	this.resize_thumb = build("div", "resize_thumb", this.button_bar);

	Object.defineProperty(this, "x", {
		"get" : function() {
			return parseFloat(this.el.style.transform.split(",")[0].replace(/[^\d.-]/g, ''));
		},
		"set" : function(v) {
			this.el.style.transform = "translate(" + v + "px, " + this.y + "px)";
		}
	});

	Object.defineProperty(this, "y", {
		"get" : function() {
			return parseFloat(this.el.style.transform.split(",")[1].replace(/[^\d.-]/g, ''));
		},
		"set" : function(v) {
			this.el.style.transform = "translate(" + this.x + "px, " + v + "px)";
		}
	});

	Object.defineProperty(this, "width", {
		"get" : function() {
			return this.el.getBoundingClientRect().width;
		},
		"set" : function(v) {
			this.el.style.width = v + "px";
		}
	});

	Object.defineProperty(this, "height", {
		"get" : function() {
			return this.el.getBoundingClientRect().height;
		},
		"set" : function(v) {
			this.el.style.height = v + "px";
		}
	});

	Object.defineProperty(this, "title", {
		"get" : function() {
			return this.title_bar.innerHTML;
		},
		"set" : function(v) {
			this.title_bar.innerHTML = v;
		}
	});

	Object.defineProperty(this, "content", {
		"get" : function() {
			if (this.content_container.children.length == 0) return undefined;
			return this.content_container.children[0];
		},
		"set" : function(el) {
			if (this.content !== undefined) this.content_container.removeChild(this.content);
			if (el !== undefined) {
				this.content_container.appendChild(el);
			}
		}
	});

	this.remove = function() {
		this.el.parentElement.removeChild(this.el);
	}.bind(this);

	this.add_button = function(title, callback) {
		var button = build("div", "button", this.button_bar, title);
		button.addEventListener("click", callback);
	}.bind(this);

	this.width = width_ || 400;
	this.height = height_ || 300;
	this.x = x_ || (screen.width / 2 - this.width / 2);
	this.y = y_ || (screen.height / 2 - this.height / 2);
	this.title = title_ || "";
	this.content = content_;

	var move_handler_obj = new drag_handler(this.title_bar, function(dx, dy) {
		this.x = Math.max(0, this.x + dx);
		this.y = Math.max(0, this.y + dy);
	}.bind(this));

	var resize_handler_obj = new drag_handler(this.resize_thumb, function(dx, dy) {
		var new_width = this.width + dx;
		var new_height = this.height + dy;
		this.width = new_width;
		this.height = new_height;
		this.on_resize(new_width, new_height);
	}.bind(this));

	this.on_resize = function(new_width, new_height) {};

}