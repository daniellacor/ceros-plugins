/**
 * Ceros Highlander Plugin. There can be only one (layer visible at a time)
 * @version 0.2.0
 * @support support@ceros.com
 *
 * This plugin allows you to define a group of layers, where only 1 layer in the group can be visible at a time
 * If any layer in the group is shown, then all other layers in the group will be automatically hidden. The groups
 * are defined using the SDK panel to give each layer in the group the same tag.
 *
 * You can define multiple groups by giving different tags to each group.
 *
 * This plugin is licensed under the MIT license. A copy of this license and
 * the accompanying source code is available at https://github.com/ceros/ceros-plugins
 */

(function() {

    require.config({
        paths: { 
            CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v3",
        }
    });

    require(['CerosSDK'], function (CerosSDK) { 
        CerosSDK.findExperience().done(function(cerosExperience) {
            var pluginScriptTag = document.getElementById("ceros-highlander-plugin");
            var highlanderTags = pluginScriptTag.getAttribute("highlanderTags").split(',');

            jQuery.each(highlanderTags, function(tagIndex, groupTag) {
            	var layerCollection = cerosExperience.findLayersByTag(groupTag);
            	layerCollection.subscribe(CerosSDK.EVENTS.SHOWN, function(theVisibleLayer) {
            		jQuery.each(layerCollection.layers, function(layerIndex, someLayerInTheGroup) {
            			if (someLayerInTheGroup != theVisibleLayer) {
            				someLayerInTheGroup.hide();
            			}
            		});
            	});
            });
        });
    });
})();