$('.js-issue-row').each(function() {
  var issueRow = $(this);
  var issueUrl = issueRow.find('a.issue-title-link').attr('href');
  
  $.get('https://github.com' + issueUrl, function(data) {
    var thumbsUpCount = 0;
    var usernames     = [];
    var avatarUrls    = [];
    var timestamps    = [];
    var html          = $.parseHTML(data);
    
    $(html).find('.timeline-comment-wrapper.js-comment-container').each(function() {
      var commentWrapper   = $(this);
      var avatarUrl        = commentWrapper.find('img.timeline-comment-avatar').attr('src');
      var commentContainer = commentWrapper.find('.comment.js-comment');
      var username         = commentContainer.find('a.author').text();
      var timestamp        = commentContainer.find('time').text();
      var commentRow       = commentContainer.find('.comment-body.js-comment-body');
      var messageText      = commentRow.text().trim();
      
      if (messageText == '+1'
      || messageText == 'lg2m'
      || commentRow.find('img[title=":+1:"]').length == 1
      || commentRow.find('img[title=":thumbsup:"]').length == 1
      || commentRow.find('g-emoji[alias="+1"]').length == 1) {
        usernames.push(username);
        avatarUrls.push(avatarUrl);
        timestamps.push(timestamp);
        thumbsUpCount++;
      }
    });
    
    var issueTitleContainer = issueRow.find('.table-list-cell.issue-title');
    var commentsContainer   = issueRow.find('.issue-comments');
    
    issueTitleContainer.width('695px');
    commentsContainer.width('125px');
    
    if (thumbsUpCount > 0) {
      var approverIcons    = '';
      var thumbsUpIcon     = '<img class="emoji" title=":+1:" alt=":+1:" src="https://assets-cdn.github.com/images/icons/emoji/unicode/1f44d.png" height="20" width="20" align="absmiddle">';
      var linkTitle        = '';
      var messageContainer = commentsContainer.find('.muted-link');
      var messageCount     = messageContainer.text();
      
      for (i = 0; i < avatarUrls.length; i++) {
        approverIcons += '<a href="https://github.com/' + usernames[i] + '" title="' + usernames[i] + ' has approved this pull request ' + timestamps[i] + '">';
        approverIcons += '<img class="avatar" width="20" height="20" alt="' + usernames[i] + '" src="' + avatarUrls[i].substring(0, avatarUrls[i].length - 2) + '40" />';
        approverIcons += '</a>&nbsp;';
      }
      
      for (i = 0; i < usernames.length; i++) {
        if (i === 0) {
          linkTitle = usernames[0];
        } else {
          linkTitle += ', ' + usernames[i];
        }
      }
      
      linkTitle += (usernames.length == 1 ? ' has' : ' have') + ' approved this pull request';
      
      commentsContainer.prepend(approverIcons + '<a href="' + issueUrl + '" class="muted-link" title="' + linkTitle + '">' + thumbsUpIcon + '&nbsp;' + thumbsUpCount + '</a>&nbsp;&nbsp;');
      messageContainer.contents().last().replaceWith('&nbsp;' + (messageCount - thumbsUpCount));
    }
  });
});
