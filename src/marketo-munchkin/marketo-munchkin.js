/**
 * Ceros Marketo Munchkin Plugin
 * @version 0.2.0
 * @support support@ceros.com
 *
 * This plugin is licensed under the MIT license. A copy of this license and
 * the accompanying source code is available at https://github.com/ceros/ceros-plugins
 */
(function() {

    require.config({
        shim: {
            Munchkin: {
                exports: 'Munchkin'
            }
        },
        
        paths: { 
            Munchkin: "//munchkin.marketo.net/munchkin",
            CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v3",        
        }
    });

    require(['Munchkin', 'CerosSDK'], function (Munchkin, CerosSDK) {
        var pluginScriptTag = document.getElementById("ceros-marketo-munchkin-plugin");
        var accountId = pluginScriptTag.getAttribute("accountId");

        if (!accountId) {
            console.error("Account ID is required for the Ceros Munchkin plugin.");
        }

        Munchkin.init(accountId);

        // Register a page change event handler
        CerosSDK.findExperience().fail(function(err){
            console.error(err);
        }).done(function(experience){
            var afterFirstChange = false; //Munchkin.init method automatically sends visitPage and PAGE_CHANGE is called on load, so skip the first one
            experience.subscribe(CerosSDK.EVENTS.PAGE_CHANGE, function(page){
                if (afterFirstChange) {
                    var pathname = window.location.pathname;
                    // if the URL does not end in /p/N, where N is a number
                    if (!pathname.match(/\/p\/\d+$/)){
                        pathname = pathname + '/p/' + page.getPageNumber();
                    }
                    Munchkin.munchkinFunction('visitWebPage', {url : pathname});
                } else {
                    afterFirstChange = true;
                }

            });
        });
    });
})();

