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


            var play = function(soundId){
                sounds[soundId].play();
                sounds[soundId].active = true;

            };

            var toggle = function(soundId){

                if (!sounds[soundId].active){
                    play(soundId);

                }
                else if (sounds[soundId].paused){
                    resume(soundId);
                }
                else {
                    pause(soundId);
                }

            };

            var pause = function(soundId){
                sounds[soundId].paused = true;
            };

            var resume = function(soundId){
                sounds[soundId].paused = false;
            };

            var stackPlay = function(soundId){
                createjs.Sound.play(soundId);
            };

            var stop = function(soundId){
                sounds[soundId].stop();
                sounds[soundId].active = false; //note this does not fire 
            };

            var loop = function(soundId){
                sounds[soundId].loop = -1;
                play(soundId);
            };

            var loopToggle = function(soundId){
                sounds[soundId].loop = -1;
                if (!sounds[soundId].active){
                    play(soundId);

                }
                else if (sounds[soundId].paused){
                    resume(soundId);
                }
                else {
                    pause(soundId);
                }                
            }

            var mute = function(soundId){
                console.log(sounds[soundId].muted);
                if (sounds[soundId].muted){
                    sounds[soundId].muted = false;
                }
                else {
                    sounds[soundId].muted = true;
                }
            }


            //EVENT HANDLERS

            var handleComplete = function(evt, data){
                sounds[data.soundId].active = false;
            };

            var handleMute = function(evt, data){
                mute(data.soundId);
            };

            var handlePlay = function(evt, data){
                play(data.soundId);
            };

            var handlePause = function(evt, data){
                pause(data.soundId);
            };

            var handleToggle = function(evt, data){
                toggle(data.soundId);
            };

            var handleStop = function(evt, data){
                stop(data.soundId);
            };

            var handleLoop = function(evt, data){
                loop(data.soundId);
            };

            var handleLoopToggle = function(evt, data){
                loopToggle(data.soundId);
            };

            //EVENT DISPATCHER

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


            jQuery.each(componentsWithSound.components, function (soundComponentIndex, soundComponent) {
                createjs.Sound.registerSound(soundComponent.getPayload(), soundComponent.id);
                sounds[soundComponent.id] = createjs.Sound.createInstance(soundComponent.id);
                sounds[soundComponent.id]['active'] = false;

                //the data that will be passed to each 
                var data = {'soundId': soundComponent.id};
                //attaches default global listeners
                sounds[soundComponent.id].on("complete", handleComplete, null, false, data);
                sounds[soundComponent.id].on("mute", handleMute, null, false, data);
                sounds[soundComponent.id].on("play", handlePlay, null, false, data);
                sounds[soundComponent.id].on("pause", handlePause, null, false, data);
                sounds[soundComponent.id].on("stop", handleStop, null, false, data);
                sounds[soundComponent.id].on("toggle", handleToggle, null, false, data);
                sounds[soundComponent.id].on("loop", handleLoop, null, false, data);
                sounds[soundComponent.id].on("looptoggle", handleLoopToggle, null, false, data);

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





