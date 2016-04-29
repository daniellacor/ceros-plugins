/**
 * Ceros Plugin for SoundJS
 * @version 1.0.0
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

    if (typeof(CerosSDK) === "undefined") {
        var sdkScript = document.createElement('script');
        sdkScript.type = "text/javascript";
        sdkScript.async = true;
        sdkScript.onload = activatePlaySound;
        sdkScript.src = "//sdk.ceros.com/standalone-player-sdk-v3.js";

        document.getElementsByTagName('head')[0].appendChild(sdkScript);
    } else {
        activatePlaySound();
    }

    function loadSoundJs() {
        var soundScript = document.createElement('script');
        soundScript.type = "text/javascript";
        soundScript.async = true;
        soundScript.src = "//code.createjs.com/soundjs-0.6.2.min.js";
        document.body.appendChild(sdkScript);
    }

    function activatePlaySound() {
        loadSoundJs();

        CerosSDK.findExperience().done(function(ceros) {
            var soundTag = 'playsound';
            var componentsWithSound = ceros.findComponentsByTag(soundTag);
            jQuery.each(componentsWithSound.components, function (soundComponentIndex, soundComponent) {
                createjs.Sound.registerSound(soundComponent.getPayload(), soundComponent.id);
            });
            componentsWithSound.subscribe(CerosSDK.EVENTS.CLICKED, function (clickedComponent) {
                createjs.Sound.play(clickedComponent.id);
            });
        });
    }
})();

