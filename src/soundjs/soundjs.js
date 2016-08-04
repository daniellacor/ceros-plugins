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

            var sounds = {};
            var names = {};

            // BASIC SOUND MANIPULATION FUNCTIONS
            //currently disables interrupt, but can change
            var play = function(data){
                if (!sounds[data.soundId].active || data.config.interrupt){
                    sounds[data.soundId].play(data.config);
                    sounds[data.soundId].active = true;

                }
            };

            var pause = function(data){
                sounds[data.soundId].paused = true;
            };

            var resume = function(data){
                sounds[data.soundId].paused = false;
            };

            var stopSound = function(data){ // resets song to beginning
                sounds[data.soundId].stop();
                sounds[data.soundId].active = false; // note this does not fire 
            };



            // NATIVE EVENTS HANDLERS
            //cleans up extra data handled by us
            var handleComplete = function(evt, data){
                sounds[data.soundId].active = false;
            };


            // EVENT HANDLERS

            var handleMute = function(evt, data){
                if (sounds[data.soundId].muted){
                    sounds[data.soundId].muted = false;
                }
                else {
                    sounds[data.soundId].muted = true;
                }
            };

            var handlePlay = function(evt, data){
                play(data);
            };

            var handlePause = function(evt, data){
                pause(data);
            };

            var handleToggle = function(evt, data){

                if (!sounds[data.soundId].active){
                    play(data);

                }
                else if (sounds[data.soundId].paused){
                    resume(data);
                }
                else {
                    pause(data);
                }
            };

            var handleReset = function(evt, data){
                if (!sounds[data.soundId].active){
                    play(data);

                }
                else {
                    stopSound(data);
                }            
            };

            var handleLoop = function(evt, data){
                sounds[data.soundId].loop = -1;
                play(data);
            };

            var handleLoopToggle = function(evt, data){
                sounds[data.soundId].loop = -1;
                handleToggle(evt, data);
            };

            var handleStackPlay = function(evt, data){
                createjs.Sound.play(data.soundId);
            };



            // EVENT DISPATCHERS

            var dispatchAll = function (evt) {
                _.forEach(sounds, function(value, key){
                    value.dispatchEvent(evt);
                });
            };

            var dispatch = function (evt, soundIds) {
                for (var i = 0; i < soundIds.length; i++){
                    if (sounds.hasOwnProperty(soundIds[i])){
                        sounds[soundIds[i]].dispatchEvent(evt);
                    }
                }
            };

            var acquireTargets = function (component) {

                var tags = component.getTags();
                var targets = [];

                _.forEach(tags, function(value, key){
                    if (value.indexOf("target:") > -1){
                        var target = value.slice(7, value.length);
                        targets.push(target);
                    }     
                });


                //must check if each of the targets is an id or name
                //replaces targets that are names with the component ids
                
                for (var i = 0; i < targets.length; i++){
                    if (names.hasOwnProperty(targets[i])){
                        targets[i] = names[targets[i]];
                    }
                }
                
                if (targets.length == 0) {
                    targets.push(component.id);
                }

                return targets;

            };

            var parseEventTags = function (component){
                var evt = null;

                var tags = component.getTags();

                var soundIds = acquireTargets(component);

                _.forEach(tags, function(value, key){
                    if (value.indexOf("event:") > -1){
                        evt = value.slice(6, value.length);
                        dispatch(evt, soundIds);
                    }
                    else if (value.indexOf("eventall:") > -1){
                        evt = value.slice(9, value.length);
                        dispatchAll(evt);
                    }
                    
                });
            };


            var parseSoundData = function (component) {

  
                var data = {'soundId': component.id, config: {}};

                //Default configs
                var start = 0,
                    duration = null,
                    interrupt = true;


                var tags = component.getTags();

                // POTENTIALLY CHANGE TO SECONDS

                _.forEach(tags, function(value, key){
                    // Check the start time/duration of elements
                    // unit = milliseconds
                    if (value.indexOf("start:") > -1){
                        start = parseInt(value.slice(6, value.length));
                    }
                    else if (value.indexOf("end:") > -1){
                        var end = parseInt(value.slice(4, value.length));
                        duration = end - start;
                    }
                    else if (value.indexOf("name:") > -1) {
                        var name = value.slice(5, value.length);
                        names[name] = component.id;
                    }
                    else if (value.indexOf("interrupt:") > -1) {
                        var val = value.slice(10, value.length);
                        if (val == "false"){
                            interrupt = false;
                        }
                    }
                });

                //Setting configs //interrupt could use more work
                data.config['interrupt'] = interrupt;
                data.config['offset'] = start;
                data.config['duration'] = duration;
                return data;         

            };


            var setEvents = function (componentId, data) {
                //the data that will be passed to each 

                //attaches all default listeners
                sounds[componentId].on("complete", handleComplete, null, false, data);
                sounds[componentId].on("mute", handleMute, null, false, data);
                sounds[componentId].on("play", handlePlay, null, false, data);
                sounds[componentId].on("pause", handlePause, null, false, data);
                sounds[componentId].on("reset", handleReset, null, false, data);
                sounds[componentId].on("toggle", handleToggle, null, false, data);
                sounds[componentId].on("loop", handleLoop, null, false, data);
                sounds[componentId].on("looptoggle", handleLoopToggle, null, false, data);

            };


            var pluginScriptTag = document.getElementById("ceros-soundjs-plugin");
            var soundTag = pluginScriptTag.getAttribute("soundTag");
            var componentsWithSound = cerosExperience.findComponentsByTag(soundTag);
            var componentsWithEvent = cerosExperience.findComponentsByTag("sound-click");


            //Registers all the sounds/ pushes them to the sound storage object.. keys = component id's
            _.forEach(componentsWithSound.components, function (soundComponent, soundComponentIndex) {
                createjs.Sound.registerSound(soundComponent.getPayload(), soundComponent.id);

                
                //SET OFFSET AND DURATION HERE, RATHER THAN PASSING DATA AROUND
                sounds[soundComponent.id] = createjs.Sound.createInstance(soundComponent.id);
                sounds[soundComponent.id]['active'] = false;
                sounds[soundComponent.id]['shown'] = false;  // Used for hover effects

                var data = parseSoundData(soundComponent);

                setEvents(soundComponent.id, data);


            });

            componentsWithEvent.subscribe(CerosSDK.EVENTS.CLICKED, function (component) {
                parseEventTags(component);
            });


        });
    });
})();





