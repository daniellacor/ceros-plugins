(function() {
    if (!CerosSDK) {
        var sdkScript = document.createElement('script');
        sdkScript.type = "text/javascript";
        sdkScript.async = true;
        sdkScript.onload = activateEloquaTracking;

        // Are we embedded in an iframe?
        if (top != window) {
            sdkScript.src = "//sdk.ceros.com/embedded-player-sdk-v3.js";
        }
        else {
            sdkScript.src = "//sdk.ceros.com/standalone-player-sdk-v3.js";
        }

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

        // Initialize the Eloqua command queue and load the Eloqua script.
        var _elqQ = _elqQ || [];
        _elqQ.push(['elqSetSiteId', 'siteId']);
        if (cookieDomain !== ""){
            _elqQ.push(['elqUseFirstPartyCookie', cookieDomain]);
        }
        (function() {
            function async_load() {
                var s = document.createElement('script'); s.type =
                    'text/javascript';
                s.async = true;
                s.src = '//img.en25.com/i/elqCfg.min.js';
                var x = document.getElementsByTagName('script')[0];
                x.parentNode.insertBefore(s, x);
            }
            if(window.addEventListener) window.addEventListener
            ('DOMContentLoaded', async_load, false);
            else if (window.attachEvent) window.attachEvent('onload',
                async_load);
        })();

        // Register a page change event handler
        var findExperiencePromise;
        if (experienceId) {
            findExperiencePromise = CerosSDK.findExperience(experienceId);
        }
        else {
            findExperiencePromise = CerosSDK.findExperience();
        }
        findExperiencePromise.fail(function(err){
                console.error(err);
            }).done(function(experience){
                experience.subscribe(CerosSDK.EVENTS.PAGE_CHANGE, function(){
                    _elqQ.push(['elqTrackPageView']);
                });
            });
    }
})();

