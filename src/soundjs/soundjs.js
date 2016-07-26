/**
 * Ceros Plugin for SoundJS
 * @version 0.2.0
 * @support support@ceros.com
 *
 * This plugin enables people using the Ceros Studio to create an experience
 * that can play a sound when an object is clicked using the SoundJs library
 * http://www.createjs.com/soundjs
 *
 * The sound file must be hosted on a server that allows cross origin requests
 *
 * To use the plugin:
 *   1. Tag a component with 'playsound' in the SDK panel
 *   2. Set the Payload to the URL of the sound file
 *
 * This plugin is licensed under the MIT license. A copy of this license and
 * the accompanying source code is available at https://github.com/ceros/ceros-plugins
 */

(function() {

    require.config({

        shim: {
            SoundJS: {
                exports: 'createjs'
            }
        },

        paths: { 
            CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v3",        
            SoundJS: "https://code.createjs.com/soundjs-0.6.2.min",
        }
        
    });

    require(['CerosSDK', 'SoundJS'], function (CerosSDK, createjs) {
        CerosSDK.findExperience().done(function(cerosExperience) {
            var pluginScriptTag = document.getElementById("ceros-soundjs-plugin");
            var soundTag = pluginScriptTag.getAttribute("soundTag");
            var componentsWithSound = cerosExperience.findComponentsByTag(soundTag);
            jQuery.each(componentsWithSound.components, function (soundComponentIndex, soundComponent) {
                createjs.Sound.registerSound(soundComponent.getPayload(), soundComponent.id);
            });
            componentsWithSound.subscribe(CerosSDK.EVENTS.CLICKED, function (clickedComponent) {
                createjs.Sound.play(clickedComponent.id);
            });
        });
    });
})();

