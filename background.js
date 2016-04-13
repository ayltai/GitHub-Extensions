chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.storage.sync.get({
    repo_url: '9gag'
  }, function(items) {
    if (items.repo_url.length > 0 && tab.url.indexOf(items.repo_url + '/') > -1 && changeInfo && changeInfo.status == 'loading') {
      chrome.tabs.executeScript(tabId, {
        file: 'jquery-2.2.2.min.js',
        runAt: 'document_end'
      }, function() {
        chrome.tabs.executeScript(tabId, {
          file: 'plusOneCounter.js',
          runAt: 'document_end'
        });
      });
    }
  });
});