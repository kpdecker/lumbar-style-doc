var _ = require('underscore'),
    styleDoc = require('./style-doc');

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

    callback(err, sheets);
  });
}

module.exports = {
  mode: 'static',
  priority: 50,

  resource: function(context, next, complete) {
    if (context.resource['style-doc'] === true) {
      next(function(err, resource) {
        function generator(context, callback) {
          context.loadResource(resource, function(err, fileInfo) {
            if (err) {
              return callback(err);
            }

            fileList(context, function(err, sheets) {
              callback(err, {
                data: styleDoc(fileInfo.content.toString(), {sheets: sheets})
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
