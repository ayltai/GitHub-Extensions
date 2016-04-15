var uniqueId = 1;
var scriptId = 'github-extensions-';
var emojiId  = scriptId + 'emoji-plusone';
var mergeId  = scriptId + 'merge-';
var pageUrl  = $(location).attr('href');
var baseUrl  = window.location.protocol + '//' + window.location.host;

function showApproversSidebar(approvers) {
  $('#' + scriptId + uniqueId).remove();
  
  $(document.createElement('div'))
    .attr('id', scriptId + (uniqueId++))
    .addClass('discussion-sidebar-item sidebar-labels js-discussion-sidebar-item')
    .append($(document.createElement('div'))
      .addClass('select-menu js-menu-container js-select-menu label-select-menu')
      .append($(document.createElement('h3'))
        .addClass('discussion-sidebar-heading')
        .text(approvers.size() + (approvers.size() == 1 ? ' approver' : ' approvers'))
      )
    )
    .append($(document.createElement('div'))
      .addClass('css-truncate')
      .append(createAvatarImgTags(approvers))
    );
    
  $('#partial-discussion-sidebar').prepend(approvers.size() + (approvers.size() == 1 ? ' approver' : ' approvers') + '</h3></div><div class="css-truncate">' + createAvatarImgTags(approvers) + '</div></div>');
}

function createAvatarImgTags(approvers) {
  var approverIcons = createAvatarImgTag(approvers[0]);
  
  for (i = 1; i < approvers.size(); i++) {
    approverIcons.after(createAvatarImgTag(approvers[i]));
  }
  
  return approverIcons;
}

function createAvatarImgTag(approver) {
  return $(document.createElement('a'))
    .attr('href', baseUrl + approver.getUsername())
    .attr('title', approver.getUsername() + ' has approved this pull request ' + approver.getTimestamp())
    .append($(document.createElement('img'))
      .attr('width', '20')
      .attr('height', '20')
      .attr('alt', approver.getUsername())
      .attr('src', approver.getAvatarUrl().substring(0, approver.getAvatarUrl().length - 2) + '40')
      .addClass('avatar')
    );
}

function createReactionButtons() {
  // TODO: Add more emojis
  $('#' + emojiId).remove();
  
  return $(document.createElement('button'))
    .attr('id', emojiId)
    .attr('type', 'button')
    .attr('aria-label', '+1')
    .attr('tabIndex', '-1')
    .attr('data-suffix', ':+1:')
    .addClass('toolbar-item js-toolbar-item tooltipped-n')
    .append($(document.createElement('img'))
      .attr('title', ':+1:')
      .attr('alt', ':+1:')
      .attr('src', 'https://assets-cdn.github.com/images/icons/emoji/unicode/1f44d.png')
      .attr('width', '20')
      .attr('height', '20')
      .attr('align', 'absmiddle')
      .addClass('emoji')
    );
}

function createMergeButton(sibling, prId, prUrl, authToken, headSha, formUtf8, formCommitTitle, formCommitMessage) {
  var button = $('#' + mergeId + prId);
  button.parent().remove();
  
  sibling.after($(document.createElement('div'))
    .addClass('table-list-cell')
    .css('width', '60px')
    .append($(document.createElement('button'))
      .attr('id', mergeId + prId)
      .attr('type', 'button')
      .addClass('btn btn-sm btn-primary js-merge-branch-action')
      .css('vertical-align', 'middle')
      .text('Merge')
    )
  );
  
  button = $('#' + mergeId + prId);
  
  button.click(function() {
    $(this).prop('disabled', true);
    
    requests.push($.post(baseUrl + '/' + prUrl + '/merge', {
      utf8: formUtf8,
      authenticity_token: authToken,
      head_sha: headSha,
      commit_title: formCommitTitle,
      commit_message: formCommitMessage
    }, function(data, status, xhr) {
      if (status === 'success') {
        button.parent().remove();
        
        sibling.after($(document.createElement('div'))
          .addClass('table-list-cell')
          .css('width', '60px')
          .append($(document.createElement('div'))
            .addClass('state state-merged')
            .text('Merged')
          )
        );
      } else {
        button.removeClass('btn-primary');
        button.text('Failed');
      }
    }));
  });
}

function applyHacks() {
  // All pages
  replaceUsernameWithDisplayName($('button.with-gravatar').find('span'));
  
  $('div.news.column').find('div.alert').each(function() {
    replaceUsernameWithDisplayName($(this).find('div.title').find('a').first());
  });
  
  $('a.user-mention').each(function() {
    replaceUsernameWithDisplayName($(this));
  });
  
  $('td.commit-author').each(function() {
    replaceUsernameWithDisplayName($(this).find('span.author'));
    replaceUsernameWithDisplayName($(this).find('a.author'));
  });
  
  // Issue listing or pull request listing page
  if (pageUrl.indexOf('/issues') > -1
  || pageUrl.indexOf('/pulls') > -1) {
    $('.js-issue-row').each(function() {
      var prRow              = $(this);
      var prCreatorContainer = prRow.find('.issue-meta-section.opened-by').find('a');
      var prCreator          = prCreatorContainer.text().trim();
      
      replaceUsernameWithDisplayName(prCreatorContainer, function(profile) {
        prCreatorContainer.after('&nbsp;').after($(document.createElement('a'))
          .attr('href', baseUrl + '/' + profile.getUsername())
          .attr('title', profile.getUsername())
          .append('&nbsp;')
          .append($(document.createElement('img'))
            .attr('width', '20')
            .attr('height', '20')
            .attr('alt', prCreator)
            .attr('src', profile.getAvatarUrl(20))
            .addClass('avatar')
          )
        );
      });
    });
  }
  
  // Pull request
  if (pageUrl.indexOf('/pull/') > -1) {
    var approvers = new Approvers($('.js-discussion'));
    
    if (approvers.size() > 0) {
      showApproversSidebar(approvers);
    }
    
    $('.js-toolbar.toolbar-commenting').prepend(createReactionButtons());
    
    // Replaces usernames with full names
    $('a.author').each(function() {
      replaceUsernameWithDisplayName($(this));
    });
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
      
      requests.push($.get(baseUrl + '/' + prUrl, function(data) {
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
          sibling.after($(document.createElement('div'))
            .css('width', '60px')
            .addClass('table-list-cell')
            .append('&nbsp;')
          );
        }
        
        var approvers = new Approvers($(html));
        
        if (approvers.size() > 0) {
          var approverIcons    = createAvatarImgTags(approvers);
          var thumbsUpIcon     = $(document.createElement('img')).attr('title', ':+1:').attr('alt', ':+1:').attr('src', 'https://assets-cdn.github.com/images/icons/emoji/unicode/1f44d.png').attr('width', '20').attr('height', '20').attr('align', 'absmiddle').addClass('emoji');
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
          
          commentsContainer.prepend($(document.createElement('div'))
            .attr('id', scriptId + (uniqueId++))
            .css('display', 'inline-block')
            .text(approverIcons)
            .append($(document.createElement('a'))
              .attr('href', prUrl)
              .attr('title', linkTitle)
              .addClass('muted-link')
              .append(thumbsUpIcon)
              .append('&nbsp;' + approvers.size())
            )
          )
          .append('&nbsp;&nbsp;');
          
          messageContainer.contents().last().replaceWith('&nbsp;' + (messageCount - approvers.size()));
        }
      }));
    });
  }
}

applyHacks();
