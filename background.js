function executeScripts(tabId, scripts) {
  function createCallback(tabId, script, callback) {
    return function() {
      chrome.tabs.executeScript(tabId, script, callback);
    };
  }
  
  var callback = null;
  
  for (var i = scripts.length - 1; i >= 0; --i) {
    callback = createCallback(tabId, scripts[i], callback);
  }
  
  if (callback) {
    callback();
  }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo && changeInfo.status == 'loading') {
    executeScripts(tabId, [
      {
        file: 'jquery-2.2.2.min.js',
        runAt: 'document_end'
      },
      {
        file: 'helper.js',
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
