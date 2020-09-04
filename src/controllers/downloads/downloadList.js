define(['loading', 'events', 'libraryBrowser', 'imageLoader', 'listView', 'cardBuilder', 'userSettings', 'globalize', 'emby-itemscontainer'], function (loading, events, libraryBrowser, imageLoader, listView, cardBuilder, userSettings, globalize) {
    'use strict';


    function loadDownloads(tabContent, apiClient, user, userSettings, params) {
        console.log('view2', tabContent);
        return reloadItems(tabContent);
    }

    function reloadItems(page) {

        const baseUrl = 'http://192.168.1.132:32226';
        let index = 'download_index';
        const searchUrl = `${baseUrl}/${index}/_search`;
        const body = {
            size: 100,
            from : 0
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        return fetch(searchUrl, {method: 'POST', body: JSON.stringify(body), headers})
        .then(response => response.json())
        .then(data => {
            var itemsContainer = page.querySelector('.itemsContainer');
            console.log('data', data);
            console.log(itemsContainer);
            console.log(itemsContainer.InnerHTML);
            var html = '<div>'
            data.hits.hits.sort((a,b) => {
                return a._source.series > b._source.series ? 1 : -1;
            });
            var items = data.hits.hits.map((hit, idx) => {
                var source = hit['_source'];
                const {actors, directory, series, md5} = source;
                var div = '<div class="listItem listItem-border downloadItem" data-id="' + md5 + '">';
                div += "<div class='listItemBody itemAction'><div class='listItemBodyText'>" + series + "</div> <div class='secondary listItemBodyText'>" + actors + "</div></div>";
                div += '</div>';
                return div;
            }).join('');
            console.log('items', items);
            html += items;
            html += '</div>';
            document.getElementById('downloads').innerHTML = html;

            var userSelection = document.getElementsByClassName('downloadItem');

            const getDownloadItem = (e) => {
                const id = document.getElementById('id_field').value;
                const result = data.hits.hits.filter(item => {
                    return item._source.md5 === id;
                });
                const item = result[0]._source;
                const actors = document.getElementById('actors_field').value;
                const image = document.getElementById('image_field').value;
                item.actors = actors;
                item.image = image;
                return item;
            }

            const updateDebug = (item) => {
                document.getElementById('debug').innerHTML = JSON.stringify(item, null, 2);
                const params = {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(item)
                };
                fetch('http://127.0.0.1:5000/preview', params).then(res => res.json()).then(data => {
                    console.log(data);
                    if(!data.target) {
                        document.getElementById('target_path').innerHTML = 'Target path does not exist';
                    } else {
                        const target = data.target.replace('/nfs/Base/JellyFin/Sites', '');
                        document.getElementById('target_path').innerHTML = 'Target path for ' + item.series;
                        document.getElementById('target_field').value = target;
                    }
                });

            };

            const getAndUpdateDebug = (e) => {
                updateDebug(getDownloadItem(e));
            }

            for(var i = 0; i < userSelection.length; i++) {
            (function(index) {
                userSelection[index].addEventListener("click", function(e) {
                console.log("Clicked index: " + index);
                console.log(this.getAttribute('data-id'));
                const id = this.getAttribute('data-id');

                const result = data.hits.hits.filter(item => {
                    return item._source.md5 === id;
                });
                const item = result[0]._source;
                let bingLink = item.series + " " + item.actors;
                const bingLinkLower = bingLink.toLowerCase();
                bingLink = "https://www.bing.com/images/search?q=" + bingLink + "&qs=n&form=QBIR&qft=%20filterui%3Aaspect-wide&sp=-1&pq=" + bingLinkLower + "&sc=1-24&cvid=07D93E4E248D48C78AB36469E5070AFE&first=1&scenario=ImageBasicHover";
                document.getElementById('bing_link').setAttribute('href', bingLink);
                document.getElementById('actors_field').value = item.actors.replace(' And ', ', ');
                document.getElementById('id_field').value = item.md5;
                getAndUpdateDebug(e);
                })
            })(i);
            }

            document.getElementById('actors_field').addEventListener('input', getAndUpdateDebug);
            document.getElementById('image_field').addEventListener('input', getAndUpdateDebug);

            document.getElementById('downloadForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const item = getDownloadItem(e);
                updateDebug(item);
                const params = {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(item)
                };
                fetch('http://127.0.0.1:5000/move', params).then(res => res.json()).then(data => {
                    alert('posted');
                });

            });
            document.getElementById('create_target_path').addEventListener('click', function(e) {
                const item = getDownloadItem(e);
                const params = {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(item)
                };
                fetch('http://127.0.0.1:5000/create_target_path', params).then(res => res.json()).then(data => {
                    alert('Created');
                });

            });
            loading.hide();
        }).catch(err => {
            console.error(err);
        });
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
        loadDownloads: loadDownloads,
        //destroySections: destroySections,
        pause: pause,
        resume: resume
    };
});
