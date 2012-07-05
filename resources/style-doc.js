$(document).ready(function() {
  $('body > section').addClass('doc-tabbed');

  $('[data-tab]').bind('click', function(event) {
      $('.doc-active').removeClass('doc-active');
      $(event.currentTarget.getAttribute('data-tab')).addClass('doc-active');
      $(event.currentTarget).addClass('doc-active');
    })
    .first()
    .trigger('click');
});
