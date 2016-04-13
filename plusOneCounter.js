$('.js-issue-row').each(function() {
  var issueRow = $(this);
  var issueUrl = issueRow.find('a.issue-title-link').attr('href');
  
  $.get('https://github.com' + issueUrl, function(data) {
    var thumbsUpCount = 0;
    var html          = $.parseHTML(data);
    
    $(html).find('.comment-body.js-comment-body').each(function() {
      var commentRow  = $(this);
      var messageText = commentRow.text().trim();
      
      if (messageText == '+1'
      || messageText == 'lg2m'
      || commentRow.find('img[title=":+1:"]').length == 1
      || commentRow.find('img[title=":thumbsup:"]').length == 1) {
        thumbsUpCount++;
      }
    });
    
    if (thumbsUpCount > 0) {
      var thumbsUpIcon      = '<img class="emoji" title=":+1:" alt=":+1:" src="https://assets-cdn.github.com/images/icons/emoji/unicode/1f44d.png" height="20" width="20" align="absmiddle">';
      var commentsContainer = issueRow.find('.issue-comments');
      var messageContainer  = commentsContainer.find('.muted-link');
      var messageCount      = messageContainer.text();
      
      commentsContainer.width("80px");
      commentsContainer.prepend('<a href="' + issueUrl + '" class="muted-link">' + thumbsUpIcon + '&nbsp;' + thumbsUpCount + '</a>&nbsp;&nbsp;');
      messageContainer.contents().last().replaceWith('&nbsp;' + (messageCount - thumbsUpCount));
    }
  });
});
