var _ = require('underscore'),
    styleDoc = require('./style-doc');

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

            callback(err, {
              data: styleDoc(fileInfo.content.toString())
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
