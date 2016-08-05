
define(['lodash', 'SoundJS', 'modules/helpers'], function (_, createjs, helpers) {
	'use strict';	

	var SoundComponents = function (cerosComponentCollection) {

		this.sounds = {};
		this.soundDefaults = {
			active: false,
			shown: false,
			start: 0,
            duration: null,
            interrupt: true
		};
		this.cerosComponentCollection = cerosComponentCollection;



	};







	SoundComponents.prototype = {

		initialize: function(){

				//console.log(this);

		    _.forEach(this.cerosComponentCollection.components, function (soundComponent, soundComponentIndex) {
	            var componentOptions = helpers.optionsForComponent(soundComponent, this.soundDefaults);
	         	createjs.Sound.registerSound(soundComponent.getPayload(), soundComponent.id);

	            
	            //SET OFFSET AND DURATION HERE, RATHER THAN PASSING DATA AROUND
	            // this.sounds[soundComponent.id] = createjs.Sound.createInstance(soundComponent.id, componentOptions.start, component.Options.duration);
	            this.sounds[soundComponent.id] = createjs.Sound.createInstance(soundComponent.id);

	            //Note, this will not overwrite any original soundComponent options
	            //NOTE: THIS MIGHT NOT WORK DUE TO "this" CHANGING
	            this.sounds[soundComponent.id] = _.defaults(
	            									this.sounds[soundComponent.id],
	            									componentOptions
	            								);

	            this.setEvents(soundComponent.id);


        	}.bind(this));
		},

		setEvents : function (componentId) {

	        //attaches all default listeners
	        this.sounds[componentId].on("complete", this.handleComplete, null, false, componentId);
	        this.sounds[componentId].on("mute", this.handleMute, null, false, componentId);
	        this.sounds[componentId].on("play", this.handlePlay, null, false, componentId);
	        this.sounds[componentId].on("pause", this.handlePause, null, false, componentId);
	        this.sounds[componentId].on("reset", this.handleReset, null, false, componentId);
	        this.sounds[componentId].on("toggle", this.handleToggle, null, false, componentId);
	        this.sounds[componentId].on("loop", this.handleLoop, null, false, componentId);
	        this.sounds[componentId].on("looptoggle", this.handleLoopToggle, null, false, componentId);

	    },


		//Basic mainpulation function used a lot
        //currently disables interrupt, but can change
        play : function(data){
            if (!sounds[data.soundId].active || data.config.interrupt){
                sounds[data.soundId].play(data.config);
                sounds[data.soundId].active = true;

            }
        },

        pause : function(data){
            this.sounds[data].paused = true;
        },

        resume : function(data){
            this.sounds[data].paused = false;
        },

        stopSound : function(data){ // resets song to beginning
            this.sounds[data].stop();
            this.sounds[data].active = false; // note this does not fire 
        },


       // NATIVE EVENTS HANDLERS
        //cleans up extra data handled by us
        handleComplete : function(evt, data){
            this.active = false;
        },


        // EVENT HANDLERS

        handleMute : function(evt, data){
            if (this.muted){
                this.muted = false;
            }
            else {
                this.muted = true;
            }
        },

        handlePlay : function(evt, data){
            this.play(data);
        },

        handlePause : function(evt, data){
            this.paused = true;
        },

        handleToggle : function(evt, data){

            if (!this.active){
                this.play(data);
                this.active = true;

            }
            else if (this.paused){
                this.paused = false;
            }
            else {
                this.paused = true;
            }
        },

        handleReset : function(evt, data){
            if (!this.active){
                this.play(data);
                this.active = true;

            }
            else {            
            	this.stop();
            	this.active = false; // note this does not fire 
            }            
        },

        handleLoop : function(evt, data){
            this.loop = -1;
            this.play(data);
            this.active = true;
        },

        handleLoopToggle : function(evt, data){
            this.loop = -1;
            this.dispatchEvent("toggle");
        },

        handleStackPlay : function(evt, data){
            createjs.Sound.play(data);
        },

        // EVENT DISPATCHERS

        dispatchAll : function (evt) {
            _.forEach(this.sounds, function(value, key){
                value.dispatchEvent(evt);
            }.bind(this));
        },

        dispatch : function (evt, soundIds) {
            for (var i = 0; i < soundIds.length; i++){
                if (this.sounds.hasOwnProperty(soundIds[i])){
                    this.sounds[soundIds[i]].dispatchEvent(evt);
                }
            }
        },

        nameMatch : function (name) {
	        if (this.names.hasOwnProperty(name)){
                return names[name];
            }
            return false;
        }

	};

	return SoundComponents;



});