# Ceros Plugins
A collection of plugins and integrations for Ceros experiences.

## Eloqua Plugin

This plugin enables tracking of page views within Ceros experiences in Oracle Eloqua. On each page change, the URL of the page
will be tracked under the configured Eloqua Site ID.

To use this plugin, paste the following code into the "Custom HTML" field of the Ceros experience inside Ceros Studio. You can
access this field via the Settings menu in the upper right - Custom HTML is the third tab inside Settings.

```
<script id="ceros-eloqua-plugin" src="sdk.ceros.com/plugins/eloqua.js" siteId="0" cookieDomain="" />
```

Then, replace the value of the `siteId` attribute with your Eloqua Site ID. This can be found by clicking on the gear
icon in the upper right of Eloqua, clicking "Setup", and then clicking "Company Defaults". If you have a first-party
cookie domain configured with Eloqua, replace the value of the `cookieDomain` attribute with that domain. Otherwise,
you may leave the value empty or delete the attribute entirely. This will cause the Eloqua cookie to be served as a
third-party cookie. 

If you wish to use this plugin with a Ceros experience that has been embedded in your own page, one additional attribute
should be added:

```
<script id="ceros-eloqua-plugin" src="sdk.ceros.com/plugins/eloqua.js" siteId="0" cookieDomain="" experienceId="my-experience-id" />
```

The ID of your experience can be found in the SDK panel inside Ceros Studio.