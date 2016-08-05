
define(['lodash', 'SoundJS', 'modules/helpers', 'modules/SoundComponent'], function (_, createjs, helpers, SoundComponent) {
	'use strict';	

	var SoundComponents = function (cerosComponentCollection) {

		this.sounds = {};
		this.names = {};

		this.cerosComponentCollection = cerosComponentCollection;


	    _.forEach(this.cerosComponentCollection.components, function (soundComponent, soundComponentIndex) {
            

            
            //SET OFFSET AND DURATION HERE, RATHER THAN PASSING DATA AROUND
            // this.sounds[soundComponent.id] = createjs.Sound.createInstance(soundComponent.id, componentOptions.start, component.Options.duration);
            this.sounds[soundComponent.id] = new SoundComponent(soundComponent);
            if (this.sounds[soundComponent.id].getName()){
            	names[this.sounds[soundComponent.id].getName()] = soundComponent.id;
            }


    	}.bind(this));

	};

	SoundComponents.prototype = {


        // EVENT DISPATCHERS

        dispatchAll : function (evt) {
            _.forEach(this.sounds, function(value, key){
                value.dispatch(evt);
            });
        },

        dispatch : function (evt, soundIds) {
            for (var i = 0; i < soundIds.length; i++){
                if (this.sounds.hasOwnProperty(soundIds[i])){
                    this.sounds[soundIds[i]].dispatch(evt);
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