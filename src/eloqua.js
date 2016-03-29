// Initialize the Eloqua command queue at the global level
// so that it's in the scope of our Ceros Event callback.
var _elqQ = _elqQ || [];


(function() {
    if (typeof(CerosSDK) === "undefined") {
        var sdkScript = document.createElement('script');
        sdkScript.type = "text/javascript";
        sdkScript.async = true;
        sdkScript.onload = activateEloquaTracking;
        sdkScript.src = "//sdk.ceros.com/standalone-player-sdk-v3.js";

        document.getElementsByTagName('head')[0].appendChild(sdkScript);
    }
    else {
        activateEloquaTracking();
    }


    function activateEloquaTracking() {
        var pluginScriptTag = document.getElementById("ceros-eloqua-plugin");
        var siteId = pluginScriptTag.getAttribute("siteId");
        var cookieDomain = pluginScriptTag.getAttribute("cookieDomain") || "";
        var experienceId = pluginScriptTag.getAttribute("experienceId");

        if (!siteId) {
            console.error("Site ID is required for the Ceros Eloqua plugin.");
        }

        // Configure the Eloqua command queue and load the Eloqua script.
        _elqQ.push(['elqSetSiteId', 'siteId']);
        if (cookieDomain !== ""){
            _elqQ.push(['elqUseFirstPartyCookie', cookieDomain]);
        }

        var eloquaScript = document.createElement('script');
        eloquaScript.type = "text/javascript";
        eloquaScript.async = true;
        eloquaScript.src = "//img.en25.com/i/elqCfg.min.js";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(eloquaScript, firstScriptTag);

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
    }
})();

