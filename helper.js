var requests = [];

function abortRequests() {
  $(requests).each(function(i, xhr) {
    xhr.abort();
  });
  
  requests = [];
}

function convertAjaxToPageLoad(element) {
  element.click(function() {
    window.location.href = baseUrl + '/' + element.attr('href');
  });
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