define(['userSettings', 'loading', 'connectionManager', 'apphost', 'layoutManager', 'focusManager', 'controllers/downloads/downloadList', 'emby-itemscontainer'], function (userSettings, loading, connectionManager, appHost, layoutManager, focusManager, downloads) {
    'use strict';

    function DownloadsTab(view, params) {
        this.view = view;
        this.params = params;
        console.log('params', JSON.stringify(params));
        this.apiClient = connectionManager.currentApiClient();
        console.log('view', view);
        this.sectionsContainer = view.querySelector('.sections');
    }

    DownloadsTab.prototype.onResume = function (options) {
        if (this.sectionsRendered) {
            var sectionsContainer = this.sectionsContainer;

            if (sectionsContainer) {
                return downloads.resume(sectionsContainer, options);
            }

            return Promise.resolve();
        }

        loading.show();
        var view = this.view;
        var params = this.params;
        var apiClient = this.apiClient;
        this.destroyHomeSections();
        this.sectionsRendered = true;



        return apiClient.getCurrentUser().then(function (user) {
            return downloads.loadDownloads(view, apiClient, user, userSettings, params).then(function () {
                if (options.autoFocus) {
                    focusManager.autoFocus(view);
                }
                var container = view.querySelector('.itemsContainer');
                loading.hide();
            });
        });
    };

    DownloadsTab.prototype.onPause = function () {
        var sectionsContainer = this.sectionsContainer;

        if (sectionsContainer) {
            //homeSections.pause(sectionsContainer);
        }
    };

    DownloadsTab.prototype.destroy = function () {
        this.view = null;
        this.params = null;
        this.apiClient = null;
        this.destroyHomeSections();
        this.sectionsContainer = null;
    };

    DownloadsTab.prototype.destroyHomeSections = function () {
        var sectionsContainer = this.sectionsContainer;

        if (sectionsContainer) {
            //homeSections.destroySections(sectionsContainer);
        }
    };


    return DownloadsTab;
});
