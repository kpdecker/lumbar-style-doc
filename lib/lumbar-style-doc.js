var _ = require('underscore'),
    styleDoc = require('./style-doc');

var resourceDir = require('path').resolve(__dirname + '/../resources/');

function fileList(context, callback) {
  var sheets = [],
      loadPrefix = context.config.loadPrefix();

  if (loadPrefix) {
    loadPrefix += context.platformPath;
  }

  context.plugins.get('module-map').buildMap(context, function(err, map) {
    if (err) {
      return callback(err);
    }

    var css = _.pluck(map.modules, 'css');
    if (map.base && map.base.css) {
      css.unshift(map.base.css);
    }

    css = _.flatten(css, true);
    _.each(css, function(css) {
      if (!css) {
        return;
      }

      var media = [[], [], []];
      if (css.minRatio) {
        _.each(['min--moz-device-pixel-ratio', '-webkit-min-device-pixel-ratio', 'min-device-pixel-ratio'], function(name, index) {
          media[index].push(name + ': ' + css.minRatio);
        })
      }
      if (css.maxRatio) {
        _.each(['max--moz-device-pixel-ratio', '-webkit-max-device-pixel-ratio', 'max-device-pixel-ratio'], function(name, index) {
          media[index].push(name + ': ' + css.maxRatio);
        })
      }
      if (media[0].length) {
        media = 'only screen and (' + _.map(media, function(engine) { return engine.join(' and '); }).join('), only screen and (') + ')';
      } else {
        media = undefined;
      }

      sheets.push({href: loadPrefix + css.href, media: media});
    });

    callback(err, {
      sheets: sheets,
      scripts: [map.modules[context.module.name].js]
    });
  });
}

module.exports = {
  priority: 50,

  moduleResources: function(context, next, complete) {
    next(function(err, moduleResources) {
      if (context.module['style-doc']) {
        var styleDoc = context.module['style-doc'];
        moduleResources = moduleResources || [];

        if (context.mode === 'static') {
          var staticList = context.static = context.static || [];

          styleDoc['style-doc'] = true;
          moduleResources.push(styleDoc);
        } else if (context.mode === 'scripts') {
          moduleResources.unshift({src: resourceDir + '/style-doc.js', global: true});
          moduleResources.unshift({src: resourceDir + '/handlebars.js', global: true});
          moduleResources.unshift({src: resourceDir + '/zepto.js', global: true});
        } else if (context.mode === 'styles') {
          moduleResources.push(resourceDir + '/highlight.css');
          moduleResources.push(resourceDir + '/style-doc.styl');
        }
      }
      complete(err, moduleResources);
    });
  },

  resource: function(context, next, complete) {
    if (context.resource['style-doc'] === true) {
      next(function(err, resource) {
        function generator(context, callback) {
          context.loadResource(resource, function(err, fileInfo) {
            if (err) {
              return callback(err);
            }

            fileList(context, function(err, options) {
              callback(err, {
                data: styleDoc(fileInfo.content.toString(), options)
              });
            });
          });
        };

        // Include any attributes that may have been defined on the base entry
        if (!_.isString(resource)) {
          _.extend(generator, resource);
        }
        generator.sourceFile = resource.src || resource;
        complete(undefined, generator);
      });
    } else {
      next(complete);
    }
  }
};
