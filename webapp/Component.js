sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "project1/model/models",
        "project1/controller/ErrorHandler"
    ],
    function (UIComponent, Device, models, ErrorHandler) {
        "use strict";

        return UIComponent.extend("project1.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function() {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);
    
                // set the device model
                this.setModel(models.createDeviceModel(), "device");
    
                this._busyIndicator();
    
                // create the views based on the url/hash
                this.getRouter().initialize();
            },
            _busyIndicator: function() {
                var sDelay = 1000;
                this._busyIndicatorManipulation(sDelay);
            },
    
            _busyIndicatorManipulation: function(sDelay) {
                var sDelay = 100;
                var aModels = Object.keys(this.oModels);
                var sODataClass = "sap.ui.model.odata.v2.ODataModel";
                for (var i = 0; i < aModels.length; i++) {
                    var sModel = aModels[i];
                    if (sModel === "undefined") {
                        sModel === "";
                    }
                    var sModelClass = this.getModel(sModel).getMetadata()._sClassName;
                    if (sModelClass === sODataClass) {
    
                        //show busy
                        this.getModel(sModel).attachRequestSent(function(oevent) {
                            sap.ui.core.BusyIndicator.show(sDelay);
                        });
                        //hide busy
                        this.getModel(sModel).attachRequestCompleted(function(oevent) {
                            sap.ui.core.BusyIndicator.hide();
                        });
                        //hide busy if request is failed
                        this.getModel(sModel).attachRequestFailed(function(oevent) {
                            sap.ui.core.BusyIndicator.hide();
                        });
                    }
    
                }
    
            },
    
            /**
             * The component is destroyed by UI5 automatically.
             * In this method, the ErrorHandler is destroyed.
             * @public
             * @override
             */
            destroy: function() {
                UIComponent.prototype.destroy.apply(this, arguments);
            },
    
    
            /**
             * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
             * design mode class should be set, which influences the size appearance of some controls.
             * @public
             * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
             */
            getContentDensityClass: function() {
                if (this._sContentDensityClass === undefined) {
                    // check whether FLP has already set the content density class; do nothing in this case
                    if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
                        this._sContentDensityClass = "";
                    } else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
                        this._sContentDensityClass = "sapUiSizeCompact";
                    } else {
                        // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
                        this._sContentDensityClass = "sapUiSizeCozy";
                    }
                }
                return this._sContentDensityClass;
            }            
        });
    }
);