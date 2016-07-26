/**
 * Ceros Eloqua Plugin
 * @version 0.2.0
 * @support support@ceros.com
 *
 * This plugin is licensed under the MIT license. A copy of this license and
 * the accompanying source code is available at https://github.com/ceros/ceros-plugins
 */

// Initialize the Eloqua command queue at the global level
// so that it's in the scope of our Ceros Event callback.
var _elqQ = _elqQ || [];

(function() {

    require.config({
        paths: { 
            elq: "//img.en25.com/i/elqCfg.min",
            CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v3",
        }
    });

    require([ 'elq', 'CerosSDK'], function (elq, CerosSDK) { 
        var pluginScriptTag = document.getElementById("ceros-eloqua-plugin");
        var siteId = pluginScriptTag.getAttribute("siteId");
        var cookieDomain = pluginScriptTag.getAttribute("cookieDomain") || "";

        if (!siteId) {
            console.error("Site ID is required for the Ceros Eloqua plugin.");
        }

        // Configure the Eloqua command queue and load the Eloqua script.
        _elqQ.push(['elqSetSiteId', siteId]);
        if (cookieDomain !== ""){
            _elqQ.push(['elqUseFirstPartyCookie', cookieDomain]);
        }


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
                _elqQ.push(['elqTrackPageView', pageUrl]);
            });
        });
    });

})();

