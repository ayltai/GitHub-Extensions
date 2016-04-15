// Username-Profile mapping
var profiles = {};

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
  this.displayName = displayName.length === 0 ? username : displayName;
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

function replaceUsernameWithDisplayName(container, callback) {
  if (container) {
    var username = container.text().trim();
    
    if (profiles[username]) {
      container.text(profiles[username].getDisplayName());
    } else {
      $.get('https://github.com/' + username, function(data) {
        var html    = $.parseHTML(data);
        var profile = new Profile($(html));
        
        container.text(profile.getDisplayName());
        
        profiles[username] = profile;
        
        if (callback) {
          callback(profile);
        }
      });
    }
  }
}
