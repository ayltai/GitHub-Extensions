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

function createReactionButtons() {
  // TODO: Add more emojis
  $('#' + emojiId).remove();
  return '<button id="' + emojiId + '" type="button" class="toolbar-item js-toolbar-item tooltipped-n" aria-label="+1" tabIndex="-1" data-suffix=":+1:"><img class="emoji" title=":+1:" alt=":+1:" src="https://assets-cdn.github.com/images/icons/emoji/unicode/1f44d.png" height="20" width="20" align="absmiddle" /></button>';
}

function createMergeButton(sibling, prId, prUrl, authToken, headSha, formUtf8, formCommitTitle, formCommitMessage) {
  var button = $('#' + mergeId + prId);
  button.parent().remove();
  
  sibling.after('<div class="table-list-cell" style="width: 60px;"><button id="' + mergeId + prId + '" class="btn btn-sm btn-primary js-merge-branch-action" type="button" style="vertical-align: middle;">Merge</button></div>');
  button = $('#' + mergeId + prId);
  
  button.click(function() {
    $(this).prop('disabled', true);
    
    $.post('https://github.com' + prUrl + '/merge', {
      utf8: formUtf8,
      authenticity_token: authToken,
      head_sha: headSha,
      commit_title: formCommitTitle,
      commit_message: formCommitMessage
    }, function(data, status, xhr) {
      if (status === 'success') {
        button.parent().remove();
        sibling.after('<div class="table-list-cell" style="width: 60px;"><div class="state state-merged">Merged</div></div>');
      } else {
        button.removeClass('btn-primary');
        button.text('Failed');
      }
    });
  });
}

var uniqueId = 1;
var scriptId = 'github-extensions-';
var emojiId  = scriptId + 'emoji-plusone';
var mergeId  = scriptId + 'merge-';
var pageUrl  = $(location).attr('href');

// Pull request
if (pageUrl.indexOf('/pull/') > -1) {
  var approvers = new Approvers($('.js-discussion'));
  
  if (approvers.size() > 0) {
    showApproversSidebar(approvers);
  }
  
  $('.js-toolbar.toolbar-commenting').prepend(createReactionButtons());
}

// Pull request listing
if (pageUrl.indexOf('/pulls') > -1) {
  $('.js-issue-row').each(function() {
    var prRow             = $(this);
    var prId              = prRow.attr('id');
    var prUrl             = prRow.find('a.issue-title-link').attr('href');
    var prTitleContainer  = prRow.find('.table-list-cell.issue-title');
    var commentsContainer = prRow.find('.issue-comments');
    
    prTitleContainer.width('580px');
    commentsContainer.width('180px');
    
    $.get('https://github.com' + prUrl, function(data) {
      var html          = $.parseHTML(data);
      var buildStatuses = $(html).find('a.build-status-details');
      
      // Links commit build status to CI build details page
      if (buildStatuses.length > 0) {
        var buildStatusUrl = buildStatuses.first().attr('href');
        
        if (buildStatusUrl) {
          var commitBuildStatuses = prRow.find('.commit-build-statuses');
          
          if (commitBuildStatuses.length > 0) {
            commitBuildStatuses.first().find('a.tooltipped.tooltipped-e').attr('href', buildStatusUrl);
          }
        }
      }
      
      var authToken         = $(html).find('input[name="authenticity_token"]').val();
      var headSha           = $(html).find('input[name="head_sha"]').val();
      var formUtf8          = $(html).find('input[name="utf8"]').val();
      var formCommitTitle   = $(html).find('input[name="commit_title"]').val();
      var formCommitMessage = $(html).find('textarea[name="commit_message"]').val();
      var sibling           = prRow.find('div.table-list-cell.table-list-cell-avatar');
      
      // Shows merge button
      if ($(html).find('div.state.state-open').length > 0
      && $(html).find('button.js-merge-branch-action').length > 0) {
        createMergeButton(sibling, prId, prUrl, authToken, headSha, formUtf8, formCommitTitle, formCommitMessage);
      } else {
        sibling.after('<div class="table-list-cell" style="width: 60px;">&nbsp;</div>');
      }
      
      var approvers = new Approvers($(html));
      
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
        
        commentsContainer.prepend('<div id="' + scriptId + (uniqueId++) + '" style="display: inline-block;">' + approverIcons + '<a href="' + prUrl + '" class="muted-link" title="' + linkTitle + '">' + thumbsUpIcon + '&nbsp;' + approvers.size() + '</a></div>&nbsp;&nbsp;');
        messageContainer.contents().last().replaceWith('&nbsp;' + (messageCount - approvers.size()));
      }
    });
  });
}
