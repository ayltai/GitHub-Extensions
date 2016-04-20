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
    var timestamp        = commentContainer.find('time').length > 0 ? commentContainer.find('time').text() : commentContainer.find('relative-time').text();
    var commentRow       = commentContainer.find('.comment-body.js-comment-body');
    var messageText      = commentRow.text().trim();
    
    if (messageText === '+1'
    || messageText.toLowerCase() === 'lg2m'
    || messageText.toLowerCase() === 'lgtm'
    || commentRow.find('img[title=":+1:"]').length === 1
    || commentRow.find('img[title=":thumbsup:"]').length === 1
    || commentRow.find('g-emoji[alias="+1"]').length === 1) {
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
