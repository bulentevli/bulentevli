sap.ui.define([
    "project1/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "project1/model/formatter",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
    "sap/m/ComboBox",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/PDFViewer",
    "sap/m/MessageBox",
    "sap/ui/layout/form/SimpleForm"
], function (BaseController, Filter, FilterOperator, formatter, MessageToast, Dialog, DialogType, Button, ButtonType, Text, ComboBox,
    Label, Input, PDFViewer, MessageBox, SimpleForm) {
    "use strict";

    return BaseController.extend("project1.controller.Worklist", {
        formatter: formatter,
        onInit: function () {
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            if (this.getOwnerComponent().getComponentData() !== undefined) {
                var startupParameters = this.getOwnerComponent().getComponentData().startupParameters;
                if (!this._isEmpty(startupParameters)) {
                    if (startupParameters.new[0] === "X") {
                        oRouter.navTo("object", {
                            guid: 0,
                            step: "U",
                            burks: 0
                        });
                    }
                }
            }
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);
         },
 


        onDetail: function (oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            this.guid = oEvent.getSource().getBindingContext().getObject().Gbid;

            if (oEvent.getSource().getBindingContext().getObject().Status === "00") {
                oRouter.navTo("object", {
                    guid: this.guid,
                    step: "U",
                    burks: oEvent.getSource().getBindingContext().getObject().Bukrs
                });
            } else {
                oRouter.navTo("closing", {
                    guid: this.guid,
                    first: 0
                });
            }
        },

        onPrintPdf: function (oEvent) {
            var okey = oEvent.getSource().getParent().oBindingContexts.undefined.getObject().Gbid;
            var sRead = "/PDF_DOKUMENTCollection('" + okey + "')/$value";
            var sServiceURL = this.getView().getModel().sServiceUrl;
            var sSource = sServiceURL + sRead;

            this._pdfViewer.setSource(sSource);
            this._pdfViewer.setTitle(this.oResourceBundle.getText("button.label.pdfAus"));
            this._pdfViewer.open();

        },
        onPrintAbschPdf: function (oEvent) {
            var okey = oEvent.getSource().getParent().oBindingContexts.undefined.getObject().Gbid;
            var sRead = "/PDF_ABSCHLUSSCollection('" + okey + "')/$value";
            var sServiceURL = this.getView().getModel().sServiceUrl;
            var sSource = sServiceURL + sRead;
            this._pdfViewer.setSource(sSource);
            this._pdfViewer.setTitle(this.oResourceBundle.getText("button.label.pdfDok"));
            this._pdfViewer.open();
        },
        onPrintLocalPdf: function (oEvent) {
            var okey = oEvent.getSource().getParent().oBindingContexts.undefined.getObject().Gbid;
            var sRead = "/PDF_LOCALDOKCollection('" + okey + "')/$value";
            var sServiceURL = this.getView().getModel().sServiceUrl;
            var sSource = sServiceURL + sRead;
            this._pdfViewer.setSource(sSource);
            this._pdfViewer.setTitle(this.oResourceBundle.getText("button.label.pdfMaß"));
            this._pdfViewer.open();
        },

        _isEmpty: function (obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key))
                    return false;
            }
            return true;
        },

        onApproveDelete: function (oEvent) {
            if (!this.oApproveDialog) {
                this.oApproveDialog = new Dialog({
                    type: DialogType.Message,
                    title: "Bestätigen",
                    content: new Text({
                        text: this.oResourceBundle.getText("message.label01")
                    }),
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Ja",
                        press: function (oEvent) {
                            this.onDelete(oEvent.getSource().getBindingContext().getObject().Gbid);
                            this.oApproveDialog.close();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Nein",
                        press: function () {
                            this.oApproveDialog.close();
                        }.bind(this)
                    })
                });
            }
            this.oApproveDialog.setBindingContext(oEvent.getSource().getBindingContext());
            this.oApproveDialog.open();
        },
        onDelete: function (guid) {
            var that = this;
            var oModel = this.getView().getModel();

            oModel.remove("/KOPFDATENSet(guid'" + guid + "')", {
                method: "DELETE",
                success: function (data) {
                    MessageToast.show(that.oResourceBundle.getText("MessageToast.fkdelete"));
                },
                error: function (e) {
                    MessageToast.show(that.oResourceBundle.getText("MessageToast.fkdeleteError"));
                }
            });

        },

        onUpdateFinished: function (e) {
            var oSource = e.oSource;
            var oItems = e.oSource.getItems();
            if (oItems.length > 0) {
                oSource.setSelectedItem(oItems[0]);
            }
        },

        onGoToLinks: function (oEvent) {
            var oButton = oEvent.getSource();
            this.onPopupLink().openBy(oButton);
        },

        onPopupLink: function () {
            if (!this._oDialogLink) {
                this._oDialogLink = sap.ui.xmlfragment("ZFIORI05.ZFIORI05.fragment.StatusPopup", this);
                this.getView().addDependent(this._oDialogLink);
            }
            return this._oDialogLink;
        },

        onClear: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("object", {
                guid: 0,
                step: "U",
                burks: 0
            });
        },

        onCopy: function (oEvent) {
            if (!this.oConfirmDialog) {
                this.oConfirmDialog = new Dialog({
                    type: DialogType.Message,
                    title: "Kopiervorlage",
                    content: [
                        new SimpleForm({
                            minWidth: 1024,
                            maxContainerCols: 2,
                            editable: true,
                            content: [
                                new Label({
                                    text: "Teambezeichnung",
                                    labelFor: "Teambezeichnung",
                                    required: true
                                }),
                                new ComboBox({
                                    valueStateText: "Teambezeichnung",
                                }).bindAggregation("items", "/TEAMPLANSet", new sap.ui.core.ListItem({
                                    text: "{Orgetxt} ({Gbukrs})",
                                    key: "{Orgetxt} ({Gbukrs})"
                                })),
                                new Label({
                                    text: "Arbeitsstellenbezeichnung",
                                    labelFor: "Arbeitsstellenbezeichnung",
                                    required: true
                                }),
                                new ComboBox({
                                    valueStateText: "Teambezeichnung",
                                }).bindAggregation("items", "/ARBEITSSTELLENSet", new sap.ui.core.ListItem({
                                    text: "{ArbeitTxt}",
                                    key: "{ArbeitTxt}"
                                })),

                                new Label({
                                    text: "Beschreibung",
                                    labelFor: "Beschreibung"
                                }),
                                new Input({
                                    value: "{Beschreib}"
                                })
                            ]
                        }),
                        new Text({
                            text: "Sie haben hier die Möglichkeit, die bisherige GB-Zuordnung als Kopiervorlage für eine neue GB-Zuordnung zu verwenden."
                        })
                    ],
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Ja",
                        press: function (oEvent) {
                            var oModel = this.getView().getModel();
                            var guid = oEvent.getSource().getBindingContext().getObject().Gbid;
                            var Teambezeich = this.oConfirmDialog.getContent()[0].getContent()[1].getValue();
                            var Arbeitsplatzbezeichnung = this.oConfirmDialog.getContent()[0].getContent()[3].getValue().substring(0, 70);
                            var Beschreibung = this.oConfirmDialog.getContent()[0].getContent()[5].getValue();
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                            if (Arbeitsplatzbezeichnung === "") {
                                MessageToast.show(
                                    "Arbeitsstellenbezeichnung ist ein Mussfeld, bitte ausfüllen.", {
                                    duration: 15000
                                });
                                return;
                            }

                            oModel.callFunction(
                                "/COPY_DOKU", {
                                method: "POST",
                                urlParameters: {
                                    "Gbid": guid,
                                    "teambezeich": Teambezeich,
                                    "tatigkeits": Arbeitsplatzbezeichnung,
                                    "beschreib": Beschreibung
                                },
                                success: function (oData, response) {
                                    oRouter.navTo("object", {
                                        guid: oData.Gbid,
                                        step: "C",
                                        burks: oData.Bukrs
                                    });
                                },
                                error: function (oError) {
                                    var oJson = JSON.parse(oError.responseText);
                                    oJson = JSON.parse(oError.responseText);
                                    MessageBox.information(oJson.error.message.value);
                                }
                            });

                            this.oConfirmDialog.close();
                            this.oConfirmDialog = null;
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Nein",
                        press: function () {
                            this.oConfirmDialog.close();
                            this.oConfirmDialog = null;
                        }.bind(this)
                    })
                });
            }
            this.oConfirmDialog.setModel(this.getOwnerComponent().getModel());
            this.oConfirmDialog.setBindingContext(oEvent.getSource().getBindingContext());
            this.oConfirmDialog.getContent()[0].getContent()[1].setSelectedKey(oEvent.getSource().getBindingContext().getObject().Teambezeich);
            this.oConfirmDialog.open();
        }

    });

});