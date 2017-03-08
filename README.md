# Ceros Plugins
A collection of plugins and integrations for Ceros experiences.

All plugins in this repository are licensed under the MIT license. A copy of the license is included in the LICENSE file.

## Eloqua Plugin

This plugin enables tracking of page views within Ceros experiences in Oracle Eloqua. On each page change, the URL of the page
will be tracked under the configured Eloqua Site ID.

### How to use this plugin:

Paste the following code into the "Custom HTML" field of the Ceros experience inside Ceros Studio. You can
access this field via the Settings menu in the upper right - Custom HTML is the third tab inside Settings.

```
<script id="ceros-eloqua-plugin" src="//sdk.ceros.com/eloqua/main-v0.js" siteId="0" cookieDomain=""></script>
```

Then, replace the value of the `siteId` attribute with your Eloqua Site ID. This can be found by clicking on the gear
icon in the upper right of Eloqua, clicking "Setup", and then clicking "Company Defaults". If you have a first-party
cookie domain configured with Eloqua, replace the value of the `cookieDomain` attribute with that domain. Otherwise,
you may leave the value empty or delete the attribute entirely. This will cause the Eloqua cookie to be served as a
third-party cookie. Using a first-party cookie is highly recommended, as most modern browsers will block third party
cookies.

## SoundJs Plugin

Uses the [SoundJs](http://www.createjs.com/soundjs) library to enable people using the Ceros Studio to create an experience that will play a sound when
an object is clicked.

The sound file must be hosted on a server that allows [cross origin requests](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)

### How to use this plugin:

1. Paste the following code into the "Custom HTML" field of the Ceros experience inside Ceros Studio.
```
<script id="ceros-soundjs-plugin" src="//sdk.ceros.com/soundjs/main-v0.js" soundTag="playsound"></script>
```
2. Tag a component with 'playsound' in the SDK panel
3. Set the Payload to the URL of the sound file

## Highlander Plugin

There can be only one (layer visible at a time)
This plugin allows you to define a group of layers, where only 1 layer in the group can be visible at a time.
If any layer in the group is shown, then all other layers in the group will be automatically hidden.
The groups are defined using the SDK panel to give each layer in the group the same tag.

### How to use this plugin:

1. Tag each layer in your group
1. Paste the following code into the "Custom HTML" field of the Ceros experience inside Ceros Studio.
```
<script id="ceros-highlander-plugin" src="//sdk.ceros.com/highlander/main-v0.js" highlanderTags="your,tags,here"></script>
```
1. Update the highlanderTags attribute on the script tag with the tags that you've used in step 1


## Marketo Munchkin Plugin

Uses the [Marketo Munchkin Lead Tracking](http://developers.marketo.com/documentation/websites/lead-tracking-munchkin-js/) to send page view data to your Marketo account.

All lead associations will be based on the domain of the experience being viewed (view.ceros.com or a vanity domain).

### How to use this plugin:

1. Paste the following code into the "Custom HTML" field of the Ceros experience inside Ceros Studio.
```
<script id="ceros-marketo-munchkin-plugin" src="//sdk.ceros.com/marketo-munchkin/main-v0.js" accountId="AAA-111-BBB"></script>
```
2. Replace the value of the accountId attribute with your marketo munchkin Id

## Youtube Pauser Plugin

1. Follow instructions here: [Youtube Pause Doc](https://docs.google.com/a/ceros.com/document/d/1qFUz8y3Ucw0aimUWXNFVNW2bZTM7cfiMcOP17tK1haE/edit?usp=sharing)
