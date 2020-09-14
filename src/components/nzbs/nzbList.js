define(['scripts/elastic', 'scripts/sab', 'toast'], function (elastic, sab, toast) {
    'use strict';

    var nzbList = {

        render: function (elem, item) {

            for (const elem of document.querySelectorAll('.btnNzbSearch')) {
                elem.classList.remove('hide');
                elem.addEventListener('click', function(e) {
                    e.preventDefault();
                    const link = 'https://nzbgeek.info/geekseek.php?moviesgeekseek=1&browsecategory=6000&browseincludewords=' + item.Name;
                    window.open(link, '_blank');
                });
            }

            function decodeHtml(html) {
                var txt = document.createElement("textarea");
                txt.innerHTML = html;
                return txt.value;
            }

            function getCheckMark(doc) {
                const icon = doc['nzbId'] ? 'playstatebutton-icon-played' : 'playstatebutton-icon-unplayed';
                let html = '<button is="emby-playstatebutton" type="button" class="listItemButton paper-icon-button-light emby-button playstatebutton-played" data-played="true" title="Downloaded">';
                html += '<span class="material-icons check ' + icon + '"></span>';
                html += '</button>';
                return html;
            }

            elastic.getActorNzbs(item.Id)
                .then(hits => {
                    let html = '<div>';
                    console.log('hits', hits);
                    if (!hits.length) {
                        html += '<h2>No NZBs available.</h2>';
                    } else {
                        hits.forEach(hit => {
                            const doc = hit._source;
                            html += '<div class="listItem listItem-border" data-id="' + doc.guid + '">';
                            html += '<div class="listItemBody itemAction">';
                            html += '<div class="listItemBodyText">'
                            html += doc.pubDate + " - " + Math.round(doc.size / 1024 / 1024) + " MB";
                            html += "</div>";
                            html += "<div class='secondary listItemBodyText'>";
                            html += doc.title;
                            html += "</div>";
                            html += '</div>';
                            html += "<div class='listViewUserDataButtons'>";
                            html += getCheckMark(doc);
                            html += "<button class='listItemButton downloadButton paper-icon-button-light emby-button'>";
                            html += "<span data-id='" + doc.guid + "' class='material-icons file_download playstatebutton-icon-unplayed'></span>"
                            html += "</button>";
                            html += "</div>";
                            html += '</div>';
                        });
                    }

                    html += "</div>";
                    elem.innerHTML = html;

                    document.querySelectorAll('.file_download').forEach(function (elem) {
                        elem.addEventListener('click', function (e) {
                            e.preventDefault();
                            const id = this.getAttribute('data-id');
                            console.log('id', id);
                            const res = hits.filter(item => {
                                return item._source.guid === id;
                            });
                            console.log(res);
                            const doc = res[0];
                            console.log(doc);
                            const link = decodeHtml(doc._source.link);
                            if (typeof link === 'undefined') {
                                console.warn('Could not decode link from ', doc);
                                return;
                            }
                            sab.addActorUrl(link)
                                .then(result => {
                                    const nzoId = result.nzo_ids[0];
                                    toast('Download started');
                                    console.log('download started', nzoId);
                                    console.log(result);
                                    doc['nzbId'] = nzoId;
                                    // TODO: reload and reindex
                                    // elastic.indexActorNzb(doc);
                                });
                        });
                    });
                }).catch(err => {
                    console.error(err);
                })
        },

    };

    window.nzbList = nzbList;
    return nzbList;
});
