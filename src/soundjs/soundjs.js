/**
 * Ceros Plugin for SoundJS
 * @version !!!!!!! UPDATE was 0.2.0
 * @support support@ceros.com
 *
 * This plugin enables people using the Ceros Studio to create an experience
 * that can play a sound when an object is clicked using the SoundJs library
 * http://www.createjs.com/soundjs
 *
 * The sound file must be hosted on a server that allows cross origin requests
 *
 * To use the plugin: UPDATE
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
            loDash: "https://cdn.jsdelivr.net/lodash/4.14.0/lodash.min"
        }
        
    });

    require(['CerosSDK', 'SoundJS', 'loDash'], function (CerosSDK, createjs, _) {
        CerosSDK.findExperience().done(function(cerosExperience) {

            sounds = {};
            background = {};

            //BASIC SOUND MANIPULATION FUNCTIONS
            var play = function(soundId){
                sounds[soundId].play();
                sounds[soundId].active = true;
            };


            var pause = function(soundId){
                sounds[soundId].paused = true;
            };

            var resume = function(soundId){
                sounds[soundId].paused = false;
            };


            var stopSound = function(soundId){ //resets song to beginning
                sounds[soundId].stop();
                sounds[soundId].active = false; //note this does not fire 
            };



            //NATIVE EVENTS HANDLERS

            var handleComplete = function(evt, data){
                sounds[data.soundId].active = false;
            };


            //EVENT HANDLERS

            var handleMute = function(evt, data){
                if (sounds[data.soundId].muted){
                    sounds[data.soundId].muted = false;
                }
                else {
                    sounds[data.soundId].muted = true;
                }
            };

            var handlePlay = function(evt, data){
                sounds[data.soundId].play();
                sounds[data.soundId].active = true;
            };

            var handlePause = function(evt, data){
                pause(data.soundId);
            };

            var handleToggle = function(evt, data){
                if (!sounds[data.soundId].active){
                    play(data.soundId);

                }
                else if (sounds[data.soundId].paused){
                    resume(data.soundId);
                }
                else {
                    pause(data.soundId);
                }

            };

            var handleReset = function(evt, data){
                if (!sounds[data.soundId].active){
                    play(data.soundId);

                }
                else {
                    stopSound(data.soundId);
                }            
            };

            var handleLoop = function(evt, data){
                sounds[soundId].loop = -1;
                play(soundId);
            };

            var handleLoopToggle = function(evt, data){
                sounds[soundId].loop = -1;
                handleToggle(evt, data);
            };

            var handleStackPlay = function(evt, data){
                createjs.Sound.play(data.soundId);
            };




            //EVENT DISPATCHERS

            var dispatchAll = function(evt){
                _.forEach(sounds, function(value, key){
                    value.dispatchEvent(evt);
                });
            }

            var dispatch = function(evt, soundId){
                sounds[soundId].dispatchEvent(evt);
            }




            var pluginScriptTag = document.getElementById("ceros-soundjs-plugin");
            var soundTag = pluginScriptTag.getAttribute("soundTag");
            var componentsWithSound = cerosExperience.findComponentsByTag(soundTag);
            var componentsWithEvent = cerosExperience.findComponentsByTag("sound-click");
            var rollovers = cerosExperience.findComponentsByTag("sound-rollover");


            _.forEach(componentsWithSound.components, function (soundComponent, soundComponentIndex) {
                // debugger;
                createjs.Sound.registerSound(soundComponent.getPayload(), soundComponent.id);

                sounds[soundComponent.id] = createjs.Sound.createInstance(soundComponent.id);
                sounds[soundComponent.id]['active'] = false;
                sounds[soundComponent.id]['shown'] = false;

                //the data that will be passed to each 
                var data = {'soundId': soundComponent.id};
                //attaches default global listeners
                sounds[soundComponent.id].on("complete", handleComplete, null, false, data);
                sounds[soundComponent.id].on("mute", handleMute, null, false, data);
                sounds[soundComponent.id].on("play", handlePlay, null, false, data);
                sounds[soundComponent.id].on("pause", handlePause, null, false, data);
                sounds[soundComponent.id].on("reset", handleReset, null, false, data);
                sounds[soundComponent.id].on("toggle", handleToggle, null, false, data);
                sounds[soundComponent.id].on("loop", handleLoop, null, false, data);
                sounds[soundComponent.id].on("looptoggle", handleLoopToggle, null, false, data);

            });
            console.log("asdfasdfasdf");
            // console.log(layersWithSound);
            // _.forEach(layersWithSound.layers, function (soundLayer, soundLayerIndex) {
            //     createjs.Sound.registerSound(soundLayer.getPayload(), soundLayer.id);
            //     sounds[soundLayer.id] = createjs.Sound.createInstance(soundLayer.id);
            //     sounds[soundLayer.id]['active'] = false;

            //     //the data that will be passed to each 
            //     var data = {'soundId': soundLayer.id};
            //     //attaches default global listeners
            //     // sounds[soundComponent.id].on("complete", handleComplete, null, false, data);
            //     // sounds[soundComponent.id].on("mute", handleMute, null, false, data);
            //     sounds[soundLayer.id].on("play", handlePlay, null, false, data);
            //     // sounds[soundLayer.id].on("pause", handlePause, null, false, data);
            //     sounds[soundLayer.id].on("reset", handleReset, null, false, data);
            //     // sounds[soundComponent.id].on("toggle", handleToggle, null, false, data);
            //     // sounds[soundComponent.id].on("loop", handleLoop, null, false, data);
            //     // sounds[soundComponent.id].on("looptoggle", handleLoopToggle, null, false, data);

            // });

            // myExperience.subscribe(CerosSDK.EVENTS.SHOWN, function (layer) {
            //     console.log("sasdfasdfasdf");
            //     dispatchEvent("play", layer.id);
            // });      


            // myExperience.subscribe(CerosSDK.EVENTS.HIDDEN, function (layer) {
            //     dispatchEvent("stop", layer.id);
            // });

            //could use debounce if animation ended triggers repeatedly on repeated entry animations
            var shown = false;
            cerosExperience.subscribe(CerosSDK.EVENTS.ANIMATION_STARTED, function (component){

                //console.log(sounds[component.id].shown);
  
                if (!sounds[component.id].shown) {
                    sounds[component.id].shown = true;
                    dispatch("play", component.id);

                    console.log("shown");
                }
                else {
                    sounds[component.id].shown = false;
                    dispatch("pause", component.id);
                    console.log("hidden");
                }
            });

            componentsWithEvent.subscribe(CerosSDK.EVENTS.CLICKED, function (component) {
                var evt;
                var tags = component.getTags();
                _.forEach(tags, function(value, key){
                    if (value.indexOf("event:") > -1){
                        evt = value.slice(6, value.length);
                        dispatch(evt, component.id);
                    }
                    else if (value.indexOf("eventall:") > -1){
                        evt = value.slice(9, value.length);
                        dispatchAll(evt);
                    }
                });
                //dispatch(evt, component.id);  Use for only 
            });





        });
    });
})();





