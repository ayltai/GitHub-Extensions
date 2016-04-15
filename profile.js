// Parser for user profile
var Profile = function(element) {
  this.element = element;
  
  var avatarUrl   = '';
  var userId      = '';
  var username    = '';
  var displayName = '';
  
  avatarUrl   = this.element.find('a.vcard-avatar').find('img.avatar').attr('src');
  avatarUrl   = avatarUrl.substring(0, avatarUrl.length - 3);
  userId      = avatarUrl.substring(avatarUrl.indexOf('/u/') + 3, avatarUrl.indexOf('?v='));
  username    = this.element.find('div.vcard-username').text();
  displayName = this.element.find('div.vcard-fullname').text();
  
  this.avatarUrl   = avatarUrl;
  this.userId      = userId;
  this.username    = username;
  this.displayName = displayName;
};

Profile.prototype.getAvatarUrl = function(size) {
  return this.avatarUrl + (size * 2);
};

Profile.prototype.getUserId = function() {
  return this.userId;
};

Profile.prototype.getUsername = function() {
  return this.username;
};

Profile.prototype.getDisplayName = function() {
  return this.displayName;
};
