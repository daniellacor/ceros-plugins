/**
 * Ceros Plugin for HowlerJs
 */

(function() {

    require.config({


        paths: { 
            CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v3",        
            Howler : "https://cdnjs.cloudflare.com/ajax/libs/howler/2.0.0/howler",
            lodash: "https://cdn.jsdelivr.net/lodash/4.14.0/lodash.min",
            modules: "http://10.0.20.134:8080/Experiences/HowlerTest/modules"
        }
        
    });

    require([
        'CerosSDK', 
        'Howler', 
        'lodash',
        'modules/SoundComponents'
        ], function (CerosSDK, Howler, _, SoundComponents) {
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


            // var pluginScriptTag = document.getElementById("ceros-soundjs-plugin");
            // var soundTag = pluginScriptTag.getAttribute("soundTag");
            var componentsWithSound = cerosExperience.findComponentsByTag("playsound");
            var componentsWithEvent = cerosExperience.findComponentsByTag("sound-click");

            //creates the SoundComponents object that holds all of the soundjs sounds
            var sounds = new SoundComponents(componentsWithSound);
            console.log(sounds);

            componentsWithEvent.subscribe(CerosSDK.EVENTS.CLICKED, function (component) {
                parseEventTags(component);
            });


        });
    });
})();

