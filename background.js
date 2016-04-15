function executeScripts(tabId, scripts) {
  function createCallback(tabId, script, callback) {
    return function() {
      chrome.tabs.executeScript(tabId, script, callback);
    };
  }
  
  var callback = null;
  
  for (var i = scripts.length - 1; i >= 0; --i) {
    callback= createCallback(tabId, scripts[i], callback);
  }
  
  if (callback !== null) {
    callback();
  }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.storage.sync.get({
    repo_url: '9gag'
  }, function(items) {
    if (items.repo_url.length > 0
    && tab.url.indexOf(items.repo_url + '/') > -1
    && (tab.url.indexOf('/pulls') > -1 || tab.url.indexOf('/pull/') > -1)
    && changeInfo
    && changeInfo.status == 'loading') {
      executeScripts(tabId, [
        {
          file: 'jquery-2.2.2.min.js',
          runAt: 'document_end'
        },
        {
          file: 'approvers.js',
          runAt: 'document_end'
        },
        {
          file: 'profile.js',
          runAt: 'document_end'
        },
        {
          file: 'github-extensions.js',
          runAt: 'document_end'
        }
      ]);
    }
  });
});