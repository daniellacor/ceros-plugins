/**
 * Ceros Plugin for preserving an Experience's state via its URL
 * @version 0.1.0
 * @support support@ceros.com
 *
 * This plugin allows people using the Ceros Studio's SDK pallet to tag components
 * to enable them to both control, and be controlled by, parameters in
 * the Experience's URL. It can be used to remember user's actions
 * between pages or to trigger actions like showing layers or
 * jumping to anchor points when the Experience is opened
 * by the user.
 *
 * This plugin is licensed under the MIT license. A copy of this license and
 * the accompanying source code is available at https://github.com/ceros/ceros-plugins
 */
(function() {
    "use strict";

    /**
     * Class to mange state represented in the URL
     *
     * @constructor
     */
    var UrlHashManager = function() {

        var hash = window.location.hash;

        // The State represented in the URL, and the order its keys were added
        this.state = {};
        this.keyOrder = [];

        // If the current has has anything in it
        if (hash.length > 0) {

            // Remove leading # symbol
            var replaceLeadingDelimiters = new RegExp("^#");
            hash = hash.replace(replaceLeadingDelimiters, "");

            // Spit string into key=value pairs
            var items = hash.split("&");

            // For every pair
            for (var i = 0; i < items.length; i ++){

                // Split into key and value
                var subItems = items[i].split("=");

                // If there were two
                if (subItems.length == 2) {

                    // Decode special characters
                    var theKey = decodeURIComponent(subItems[0]),
                        theValue = decodeURIComponent(subItems[1]);

                    // If we haven't had this key already, add it to the current state
                    if (this.keyOrder.indexOf(theKey) == -1) {
                        this.state[theKey] = theValue;
                        this.keyOrder.push(theKey);
                    }

                }
            }
        }
    };

    UrlHashManager.prototype = {

        /**
         * Get Studio tags required to activated to represent current state
         *
         * @returns {Array}
         */
        getTagsForCurrentState: function(){

            var tags = [];

            // Build array of tags
            for (var i = 0; i < this.keyOrder.length; i++) {
                var theKey = this.keyOrder[i];
                tags.push(theKey + "=" + this.state[theKey]);
            }

            return tags;
        },

        /**
         * Build a string representing the current state for use in the URL
         *
         * @returns {string}
         */
        getUrlHash: function() {

            var value = "";

            for (var i = 0; i < this.keyOrder.length; i++) {

                var theKey = this.keyOrder[i];

                if (i != 0) {
                    value += "&";
                }

                // Encode values to make the URL safe
                value += encodeURIComponent(theKey) + "=" + encodeURIComponent(this.state[theKey]);
            }

            return value;
        },

        /**
         * Set item for use in URL
         *
         * @param {string} theKey
         * @param {string} theValue
         */
        setItemValue: function(theKey, theValue) {

            // If we don't have this item already
            if (this.keyOrder.indexOf(theKey) == -1) {
                this.keyOrder.push(theKey);
            }

            this.state[theKey] = theValue;

            this.updateUrl();
        },

        /**
         * Apply the current hash to the URL
         */
        updateUrl: function() {
            window.location.hash = this.getUrlHash();
        }
    };

    /**
     * Global object to manage the Experience's state represented in the URL
     *
     * @type {UrlHashManager}
     */
    var urlManager = new UrlHashManager();

    /**
     * The Experience's ID, or NULL if Standalone
     *
     * @type {string|null}
     */
    var experienceId = null;

    /**
     * Function that runs when both DOM and SDK are ready
     */
    var activatePlugin = function() {

        // Find the request, or current, Experience
        CerosSDK.findExperience(experienceId).done(function(experience) {

            // Find items that set the state
            var componentCollection = experience.findComponentsByTag("set-state");

            // Regular expression to validate payloads
            var validStateTag = new RegExp("[^=]+=[^=]+");

            // When a user interacts with a tagged component
            componentCollection.subscribe(CerosSDK.EVENTS.CLICKED, function(component) {

                // Get and validate the component's payload
                var payload = component.getPayload();

                if (payload.match(validStateTag)) {

                    // Parse payload into its name and value
                    var parts = payload.split("=");

                    // If valid, add it to the current state
                    if (parts.length == 2) {
                        urlManager.setItemValue(parts[0], parts[1]);
                    }
                }
            });


            /**
             * Function to handle Ceros Page Change events
             */
            var handlePageChange = function() {
                // Update URL with current hash
                urlManager.updateUrl();

                // Get tags that need to be activated, based on current URL
                var tagsToShow = urlManager.getTagsForCurrentState();

                // For every tag...
                for (var tagIndex = 0; tagIndex < tagsToShow.length; tagIndex++) {

                    // Find in Ceros and send click event to activate tag
                    experience.findComponentsByTag(tagsToShow[tagIndex]).click();
                }
            };

            // Subscribe to Page Change events
            experience.subscribe(CerosSDK.EVENTS.PAGE_CHANGE, handlePageChange);

            // Process first page
            handlePageChange(experience.getCurrentPage());

        }).fail(function(error) {
            console.error(error);
        });
    };

    /**
     * Function to run when the page's DOM is ready
     */
    var onDomReady = function() {

        // Find the plugin's script tag by its ID, and see if there is a Ceros embed on the page
        var ourScriptTag = document.querySelector("#ceros-stateful-layers-plugin"),
            firstCerosFrame = document.querySelector("iframe.ceros-experience");

        // Are we running standalone?
        var standAloneMode = true;

        // If we found a Ceros embed, then we're running embedded
        if (firstCerosFrame) {

            standAloneMode = false;

            // If we found our script tag and it has an Experience ID for us to use
            if (ourScriptTag && ourScriptTag.hasAttribute("data-experience-id")) {

                experienceId = ourScriptTag.getAttribute("data-experience-id");

            } else { // try to use the Experience ID from the first Ceros embed on page

                if (firstCerosFrame.parentNode && firstCerosFrame.parentNode.hasAttribute("id")) {

                    experienceId = firstCerosFrame.parentNode.getAttribute("id");

                } else { // Log error and stop running...

                    console.error("Ceros Plugin: Unable to find an Experience ID.");

                    return;
                }
            }
        }

        // If the Ceros SDK isn't already loaded
        if (typeof(CerosSDK) === "undefined") {

            // Choose which version of the SDK to use...
            var sdkUrl = "//sdk.ceros.com/";

            if (standAloneMode) {
                sdkUrl += "standalone";
            } else {
                sdkUrl += "embedded";
            }

            // Build script tag to load the SDK
            var sdkScript = document.createElement('script');

            sdkScript.type = "text/javascript";
            sdkScript.async = true;
            sdkScript.onload = activatePlugin;
            sdkScript.src = sdkUrl + "-player-sdk-v3.min.js";

            document.getElementsByTagName('head')[0].appendChild(sdkScript);

        } else { // SDK already loaded, so let's get running
            activatePlugin();
        }

    };


    // in case the document is already rendered
    if (document.readyState != 'loading') {
        onDomReady();
    } else if (document.addEventListener) { // modern browsers
        document.addEventListener('DOMContentLoaded', onDomReady);
    } else { // IE <= 8
        document.attachEvent('onreadystatechange', function(){
            if (document.readyState == 'complete') {
                onDomReady();
            }
        });
    }
})();