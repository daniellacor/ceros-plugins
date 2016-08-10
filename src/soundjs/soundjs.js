/**
 * Ceros Plugin for SoundJS
 * @version !!!!!!! UPDATE was 0.2.0
 * @support support@ceros.com
 *
 * This plugin enables people using the Ceros Studio to create an experience
 * with sounds/background sounds that can be paused/played/looped etc. using the SoundJs library
 * http://www.createjs.com/soundjs
 *
 * The sound file must be hosted on a server that allows cross origin requests
 *
 * To use the plugin: READ THE DOCS
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
            lodash: "https://cdn.jsdelivr.net/lodash/4.14.0/lodash.min",
            modules: "//10.0.20.134:8080/Plugins/ceros-plugins/src/soundjs/modules"
        }
        
    });

    require([
        'CerosSDK', 
        'SoundJS', 
        'lodash',
        'modules/SoundComponents'
        ], function (CerosSDK, createjs, _, SoundComponents) {
        CerosSDK.findExperience().done(function(cerosExperience) {


            /**
             * Finds the targets of an event component, based on its tags
             *
             * @param {CerosSDK.CerosComponent} component
             */
            var acquireTargets = function (component) {

                var tags = component.getTags();
                var targets = [];

                _.forEach(tags, function(value, key){
                    if (value.indexOf("target:") > -1){
                        var target = value.slice(7, value.length);
                        targets.push(target);
                    }     
                });


                // Check if each of the targets is an id or name
                for (var i = 0; i < targets.length; i++){

                    // If name, replaces with the corresponding sound id
                    if (sounds.nameMatch(targets[i])){
                        targets[i] = sounds.nameMatch(targets[i]);
                    }
                }
                
                if (targets.length == 0) {
                    targets.push(component.id);
                }

                return targets;

            };


            
            /**
             * Dispatches the events from the component tags
             *
             * @param {CerosSDK.CerosComponent} component
             */
            var parseEventTags = function (component){
                var evt = null;

                var tags = component.getTags();

                var soundIds = acquireTargets(component);

                _.forEach(tags, function(value, key){
                    if (value.indexOf("event:") > -1){
                        evt = value.slice(6, value.length);
                        sounds.dispatch(evt, soundIds);
                    }
                    else if (value.indexOf("eventall:") > -1){
                        evt = value.slice(9, value.length);
                        sounds.dispatchAll(evt);
                    }
                    
                });
            };


            var pluginScriptTag = document.getElementById("ceros-soundjs-plugin");
            var soundTag = pluginScriptTag.getAttribute("soundTag");
            var componentsWithSound = cerosExperience.findComponentsByTag(soundTag);
            var componentsWithEvent = cerosExperience.findComponentsByTag("sound-click");

            //creates the SoundComponents object that holds all of the soundjs sounds
            var sounds = new SoundComponents(componentsWithSound);

            componentsWithEvent.subscribe(CerosSDK.EVENTS.CLICKED, function (component) {
                parseEventTags(component);
            });


        });
    });
})();

