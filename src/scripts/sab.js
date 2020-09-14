define([], function () {
    'use strict';

    const apiKey = 'df05ace18060469cb5f7745c21f1ec37';
    const sabUrl = 'http://nas.dubture.local/sabnzbd/api?output=json&apikey=' + apiKey;

    const sab = {
        addActorUrl: function (url) {
            const encoded = encodeURIComponent(url);
            const uploadUrl = sabUrl + "&mode=addurl&name=" + encoded + "&cat=actors";
            return fetch(uploadUrl).then(result => result.json());
        }
    };

    window.sab = sab;
    return sab;
});
