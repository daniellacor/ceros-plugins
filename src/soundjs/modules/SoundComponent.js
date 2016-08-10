
define(['lodash', 'SoundJS', 'modules/helpers'], function (_, createjs, helpers) {
	'use strict';	


    /**
     * Custom function for playing sounds
     * If sound is already playing, and this.interrupt is true, the sound is interrupted and played again
     */
	var cerosPlay = function () {

  		// var ppc = new createjs.PlayPropsConfig().set({interrupt:createjs.Sound.INTERRUPT_ANY});

  		if (this.interrupt){
	        this.cerosInterrupt();
    	}

    	this.play();
    	this.active = true;
	};



    /**
     * If sound is already playing, stops sound and plays it from beginning
     */
	var cerosInterrupt = function () {
	    if (this.active){           
        	this.stop();
        	this.active = false; // note this does not fire 
        	this.cerosPlay();
        }   
	};


    /**
     * Starts playback without checking for interrupt, used for background noises
     * @param {CreateJs.Event} evt Event data that triggered this call
     * @param {CreateJs.AbstractSoundInstance} evt Event data that triggered this call
     */
	var backgroundPlay = function (evt, data) {
        data.play();
        data.active = true;
	};

    /**
     * Starts playback on loop without checking for interrupt, used for background noises
     */
	var backgroundLoop = function (evt, data) {
		data.loop = -1;
		data.active = true;
		data.play();
	};

	/*
	 * Class that holds the SoundJs sound Object as well as other options
	 * Sounds are stored as a CreateJs.AbstractSoundInstance
	 * Contains every method related to handling playback events
	 * @param {CerosComponent} cerosComponent The component whose payload/tags will be used to create the SoundComponent
	 */
	var SoundComponent = function (cerosComponent) {

		//Defaults settings for sounds
		this.soundDefaults = {
			eventsEnabled: false,
			active: false,
			shown: false,
			start: 0,
            duration: null,
            interrupt: true
		};

		this.cerosComponent = cerosComponent;
		this.id = cerosComponent.id;
		this.payload = cerosComponent.getPayload();

      	var componentOptions = helpers.optionsForComponent(this.cerosComponent, this.soundDefaults);
     	

      	// Registers and starts loading of sound file (does not redownload previously loaded files)
     	createjs.Sound.registerSound(this.payload, this.id);

     	// Creates a sound instance of the loaded file
        this.sound = createjs.Sound.createInstance(cerosComponent.id, componentOptions.start, componentOptions.duration);


        //Note, this will not overwrite any original soundComponent options
        this.sound = _.defaults(
						this.sound,
						componentOptions
					);

        // Attaches the cerosPlay and cerosInterrupt function to this.sound
        // Done to make things neater because dispatchEvent changes the context of this
        this.sound['cerosPlay'] = cerosPlay;
        this.sound['cerosInterrupt'] = cerosInterrupt;

        this.setEvents();

	};






	SoundComponent.prototype = {

        /**
         * Attaches listeners for every event on this.sound
         */
		setEvents : function () {

			// "complete" is a native event, thrown when a sound finishes playing
	        this.sound.on("complete", this.handleComplete);

	        // custom events that can be triggered through component events
	        this.sound.on("mute", this.handleMute);
	        this.sound.on("play", this.handlePlay);
	        this.sound.on("pause", this.handlePause);
	        this.sound.on("reset", this.handleReset);
	        this.sound.on("toggle", this.handleToggle);
	        this.sound.on("loop", this.handleLoop);
	        this.sound.on("looptoggle", this.handleLoopToggle);

	    },



        /**
         * Called when sound finishes playing.  Is not called when sound loops.
         * Used to clean up extra stuff not handled natively
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        handleComplete : function(evt){
            this.active = false;
        },


        // EVENT HANDLERS

        /**
		 * Toggles the volume on a sound
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        handleMute : function(evt){

            if (this.muted){
                this.muted = false;
            }
            else {
                this.muted = true;
            }
        },

        /**
		 * Plays the sound
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        handlePlay : function(evt){
            this.cerosPlay();
        },

        /**
		 * Pauses the sound
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        handlePause : function(evt){
            this.paused = true;
        },

        /**
		 * Plays the sound. Subsequent clicks will pause/play the sound
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        handleToggle : function(evt){

            if (!this.active){
                this.cerosPlay();
                this.active = true;

            }
            else if (this.paused){
                this.paused = false;
            }
            else {
                this.paused = true;
            }
        },

        /**
		 * Resets and plays the sound from the beginning
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        handleReset : function(evt){

            if (!this.active){
                this.cerosPlay();
                this.active = true;

            }
            else {            
            	this.stop();
            	this.active = false; 
            }            
        },

        /**
		 * Plays the sound and sets it to loop indefinitely.
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        handleLoop : function(evt){
            this.loop = -1;
            this.cerosPlay();
        },

        /**
		 * Plays the sound(s) and sets it to loop indefinitely.  Subsequent clicks will play/pause the sound.
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        handleLoopToggle : function(evt){
            this.loop = -1;
            this.dispatchEvent("toggle");
        },



        /**
		 *	Dispatches the event to this.sound
		 *
     	 * @param {CreateJs.Event} evt Event data that triggered this call
         */
        dispatch : function (evt) {
        	// NOTE: dispatchEvent, sends the object it is called on as "this" to the handle function.
        	// in this case this.sound becomes this in the handle function
        	if (this.sound.eventsEnabled){
	        	this.sound.dispatchEvent(evt);        		
        	}
        },

        /**
		 * If component has name tag, returns name, otherwise returns false
		 * @returns {String || Boolean}
         */
        getName : function () {
        	if (this.hasOwnProperty("name")){
        		return this.name;
        	}
        	return false;
        }



	};

	return SoundComponent;



});