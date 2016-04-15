var requests = [];

function abortRequests() {
  $(requests).each(function(i, xhr) {
    xhr.abort();
  });
  
  requests = [];
}

$(window).on('beforeunload', function() {
  abortRequests();
});

$('nav.reponav').find('a.reponav-item').each(function() {
  var navItem = $(this);
  
  navItem.click(function() {
    window.location.href = baseUrl + '/' + navItem.attr('href');
  });
});
