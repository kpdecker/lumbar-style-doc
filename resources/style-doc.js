Handlebars.templates = Handlebars.templates || {};
window.context = {};

Handlebars.registerHelper('template', function(name, options) {
  var data = options.hash || {};
  for (var propName in this) {
    if (this.hasOwnProperty(propName) && !(propName in data)) {
      data[propName] = this[propName];
    }
  }

  data.yield = function() {
    return options.fn && options.fn(data);
  };

  var template = Handlebars.templates[name];
  if (!template) {
    throw new Error('Unable to find template ' + name);
  } else {
    return new Handlebars.SafeString(template(data));
  }
});

$(document).ready(function() {
  $('body > section').addClass('doc-tabbed');

  var tabs = $('[data-tab]').bind('click', function(event) {
      $('.doc-active').removeClass('doc-active');
      $(event.currentTarget.getAttribute('data-tab')).addClass('doc-active');
      $(event.currentTarget).addClass('doc-active');

      location.hash = event.currentTarget.getAttribute('data-text');
    })
    .each(function() {
      this.setAttribute('data-text', this.innerText);
    });

  function updateTab() {
    var hash = location.hash.replace(/^#/, '');
    if (!hash) {
      tabs.trigger('click');
    } else {
      $('[data-text="' + hash + '"]').trigger('click');
    }
  }

  updateTab();
  $(window).bind('hashchange', updateTab);
});
