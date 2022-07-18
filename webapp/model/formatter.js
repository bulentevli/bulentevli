sap.ui.define([], function() {
  "use strict";
  return {
    JaneinState: function(sStatus) {
      if (sStatus === "X") {
        return true;
      } else {
        return false;
      }

    },

    isCopy: function(sGUI) {
      if (sGUI !== "00000000-0000-0000-0000-000000000000") {
        return 'Kopiert';
      } else {
        return '';
      }

    },

    CopyControl: function(sStatus, sErstelldatum) {
        return true;
/*
        if (sStatus === "02") {
        if (Math.round((new Date().getTime() - sErstelldatum.getTime()) / (1000 * 3600 * 24)) > 365) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
*/
    },

    statusIcon: function(sStatus) {
      switch (sStatus) {
        case "00":
          return "sap-icon://edit";
        case "01":
          return "sap-icon://edit";
        case "02":
          return "sap-icon://display";
        default:
          return sStatus;
      }
    },

    statusAltText: function(sStatus) {
      switch (sStatus) {
        case "00":
          return "Änderbar";
        case "01":
          return "Nur Online Maßnahmenliste änderbar";
        case "02":
          return "Nur Anzeigen";
        default:
          return sStatus;
      }
    },

    statusText: function(sStatus, imodel) {
      var resourceBundle;
      if (imodel === undefined) {
        resourceBundle = this.getView().getModel("i18n").getResourceBundle();
      } else {
        resourceBundle = imodel.getResourceBundle();
      }

      switch (sStatus) {
        case "00":
          return resourceBundle.getText("label.Status00");
        case "01":
          return resourceBundle.getText("label.Status01");
        case "02":
          return resourceBundle.getText("label.Status02");
        default:
          return sStatus;
      }
    }
  };
});