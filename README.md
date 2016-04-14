# Ceros Plugins
A collection of plugins and integrations for Ceros experiences.

All plugins in this repository are licensed under the MIT license. A copy of the license is included in the LICENSE file.

## Eloqua Plugin

This plugin enables tracking of page views within Ceros experiences in Oracle Eloqua. On each page change, the URL of the page
will be tracked under the configured Eloqua Site ID.

To use this plugin, paste the following code into the "Custom HTML" field of the Ceros experience inside Ceros Studio. You can
access this field via the Settings menu in the upper right - Custom HTML is the third tab inside Settings.

```
<script id="ceros-eloqua-plugin" src="//sdk.ceros.com/eloqua/main-v0.js.gz" siteId="0" cookieDomain=""></script>
```

Then, replace the value of the `siteId` attribute with your Eloqua Site ID. This can be found by clicking on the gear
icon in the upper right of Eloqua, clicking "Setup", and then clicking "Company Defaults". If you have a first-party
cookie domain configured with Eloqua, replace the value of the `cookieDomain` attribute with that domain. Otherwise,
you may leave the value empty or delete the attribute entirely. This will cause the Eloqua cookie to be served as a
third-party cookie. Using a first-party cookie is highly recommended, as most modern browsers will block third party
cookies.