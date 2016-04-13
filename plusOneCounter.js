$('.js-issue-row').each(function() {
  var issueRow = $(this);
  var issueUrl = issueRow.find('a.issue-title-link').attr('href');
  
  $.get('https://github.com' + issueUrl, function(data) {
    var thumbsUpCount = 0;
    var usernames     = [];
    var html          = $.parseHTML(data);
    
    $(html).find('.comment.js-comment').each(function() {
      var commentContainer = $(this);
      var username         = commentContainer.find('a.author').text();
      
      commentContainer.find('.comment-body.js-comment-body').each(function() {
        var commentRow  = $(this);
        var messageText = commentRow.text().trim();
        
        if (messageText == '+1'
        || messageText == 'lg2m'
        || commentRow.find('img[title=":+1:"]').length == 1
        || commentRow.find('img[title=":thumbsup:"]').length == 1) {
          usernames.push(username);
          thumbsUpCount++;
        }
      });
    });
    
    var issueTitleContainer = issueRow.find('.table-list-cell.issue-title');
    var commentsContainer   = issueRow.find('.issue-comments');
    
    issueTitleContainer.width('720px');
    commentsContainer.width('80px');
    
    if (thumbsUpCount > 0) {
      var thumbsUpIcon     = '<img class="emoji" title=":+1:" alt=":+1:" src="https://assets-cdn.github.com/images/icons/emoji/unicode/1f44d.png" height="20" width="20" align="absmiddle">';
      var linkTitle        = '';
      var messageContainer = commentsContainer.find('.muted-link');
      var messageCount     = messageContainer.text();
      
      for (var i = 0; i < usernames.length; i++) {
        if (i === 0) {
          linkTitle = usernames[0];
        } else {
          linkTitle += ', ' + usernames[i];
        }
      }
      
      linkTitle += (usernames.length == 1 ? ' has' : ' have') + ' approved this pull request';
      
      commentsContainer.prepend('<a href="' + issueUrl + '" class="muted-link" title="' + linkTitle + '">' + thumbsUpIcon + '&nbsp;' + thumbsUpCount + '</a>&nbsp;&nbsp;');
      messageContainer.contents().last().replaceWith('&nbsp;' + (messageCount - thumbsUpCount));
    }
  });
});
