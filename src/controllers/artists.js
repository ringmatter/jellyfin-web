define(['userSettings', 'loading', 'connectionManager', 'apphost', 'layoutManager', 'focusManager', 'controllers/artists/artistList', 'emby-itemscontainer'], function (userSettings, loading, connectionManager, appHost, layoutManager, focusManager, artists) {
    'use strict';

    function ArtistsTab(view, params) {
        this.view = view;
        this.params = params;
        console.log('params', JSON.stringify(params));
        this.apiClient = connectionManager.currentApiClient();
        this.sectionsContainer = view.querySelector('.sections');
    }

    ArtistsTab.prototype.onResume = function (options) {
        if (this.sectionsRendered) {
            var sectionsContainer = this.sectionsContainer;

            if (sectionsContainer) {
                return artists.resume(sectionsContainer, options);
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
            return artists.loadArtists(view, apiClient, user, userSettings, params).then(function () {
                if (options.autoFocus) {
                    focusManager.autoFocus(view);
                }

                loading.hide();
            });
        });
    };

    ArtistsTab.prototype.onPause = function () {
        var sectionsContainer = this.sectionsContainer;

        if (sectionsContainer) {
            //homeSections.pause(sectionsContainer);
        }
    };

    ArtistsTab.prototype.destroy = function () {
        this.view = null;
        this.params = null;
        this.apiClient = null;
        this.destroyHomeSections();
        this.sectionsContainer = null;
    };

    ArtistsTab.prototype.destroyHomeSections = function () {
        var sectionsContainer = this.sectionsContainer;

        if (sectionsContainer) {
            //homeSections.destroySections(sectionsContainer);
        }
    };


    return ArtistsTab;
});
