define([], function () {
    'use strict';

    const headers = { 'Content-Type': 'application/json' };

    const baseUrl = 'http://192.168.1.132:32226';
    let actor_download_index = 'actor_download_index_external';
    const actor_download_search_url = `${baseUrl}/${actor_download_index}/_search`;

    const download_index = 'download_index';
    const download_search_url = `${baseUrl}/${download_index}/_search`;

    const elastic = {

        getDownloads: function () {
            const body = { size: 500, from: 0 };
            return fetch(download_search_url, { method: 'POST', body: JSON.stringify(body), headers })
                .then(response => response.json())
                .then(data => data.hits.hits);
        },

        indexActorNzb: function (doc) {
            const url = baseUrl + '/' + actor_download_index + '/_doc/' + doc['_id'] + '?refresh=true';
            console.log('indexing at ' + url);
            return fetch(url, { method: 'PUT', body: JSON.stringify(doc['_source']), headers })
                .then(result => {
                    return result;
                });
        },

        getActorNzbs: function (id) {
            const actors_index = "actors_nzb_index";
            const actor_url = `${baseUrl}/${actors_index}/_search`;
            const body = {
                query: {
                    term: {
                        "actor_id.keyword": id
                    }
                },
                sort: [
                    { size: { order: "desc" } }
                ]
            };
            return fetch(actor_url, { method: 'POST', body: JSON.stringify(body), headers })
                .then(result => result.json())
                .then(data => {
                    return data.hits.hits;
                });
        }

    };

    window.elastic = elastic;
    return elastic;
});
