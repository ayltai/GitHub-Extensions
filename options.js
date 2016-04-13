var defaultGitHub   = '9gag';
var messageDuration = 1000;

function saveOptions() {
  var repoUrl = document.getElementById('repo_url').value;
  
  if (repoUrl.length === 0) {
    var error = document.getElementById('error');
    error.textContent = 'Empty string is not supported';
    
    setTimeout(function() {
      error.textContent = '';
      
      loadOptions();
    }, messageDuration);
  } else {
    chrome.storage.sync.set({
      repo_url: repoUrl
    }, function() {
      var status = document.getElementById('status');
      status.textContent = 'Options saved';
      
      setTimeout(function() {
        status.textContent = '';
      }, messageDuration);
    });
  }
}

function loadOptions() {
  chrome.storage.sync.get({
    repo_url: defaultGitHub
  }, function(items) {
    document.getElementById('repo_url').value = items.repo_url;
  });
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);