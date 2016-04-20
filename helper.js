var requests = [];

function abortRequests() {
  $(requests).each(function(i, xhr) {
    xhr.abort();
  });
  
  requests = [];
}

function convertAjaxToPageLoad(element) {
  if (element) {
    element.click(function() {
      window.location.href = baseUrl + '/' + element.attr('href');
    });
  }
}

$(window).on('beforeunload', function() {
  abortRequests();
});

$('nav.reponav').find('a.reponav-item').each(function() {
  var navItem = $(this);
  convertAjaxToPageLoad(navItem);
});

$('a.btn-link').each(function() {
  var button = $(this);
  convertAjaxToPageLoad(button);
});

$('a.select-menu-item.js-navigation-item').each(function() {
  var navItem = $(this);
  
  if (navItem.attr('href').length > 0) {
    convertAjaxToPageLoad(navItem);
  }
});

convertAjaxToPageLoad($('a.issues-reset-query'));
