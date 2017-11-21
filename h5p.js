var H5P = H5P || {};

H5P.KekuleReaction = (function ($) {
  function C(options, id) {
    this.$ = $(this);
    this.options = $.extend(true, {}, {}, options);
    this.id = id;
    this.applet = undefined;
    this.data = h5p_get_data_obj(this.options.data);
  };
 
  C.prototype.attach = function ($container) {
    var el = build("div", "kekule_reaction_wrapper");
    $container.append(el);
    var el_applet_container = build("div", undefined, el);
    el_applet_container.id = random_string();

    this.applet = new kekule_reaction_exercise(el_applet_container, "viewer");
    //try {
      this.applet.data = this.data.data;
    //} catch(ex) {}
  };
 
  return C;
})(H5P.jQuery);