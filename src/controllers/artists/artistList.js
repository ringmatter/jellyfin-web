define(['loading', 'events', 'libraryBrowser', 'imageLoader', 'listView', 'cardBuilder', 'userSettings', 'globalize', 'emby-itemscontainer'], function (loading, events, libraryBrowser, imageLoader, listView, cardBuilder, userSettings, globalize) {
    'use strict';


    function loadArtists(tabContent, apiClient, user, userSettings, params) {
        //elem.innerHTML = '<h1>Artists</h1>';

        function getPageData(context) {
            var key = getSavedQueryKey(context);
            var pageData = data[key];

            if (!pageData) {
                // TODO copied from episodes.js
                pageData = data[key] = {
                    query: {
                        SortBy: 'Name',
                        SortOrder: 'Ascending',
                        IncludeItemTypes: 'Episode',
                        Recursive: true,
                        Fields: 'PrimaryImageAspectRatio,MediaSourceCount,UserData',
                        IsMissing: false,
                        ImageTypeLimit: 1,
                        EnableImageTypes: 'Primary,Backdrop,Thumb',
                        StartIndex: 0
                    },
                    view: libraryBrowser.getSavedView(key) || 'Poster'
                };

                if (userSettings.libraryPageSize() > 0) {
                    pageData.query['Limit'] = userSettings.libraryPageSize();
                }

                pageData.query.ParentId = params.topParentId;
                libraryBrowser.loadSavedQueryValues(key, pageData.query);
            }

            return pageData;
        }

        function getQuery(context) {
            return getPageData(context).query;
        }

        function getSavedQueryKey(context) {
            if (!context.savedQueryKey) {
                context.savedQueryKey = libraryBrowser.getSavedQueryKey('artists');
            }

            return context.savedQueryKey;
        }

        var self = this;
        var data = {};
        var isLoading = false;

        self.showFilterMenu = function () {
            require(['components/filterdialog/filterdialog'], function ({ default: filterDialogFactory }) {
                var filterDialog = new filterDialogFactory({
                    query: getQuery(tabContent),
                    mode: 'episodes',
                    serverId: ApiClient.serverId()
                });
                events.on(filterDialog, 'filterchange', function () {
                    console.log('reload items');
                    //reloadItems(tabContent);
                });
                filterDialog.show();
            });
        };

        tabContent.querySelector('.btnFilter').addEventListener('click', function () {
            self.showFilterMenu();
        });


        function reloadItems(page) {

            var query = getQuery(page);

            function onNextPageClick() {
                if (isLoading) {
                    return;
                }

                if (userSettings.libraryPageSize() > 0) {
                    query.StartIndex += query.Limit;
                }
                reloadItems(tabContent);
            }

            function onPreviousPageClick() {
                if (isLoading) {
                    return;
                }

                if (userSettings.libraryPageSize() > 0) {
                    query.StartIndex = Math.max(0, query.StartIndex - query.Limit);
                }
                reloadItems(tabContent);
            }


            //var userId = apiClient.getCurrentUserId();
            let promise;

            // promise = apiClient.getPeople(userId, query);

            console.log(`query ${JSON.stringify(query)}`);

            // TODO: query
            const baseUrl = 'http://127.0.0.1:3000';
            const index = 'artists_local';
            const searchUrl = `${baseUrl}/${index}/_search`;
            const body = {
                size: 100,
                from : query.StartIndex,
                sort : {
                    "Name.keyword": {"order": "asc"}
                }
            };
            const headers = {
                'Content-Type': 'application/json'
            };

            promise = fetch(searchUrl, {method: 'POST', body: JSON.stringify(body), headers})
            .then(response => response.json())
            .then(data => {
                console.log('done');
                const items = data.hits.hits.map(hit => hit._source);
                const result = {
                    Items: items,
                    TotalRecordCount: data.hits.total.value
                };
                return Promise.resolve(result);
            }).catch(errr => {
                console.error(errr);
            })

            return promise.then(function(result) {

                var itemsContainer = page.querySelector('.itemsContainer');

                var html;
                var cardLayout = false;

                html = cardBuilder.getCardsHtml({
                    items: result.Items,
                    preferThumb: false,
                    shape: "portrait",
                    overlayText: false,
                    showTitle: true,
                    showParentTitle: true,
                    lazy: true,
                    overlayPlayButton: true,
                    context: 'home',
                    centerText: !cardLayout,
                    cardLayout: cardLayout
                });
                itemsContainer.innerHTML = html;

                var pagingHtml = libraryBrowser.getQueryPagingHtml({
                    startIndex: query.StartIndex,
                    limit: query.Limit,
                    totalRecordCount: result.TotalRecordCount,
                    showLimit: false,
                    updatePageSizeSetting: false,
                    addLayoutButton: false,
                    sortButton: false,
                    filterButton: false
                });

                var i;
                var length;
                var elems;

                elems = tabContent.querySelectorAll('.paging');
                for (i = 0, length = elems.length; i < length; i++) {
                    elems[i].innerHTML = pagingHtml;
                }

                elems = tabContent.querySelectorAll('.btnNextPage');
                for (i = 0, length = elems.length; i < length; i++) {
                    elems[i].addEventListener('click', onNextPageClick);
                }

                elems = tabContent.querySelectorAll('.btnPreviousPage');
                for (i = 0, length = elems.length; i < length; i++) {
                    elems[i].addEventListener('click', onPreviousPageClick);
                }

                loading.hide();
                isLoading = false;
                imageLoader.lazyChildren(itemsContainer);

            });
        }

        return reloadItems(tabContent);

    }

    function resume(elem, options) {
        var elems = elem.querySelectorAll('.itemsContainer');
        var i;
        var length;
        var promises = [];

        for (i = 0, length = elems.length; i < length; i++) {
            //promises.push(elems[i].resume(options));
        }

        var promise = Promise.all(promises);
        if (!options || options.returnPromise !== false) {
            return promise;
        }
    }

    function pause(elem) {
        var elems = elem.querySelectorAll('.itemsContainer');
        for (var i = 0; i < elems.length; i++) {
            //elems[i].pause();
        }
    }


    return {
        //loadLibraryTiles: loadLibraryTiles,
        loadArtists: loadArtists,
        //destroySections: destroySections,
        pause: pause,
        resume: resume
    };
});
