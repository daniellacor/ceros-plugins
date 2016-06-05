/**
 * Ceros Marketo Plugin
 * @version 0.1.0
 * @support support@ceros.com
 *
 * This plugin is licensed under the MIT license. A copy of this license and
 * the accompanying source code is available at https://github.com/ceros/ceros-plugins
 */
(function() {
    if (typeof(CerosSDK) === "undefined") {
        var sdkScript = document.createElement('script');
        sdkScript.type = "text/javascript";
        sdkScript.async = true;
        sdkScript.onload = activateMarketoTracking;
        sdkScript.src = "//sdk.ceros.com/standalone-player-sdk-v3.js";

        document.getElementsByTagName('head')[0].appendChild(sdkScript);
    }
    else {
        activateMarketoTracking();
    }


    function activateMarketoTracking() {
        var pluginScriptTag = document.getElementById("ceros-marketo-plugin");
        var accountId = pluginScriptTag.getAttribute("accountId");

        if (!accountId) {
            console.error("Account ID is required for the Ceros Munchkin plugin.");
        }

        var didInit;
        function initMunchkin() {
            if(!didInit) {
                didInit = true;
                Munchkin.init(accountId);
            }
        }

        //load the Marketo script then initialize
        var marketoScript = document.createElement('script');
        marketoScript.type = "text/javascript";
        marketoScript.async = true;
        marketoScript.src = '//munchkin.marketo.net/munchkin.js';
        s.onreadystatechange = function() {
            if (this.readyState == 'complete' || this.readyState == 'loaded') {
                initMunchkin();
            }
        };
        s.onload = initMunchkin;
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(marketoScript, firstScriptTag);

        // Register a page change event handler
        CerosSDK.findExperience().fail(function(err){
            console.error(err);
        }).done(function(experience){
            experience.subscribe(CerosSDK.EVENTS.PAGE_CHANGE, function(page){
                var pageUrl = window.location.href;
                // if the URL does not end in /p/N, where N is a number
                if (!pageUrl.match(/\/p\/\d+$/)){
                    pageUrl = pageUrl + '/p/' + page.getPageNumber();
                }
                Munchkin.munchkinFunction('visitWebPage', {url : pageUrl});
            });
        });
    }
})();

