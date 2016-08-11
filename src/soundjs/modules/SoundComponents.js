define(['lodash', 'Howler', 'modules/helpers', 'modules/SoundComponent'], function(_, Howler, helpers, SoundComponent) {
    'use strict';


    /**
     * Called whenever a sound file is loaded
     * Triggers playback for background sounds, and enables events for all sounds
     *
     * @param {createJs.Event} evt Event data that triggered this call
     * @param {SoundComponents} data The collection of SoundComponent(s) being loaded
     */
    var handleLoad = function(evt, data) {

        var soundComponent = data[evt.id];

        soundComponent.sound.eventsEnabled = true;
        if (soundComponent.sound.hasOwnProperty("background")) {
            soundComponent.dispatch(soundComponent.sound.background);
        }

    };

    /**
     * Initializes a collection of SoundComponent(s), stores a director of names:ids
     *
     * @param {CerosSDK.CerosComponentCollection} cerosComponentCollection The collection of CerosComponents that contain sound files
     */
    var SoundComponents = function(cerosComponentCollection) {

        // Object to hold all of the SoundComponent(s)
        this.sounds = {};
        // Object to hold all of the name:id pairs
        this.names = {};

        this.sources = {};

        this.cerosComponentCollection = cerosComponentCollection;

        // // Attaches the listener for file loads
        // createjs.Sound.on("fileload", handleLoad, null, false, this.sounds); //pass in the sounds obj as "data"	        	

        //TODO check what happens with empty payload
        _.forEach(this.cerosComponentCollection.components, function(soundComponent, soundComponentIndex) {

            var url = soundComponent.getPayload();
            //WIP This improves load times, as different howls with same source won't be loaded twice
            // if (!(this.sources.hasOwnProperty(url))){
            //     // Creates a sound instance of the loaded file
            //     this.sources[url] = new Howl({
            //         src: [url]
            //     });
            // }     

            // var howl = _.cloneDeep(this.sources[url]);      

            var howl = new Howl({
                src: [url]
            });
            this.sounds[soundComponent.id] = new SoundComponent(soundComponent, howl);
            if (this.sounds[soundComponent.id].getName()) {
                this.names[this.sounds[soundComponent.id].getName()] = soundComponent.id;
            }

        }.bind(this));

    };

    SoundComponents.prototype = {


        /**
         * Dispatches the event to every sound in this.sounds
         *
         * @param {CreateJs.Event} evt Event that will be dispatched
         */
        dispatchAll: function(evt) {
            _.forEach(this.sounds, function(value, key) {
                value.dispatch(evt);
            });
        },

        /**
         * Dispatches the event to every sound specified
         *
         * @param {CreateJs.Event} evt Event that will be dispatched
         * @param {Array} soundIds The ids of the sounds to dispatch event to
         */
        dispatch: function(evt, soundIds) {
            for (var i = 0; i < soundIds.length; i++) {
                // Verifies that there is a sound for each id before dispatching event
                if (this.sounds.hasOwnProperty(soundIds[i])) {
                    this.sounds[soundIds[i]].dispatch(evt);
                }
            }
        },

        // Returns the Id of a sound with the given name, if none exists, returns false

        /**
         * Returns the Id of a sound with the given name, if none exists, returns false
         *
         * @param {String} name Name that will be checked for a match
         * @returns {String || Boolean} 
         */
        nameMatch: function(name) {
            if (this.names.hasOwnProperty(name)) {
                return this.names[name];
            }
            return false;
        }

    };

    return SoundComponents;



});