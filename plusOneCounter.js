// Parser for +1 counts, approver names, approver avatars and approval timestamps.
var Approvers = function(element) {
  this.element = element;
  
  var thumbsUpCount = 0;
  var usernames     = [];
  var avatarUrls    = [];
  var timestamps    = [];
  
  this.element.find('.timeline-comment-wrapper.js-comment-container').each(function() {
    var commentWrapper   = $(this);
    var avatarUrl        = commentWrapper.find('img.timeline-comment-avatar').attr('src');
    var commentContainer = commentWrapper.find('.comment.js-comment');
    var username         = commentContainer.find('a.author').text();
    var timestamp        = commentContainer.find('time').text();
    var commentRow       = commentContainer.find('.comment-body.js-comment-body');
    var messageText      = commentRow.text().trim();
    
    if (messageText == '+1'
    || messageText.toLowerCase() == 'lg2m'
    || messageText.toLowerCase() == 'lgtm'
    || commentRow.find('img[title=":+1:"]').length == 1
    || commentRow.find('img[title=":thumbsup:"]').length == 1
    || commentRow.find('g-emoji[alias="+1"]').length == 1) {
      usernames.push(username);
      avatarUrls.push(avatarUrl);
      timestamps.push(timestamp);
      thumbsUpCount++;
    }
  });
  
  this.thumbsUpCount = thumbsUpCount;
  this.usernames     = usernames;
  this.avatarUrls    = avatarUrls;
  this.timestamps    = timestamps;
};

Approvers.prototype.size = function() {
  return this.thumbsUpCount;
};

Approvers.prototype.getUsername = function(i) {
  return this.usernames[i];
};

Approvers.prototype.getAvatarUrl = function(i) {
  return this.avatarUrls[i];
};

Approvers.prototype.getTimestamp = function(i) {
  return this.timestamps[i];
};

var uniqueId = 1;
var scriptId = 'github-extensions-';
var pageUrl  = $(location).attr('href');

// Pull request
if (pageUrl.indexOf('/pull/') > -1) {
  var approvers = new Approvers($('.js-discussion'));
  
  if (approvers.size() > 0) {
    showApproversSidebar(approvers);
  }
}

function showApproversSidebar(approvers) {
  $('#' + scriptId + uniqueId).remove();
  $('#partial-discussion-sidebar').prepend('<div id="' + scriptId + (uniqueId++) + '" class="discussion-sidebar-item sidebar-labels js-discussion-sidebar-item"><div class="select-menu js-menu-container js-select-menu label-select-menu"><h3 class="discussion-sidebar-heading">' + approvers.size() + (approvers.size() == 1 ? ' approver' : ' approvers') + '</h3></div><div class="css-truncate">' + createAvatarImgTags(approvers) + '</div></div>');
}

function createAvatarImgTags(approvers) {
  var approverIcons = '';
  
  for (i = 0; i < approvers.size(); i++) {
    approverIcons += '<a href="https://github.com/' + approvers.getUsername(i) + '" title="' + approvers.getUsername(i) + ' has approved this pull request ' + approvers.getTimestamp(i) + '">';
    approverIcons += '<img class="avatar" width="20" height="20" alt="' + approvers.getUsername(i) + '" src="' + approvers.getAvatarUrl(i).substring(0, approvers.getAvatarUrl(i).length - 2) + '40" />';
    approverIcons += '</a>&nbsp;';
  }
  
  return approverIcons;
}

// Pull request listing
$('.js-issue-row').each(function() {
  var issueRow = $(this);
  var issueUrl = issueRow.find('a.issue-title-link').attr('href');
  
  $.get('https://github.com' + issueUrl, function(data) {
    var html      = $.parseHTML(data);
    var approvers = new Approvers($(html));
    
    var issueTitleContainer = issueRow.find('.table-list-cell.issue-title');
    var commentsContainer   = issueRow.find('.issue-comments');
    
    issueTitleContainer.width('650px');
    commentsContainer.width('170px');
    
    if (approvers.size() > 0) {
      var approverIcons    = createAvatarImgTags(approvers);
      var thumbsUpIcon     = '<img class="emoji" title=":+1:" alt=":+1:" src="https://assets-cdn.github.com/images/icons/emoji/unicode/1f44d.png" height="20" width="20" align="absmiddle">';
      var linkTitle        = '';
      var messageContainer = commentsContainer.find('.muted-link');
      var messageCount     = messageContainer.text();
      
      for (i = 0; i < approvers.size(); i++) {
        if (i === 0) {
          linkTitle = approvers.getUsername(0);
        } else {
          linkTitle += ', ' + approvers.getUsername(i);
        }
      }
      
      linkTitle += (approvers.size() == 1 ? ' has' : ' have') + ' approved this pull request';
      
      $('#' + scriptId + uniqueId).remove();
      commentsContainer.prepend('<div id="' + scriptId + (uniqueId++) + '" style="display: inline-block;">' + approverIcons + '<a href="' + issueUrl + '" class="muted-link" title="' + linkTitle + '">' + thumbsUpIcon + '&nbsp;' + approvers.size() + '</a></div>&nbsp;&nbsp;');
      messageContainer.contents().last().replaceWith('&nbsp;' + (messageCount - approvers.size()));
    }
  });
});
