/**
 * Ceros Plugin for preserving an Experience's state via its URL
 * @version 0.1.0
 * @support support@ceros.com
 *
 * This plugin allows people using the Ceros Studio's SDK pallet to tag components
 * to enable them to both control, and be controlled by, parameters in the
 * Experience's URL. It can be used to show different layers, based on parameters in the URL,
 * or even adjust the an Experience's control position.
 *
 * The plugin works by using the parameters in the URL to find hotspots with matching tags in
 * the Experience and sending them click events to trigger any applied actions.
 *
 * This plugin is licensed under the MIT license. A copy of this license and
 * the accompanying source code is available at https://github.com/ceros/ceros-plugins
 */
(function() {
    "use strict";

    /**
     * Class to manage state represented in the URL
     *
     * @constructor
     */
    var UrlHashManager = function() {

        var hash = window.location.hash;

        // The State represented in the URL, and the order its keys were added
        this.state = [];

        // If the current has has anything in it
        if (hash.length > 0) {

            // Remove leading # symbol
            hash = hash.replace(/^#/, "");

            // Spit string into key=value pairs
            var items = hash.split("&");

            // For every pair
            for (var i = 0; i < items.length; i++){

                // Split into key and value
                var subItems = items[i].split("=");

                // If there were two
                if (subItems.length == 2) {

                    this.setParameterValueForKey(
                        decodeURIComponent(subItems[0]),
                        decodeURIComponent(subItems[1])
                    );

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
            this.state.forEach(function(tag) {
                tags.push(tag.key + "=" +  tag.value);
            });

            return tags;
        },

        /**
         * Build a string representing the current state for use in the URL
         *
         * @returns {string}
         */
        buildHashFromCurrentState: function() {

            var value = "",
                i = 0;

            this.state.forEach(function(tag) {

                // If not first iteration
                if (i != 0) {
                    value += "&";
                }

                // Encode values to make the URL safe
                value += encodeURIComponent(tag.key) + "=" + encodeURIComponent(tag.value);

                i++;
            });

            return value;
        },

        /**
         * Set item for use in URL
         *
         * @param {string} theKey
         * @param {string} theValue
         */
        setParameterValueForKey: function(theKey, theValue) {

            // If we have this key already
            if (this.hasKey(theKey)) {

                // Find it in array and update its value
                for (var i = 0; i < this.state.length; i++) {

                    if (this.state[i].key == theKey) {
                        this.state[i].value = theValue;

                        break;
                    }

                }

            } else {
                // Add as new object
                this.state.push({
                    key:   theKey,
                    value: theValue
                });
            }
        },

        /**
         * Test to see if key is defined
         *
         * @param {string} theKey
         * @returns {boolean}
         */
        hasKey: function(theKey) {

            for (var i = 0; i < this.state.length; i++) {

                var currentItem = this.state[i];

                if (currentItem.key == theKey) {
                    return true;
                }

            }

            return false;
        },

        /**
         * Apply the current hash to the URL
         */
        updateUrl: function() {
            window.location.hash = this.buildHashFromCurrentState();
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
     * Regular expression to validate payloads
     *
     * @type {RegExp}
     */
    var validStateTag = new RegExp("[^=]+=[^=]+");

    /**
     * Parse a tag and update the URL with its name/value
     *
     * @param {string} tag
     */
    var updateUrlWithComponentPayload = function(tag){

        // Get and validate the component's payload
        var payload = component.getPayload();

        if (payload.match(validStateTag)) {

            // Parse tag into its name and value
            var parts = tag.split("=");

            // If valid, add it to the current state
            if (parts.length == 2) {
                urlManager.setParameterValueForKey(parts[0], parts[1]);
                urlManager.updateUrl();
            }

        }
    };

    /**
     * Function that runs when both DOM and SDK are ready
     */
    var activatePlugin = function() {

        // Find the request, or current, Experience
        CerosSDK.findExperience(experienceId).done(function(experience) {

            // Find items that set the state
            var componentCollection = experience.findComponentsByTag("set-state");



            // When a user interacts with a tagged component update the URL with its payload
            componentCollection.subscribe(CerosSDK.EVENTS.CLICKED, updateUrlWithComponentPayload);


            /**
             * Function to handle Ceros Page Change events
             */
            var handlePageChange = function() {
                // Update URL with current hash
                urlManager.updateUrl();

                // Get tags that need to be activated, based on current URL
                var hotspotTagsToClick = urlManager.getTagsForCurrentState();

                // For every tag...
                hotspotTagsToClick.forEach(function(tag) {
                    // Find in Ceros and send click event to activate tag
                    experience.findComponentsByTag(tag).click();
                });

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
        var ourScriptTag = document.querySelector("#ceros-url-params-plugin"),
            embeddedExperience = document.querySelector("iframe.ceros-experience");

        // Are we running standalone?
        var standAloneMode = true;

        if (embeddedExperience) {

            standAloneMode = false;

            // If we found our script tag and it has an Experience ID for us to use
            if (ourScriptTag && ourScriptTag.hasAttribute("data-experience-id")) {

                experienceId = ourScriptTag.getAttribute("data-experience-id");

            } else { // try to use the Experience ID from the first Ceros embed on page

                if (embeddedExperience.parentNode && embeddedExperience.parentNode.hasAttribute("id")) {

                    experienceId = embeddedExperience.parentNode.getAttribute("id");

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