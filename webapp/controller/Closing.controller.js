sap.ui.define([
    "project1/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "project1/model/formatter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/PDFViewer",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
    "sap/m/Popover",
    "sap/m/FormattedText",
    "sap/m/ResponsivePopover",
    "sap/m/TextArea"    
], function (BaseController, Filter, FilterOperator, formatter, MessageToast, MessageBox, PDFViewer, Dialog, DialogType, Button,
    ButtonType, Text, Popover, FormattedText, ResponsivePopover, TextArea) {
    "use strict";

    return BaseController.extend("project1.controller.Closing", {
        formatter: formatter,
        onInit: function () {
            var that = this;
            var oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel);
            that.getOwnerComponent().getRouter().getRoute("closing").attachPatternMatched(that._onRouteMatched, that);
            this.guid = "";
            this.first = "";

            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);

            if (sap.ushell !== undefined) {
                this.isDataChanged = sap.ushell.Container.getDirtyFlag();
                this.WContainer = sap.ushell.Container;
            } else {
                this.isDataChanged = "";
                this.WContainer = "";
            };

            this.byId("link_internet").addEventDelegate({
                onmouseover: this.onGoToLinks
            }, this);

        },
        _onRouteMatched: function (evt) {
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd/MM/yyyy"
            });
            var that = this;
            var aFilters = [];
            var oModel = this.getView().getModel();
            var txtAuftrag = this.byId("txtAuftrag");
            var txtStatus = this.byId("txtStatus");
            var txtDatum = this.byId("txtDatum");
            var btnSave = this.byId("btnSave");
            var btnAbsch = this.byId("btnAbsch");
            var txtArbeit = this.byId("txtArbeit");
            var txtTeam = this.byId("txtTeam");
            var btnpdf03 = this.byId("btnpdf03");
            var txtBeschreibung = this.byId("txtBeschreibung");
            var isSaved = this.byId("isSaved");

            this.guid = evt.getParameter("arguments").guid;
            this.first = evt.getParameter("arguments").first;

            if (this.first === "1") {
                this.PopupInfom1();
            }

            aFilters.push(new Filter("Gbid", FilterOperator.EQ, this.guid));

            var oList = this.getView().byId("Protokoll02");
            var oBinding = oList.getBinding("items");
            oList.getModel().refresh(true);
            oBinding.filter(aFilters, {
                mode: sap.ui.model.odata.OperationMode.Client
            });

            // Sorting & Grouping snippet ..........
            var SORTKEY = "Printtext";
            var DESCENDING = true;
            var GROUP = true;
            var aSorter = [];
            var sorter = new sap.ui.model.Sorter(SORTKEY, DESCENDING, GROUP)
            aSorter.push(sorter);
            oBinding.sort(aSorter);


            oModel.read("/KOPFDATENSet(guid'" + this.guid + "')", {
                success: function (data) {
                    txtAuftrag.setText(data.Aufnr);
                    txtStatus.setText(that.formatter.statusText(data.Status, that.getView().getModel("i18n")));
                    txtDatum.setText(dateFormat.format(data.Aufnrdatum));
                    txtTeam.setText(data.Teambezeich);
                    txtArbeit.setText(data.Tatigkeits);
                    txtBeschreibung.setText(data.Beschreib);

                    that.kopfdata = data;
                    if (that.kopfdata.Status === "02") {
                        btnSave.setEnabled(false);
                        btnAbsch.setEnabled(false);
                        btnpdf03.setEnabled(true);
                        isSaved.setText("Änderung ist nicht möglich");
                        that.onGoToPopupInfom4();
                    } else {
                        btnSave.setEnabled(true);
                        btnAbsch.setEnabled(true);
                        btnpdf03.setEnabled(false);
                        isSaved.setText("Änderung ist möglich");
                    }
                },
                error: function () {
                    txtAuftrag.setText("");
                    txtStatus.setText("");
                    txtDatum.setText("");
                    txtTeam.setText("");
                    txtArbeit.setText("");
                }
            });

        },

        onGoHeader: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("worklist", true);
        },

        onBack: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            oRouter.navTo("object", {
                guid: this.guid,
                step: "U",
                burks: this.kopfdata.Bukrs
            });
        },
        onPrintPdf: function () {
            var okey = this.guid;
            var sRead = "/PDF_DOKUMENTCollection('" + okey + "')/$value";
            var sServiceURL = this.getView().getModel().sServiceUrl;
            var sSource = sServiceURL + sRead;

            this._pdfViewer.setSource(sSource);
            this._pdfViewer.setTitle("PDF Übersicht Auswahl");
            this._pdfViewer.open();

        },
        onPrintAbschPdf: function () {
            var okey = this.guid;
            var sRead = "/PDF_ABSCHLUSSCollection('" + okey + "')/$value";
            var sServiceURL = this.getView().getModel().sServiceUrl;
            var sSource = sServiceURL + sRead;
            this._pdfViewer.setSource(sSource);
            this._pdfViewer.setTitle("PDF Dokumentation");
            this._pdfViewer.open();
        },

        onPrintLocalPreviewPdf: function () {
            var okey = this.guid;
            var that = this;
            var sRead = "/PDF_LOCALDOK_PREMCollection('" + okey + "')/$value";
            var sServiceURL = this.getView().getModel().sServiceUrl;
            var sSource = sServiceURL + sRead;

            this._pdfViewer.setSource(sSource);
            this._pdfViewer.setTitle("PDF Maßnahmenübersicht");
            this._pdfViewer.open();

        },

        onPrintLocalPdf: function () {
            var okey = this.guid;
            var that = this;
            var sRead = "/PDF_LOCALDOKCollection('" + okey + "')/$value";
            var sServiceURL = this.getView().getModel().sServiceUrl;
            var sSource = sServiceURL + sRead;

            this._pdfViewer.setSource(sSource);
            this._pdfViewer.setTitle("PDF Maßnahmenliste");
            if (this.byId("txtStatus").getText() === "Abgeschlossen") {
                MessageBox.information(
                    "Sie haben hier die Möglichkeit, entweder einen Zwischenstand der PDF Maßnahmenliste zu erstellen oder bei Vollständigkeit die Maßnahmenliste endgültig abzuschließen.", {
                    actions: ["zur PDF Maßnahmenliste"],
                    title: "Information",
                    emphasizedAction: "zur PDF Maßnahmenliste",
                    onClose: function (sAction) {
                        that._pdfViewer.open();
                    }
                });
            } else {
                this._pdfViewer.open();

            }

        },

        onYesNoChanges: function (oEvent) {
            var button = oEvent.getSource().getParent().getCells()[5].getContent()[0].getItems()[0];
            var memo = oEvent.getSource().getParent().getCells()[5].getContent()[0].getItems()[1];
            var yes1 = oEvent.getSource().getParent().getCells()[1];
            var yes2 = oEvent.getSource().getParent().getCells()[2];
            var yes3 = oEvent.getSource().getParent().getCells()[3];
            var yes4 = oEvent.getSource().getParent().getCells()[4];

            var btnAbsch = this.byId("btnAbsch");
            yes1.setEnabled(true);
            yes2.setEnabled(true);
            yes3.setEnabled(true);
            yes4.setEnabled(true);
            button.setEnabled(false);
            if (yes1.getState() === true) {
                yes1.setEnabled(true);
                yes2.setEnabled(false);
                yes3.setEnabled(false);
                yes4.setEnabled(false);
                memo.setValue('');
            } else if (yes2.getState() === true) {
                yes1.setEnabled(false);
                yes2.setEnabled(true);
                yes3.setEnabled(false);
                yes4.setEnabled(false);
                memo.setValue('');
            } else if (yes3.getState() === true) {
                yes1.setEnabled(false);
                yes2.setEnabled(false);
                yes3.setEnabled(true);
                yes4.setEnabled(false);
                memo.setValue('');
            } else if (yes4.getState() === true) {
                yes1.setEnabled(false);
                yes2.setEnabled(false);
                yes3.setEnabled(false);
                yes4.setEnabled(true);
                button.setEnabled(true);
                this.onSubmitDialogPress(oEvent); 
            }
            if ((this.kopfdata.Status === "01") && (this.onSaveCheck())) {
                btnAbsch.setEnabled(true);
            } else {
                btnAbsch.setEnabled(false);
            }

            if ( ( oEvent.getSource().getId().substr(13,12) === "IDGenSwitch4" ) && ( oEvent.getSource().getState() === false ) ) 
            {
                MessageToast.show("Sie haben den Schieber auf „Nicht zutreffend“ geändert. Wenn Sie nun einen anderen Schieber betätigen, dann würden Ihre bisherigen Einträge verloren gehen.", {
                    duration: 15000
                });
            }


            if (this.WContainer !== "") {
                this.isDataChanged = true;
                this.WContainer.setDirtyFlag(this.isDataChanged);
            }
        },

        onFinishedList: function (oEvent) {

            var oList = oEvent.getSource();
            var btnAbsch = this.byId("btnAbsch");

            for (var i = 0; i < oList.getItems().length; i++) {
                if (typeof (oList.getItems()[i].getBindingContext()) === 'object') {
                    var a1 = oList.getItems()[i].getBindingContext().getObject().Massnameumg === "X" ? true : false;
                    var a3 = oList.getItems()[i].getBindingContext().getObject().Massname === "X" ? true : false;
                    var a2 = oList.getItems()[i].getBindingContext().getObject().Umgesetz === "X" ? true : false;
                    var a4 = oList.getItems()[i].getBindingContext().getObject().SonstigeX === "X" ? true : false;

                    if (this.kopfdata.Status === "02") {
                        oList.getItems()[i].getCells()[1].setEnabled(false);
                        oList.getItems()[i].getCells()[2].setEnabled(false);
                        oList.getItems()[i].getCells()[3].setEnabled(false);
                        oList.getItems()[i].getCells()[4].setEnabled(false);
                        oList.getItems()[i].getCells()[5].getContent()[0].getItems()[0].setEnabled(a4);
 
                    } else if (a1 === false && a2 === false && a3 === false && a4 === false) {
                        oList.getItems()[i].getCells()[1].setEnabled(true);
                        oList.getItems()[i].getCells()[2].setEnabled(true);
                        oList.getItems()[i].getCells()[3].setEnabled(true);
                        oList.getItems()[i].getCells()[4].setEnabled(true);
                    } else {
                        oList.getItems()[i].getCells()[1].setEnabled(a1);
                        oList.getItems()[i].getCells()[2].setEnabled(a2);
                        oList.getItems()[i].getCells()[3].setEnabled(a3);
                        oList.getItems()[i].getCells()[4].setEnabled(a4); 
                        oList.getItems()[i].getCells()[5].getContent()[0].getItems()[0].setEnabled(a4); 
                    }
                }
            }

            if ((this.kopfdata.Status === "01") && (this.onSaveCheck())) {
                btnAbsch.setEnabled(true);
            } else {
                btnAbsch.setEnabled(false);
            }


        },

        onTextArieaChanges: function (oEvent) {
            var btnAbsch = this.byId("btnAbsch");

            if (oEvent.getParameters().value.trim() !== "") {
                oEvent.getSource().setValueState("None");
            } else {
                oEvent.getSource().setValueState("Warning");
                oEvent.getSource().setValueStateText(
                    "Bitte eintragen, wenn Maßnahme aus besonderem Grund nicht umgesetzt wird und keine der nebenstehenden Auswahlmöglichkeiten zutrifft.");
            }

            if ((this.kopfdata.Status === "01") && (this.onSaveCheck())) {
                btnAbsch.setEnabled(true);
            } else {
                btnAbsch.setEnabled(false);
            }

            if (this.WContainer !== "") {
                this.isDataChanged = true;
                this.WContainer.setDirtyFlag(this.isDataChanged);
            }

        },

        onSaveCheck: function () {
            
            var oTable = this.getView().byId("Protokoll02");

            for (var i = 0; i < oTable.getItems().length; i++) {
                if (typeof (oTable.getItems()[i].mAggregations.cells) === 'object') {
                    if ((oTable.getItems()[i].getCells()[1].getState() === false) &&
                        (oTable.getItems()[i].getCells()[2].getState() === false) &&
                        (oTable.getItems()[i].getCells()[3].getState() === false) &&
                        (oTable.getItems()[i].getCells()[4].getState() === false)) {
                        return false;
                      } 
                }
            }
            
            return true;
        },

        onSaveDaten: function () {
            var that = this;
            var btnAbsch = this.byId("btnAbsch");

            if (btnAbsch.getEnabled() === false) {
                MessageBox.information("Die Maßnahmenliste ist noch nicht vollständig bearbeitet. Möchten Sie zwischenspeichern?", {
                    actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
                    emphasizedAction: sap.m.MessageBox.Action.YES,
                    onClose: function (sAction) {
                        if (sAction === "YES") {
                            that.onSave("S");
                        } else if (sAction === "NO") {
                            that.onJumpToErrorLine();
                        }
                    }
                });
            } else {

                MessageBox.information(
                    "Sie speichern hiermit einen Zwischenstand. Falls noch nicht alle Maßnahmen bearbeitet wurden, kann dieser Nachweis nur bedingt gegenüber Aufsichtsbehörden verwendet werden.", {
                    actions: ["Schließen"],
                    emphasizedAction: "Schließen",
                    onClose: function (sAction) {
                        if (sAction === "Schließen") {
                            that.onSave("S");
                        }
                    }
                });
            }

        },

        onSaveAbschlisen: function () {
            if (!this.Question1) {
                this.Question1 = new Dialog({
                    type: DialogType.Message,
                    contentWidth: "700px",
                    title: "Information",
                    content: [new Text({
                        text: "Soll die Online Maßnahmenliste für diesen Arbeitsplatz abgeschlossen werden?"
                    }),
                    new Text({
                        text: "Zur Info: Hiermit speichern Sie die Version, die Sie als Nachweis bei Aufsichtsbehörden verwenden können."
                    }),
                    new Text({
                        text: "Nachträgliches Ändern, Löschen oder Kopieren ist mit Abschließen nicht mehr möglich."
                    })
                    ],
                    buttons: [
                        new Button({
                            text: "Bearbeiten Maßnahmenliste abschließen",
                            icon: "sap-icon://flag",
                            type: sap.m.ButtonType.Accept,
                            press: function () {
                                this.onSave("A");
                                this.Question1.close();
                            }.bind(this)
                        }),
                        new Button({
                            text: "Abbrechen",
                            type: sap.m.ButtonType.Reject,
                            icon: "sap-icon://decline",
                            press: function () {
                                this.Question1.close();
                            }.bind(this)
                        })

                    ]
                });
            }
            this.Question1.open();
        },

        onGoToLinks: function (oEvent) {
            this.onPopupLink().openBy(this.byId("link_internet"));
        },

        onPopupLink: function () {
            if (!this._oDialogLink) {
                this._oDialogLink = sap.ui.xmlfragment("project1.fragment.linkPopup", this);
                this.getView().addDependent(this._oDialogLink);
            }
            return this._oDialogLink;
        },

        onGoToAndereGrunde: function (oEvent) {
            var oPopover = new ResponsivePopover({
                showHeader: false,
                placement: "Bottom",
                contentWidth: "400px",
                content: [
                    new sap.m.Panel({
                        content: [
                            new sap.m.FlexBox({
                                alignItems: "Start",
                                direction: "Column",
                                justifyContent: "Start",
                                items: [
                                    new FormattedText({
                                        htmlText: "Bitte andere Gründe angeben, wenn Maßnahme nicht umgesetzt wird und sonstige Auswahlmöglichkeiten zur Begründung nicht zutreffen."
                                    })
                                ]
                            })
                        ]
                    })
                ],
                endButton: [new Button({
                    text: "Schließen",
                    press: function (e) {
                        e.getSource().getParent().getParent().close();
                    }
                })]
            });
            oPopover.openBy(oEvent.getSource());
        },

        onCloseLinkPopup: function (oEvent) {
            this._oDialogLink.close();
        },

        onJumpToErrorLine: function () {
            var oTable = this.getView().byId("Protokoll02");
            var oScrollContainer = this.byId("oScrollContainer");

            for (var i = 0; i < oTable.getItems().length; i++) {
                if (typeof (oTable.getItems()[i].mAggregations.cells) === 'object') {
                    if ((oTable.getItems()[i].getCells()[1].getState() === false) &&
                        (oTable.getItems()[i].getCells()[2].getState() === false) &&
                        (oTable.getItems()[i].getCells()[3].getState() === false) &&
                        (oTable.getItems()[i].getCells()[4].getState() === false)) {
                        return true;
                     } else if ( (oTable.getItems()[i].getCells()[4].getState() === true) && ( oTable.getItems()[i].getCells()[5].getContent()[0].getItems()[1].getValue() === "" )) {    

                        return false;
                    }
                }
            }
            return true;
        },

        onHTML: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("html_list", {
                guid: this.guid
            });
        },
        onSave: function (type) {
            var txtStatus = this.byId("txtStatus");
            var btnpdf03 = this.byId("btnpdf03");
            var that = this;
            var oModel = this.getView().getModel();
            var btnSave = this.byId("btnSave");
            var oList = this.getView().byId("Protokoll02");
            var oParams = {},
                oEntity = {};

                
            if (type === "S" && !this.onJumpToErrorLine()) {
                MessageToast.show("Bitte tragen Sie bei „Andere Gründe“ den entsprechenden Text ein.", {
                    duration: 15000
                });                
                return;
            } else if ((this.onSaveCheck() === true) && (type === "A")) {
                this.kopfdata.Status = "02";
            } else {
                //
            }

            oModel.setUseBatch(true);
            oModel.setDeferredBatchGroups(["AId"]);
            oModel.defaultCountMode = "None";

            oParams.async = false;
            oParams.batchGroupId = "AId";

            sap.ui.core.BusyIndicator.show(0);

            for (var i = 0; i < oList.getItems().length; i++) {
                if ( typeof(oList.getItems()[i].getBindingContext()) === 'object' )
{
                oEntity = {};
                oEntity.Id = oList.getItems()[i].getBindingContext().getObject().Id;
                oEntity.Gbid = oList.getItems()[i].getBindingContext().getObject().Gbid;
                oEntity.SchutzmassnahmenNr = oList.getItems()[i].getBindingContext().getObject().SchutzmassnahmenNr;
                oEntity.Schutzmas = oList.getItems()[i].getBindingContext().getObject().Schutzmas;

                if (oList.getItems()[i].getCells()[1].getState() === false) {
                    oEntity.Massnameumg = "";
                } else {
                    oEntity.Massnameumg = "X";
                }

                if (oList.getItems()[i].getCells()[2].getState() === false) {
                    oEntity.Umgesetz = "";
                } else {
                    oEntity.Umgesetz = "X";
                }
                if (oList.getItems()[i].getCells()[3].getState() === false) {
                    oEntity.Massname = "";
                } else {
                    oEntity.Massname = "X";
                }
                
                if (oList.getItems()[i].getCells()[4].getState() === false) {
                    oEntity.SonstigeX = "";
                    oEntity.Sonstige = '';
                } else {
                    oEntity.SonstigeX = "X";
                    oEntity.Sonstige = oList.getItems()[i].getCells()[5].getContent()[0].getItems()[1].getValue(); 
                }

                if ((oList.getItems()[i].getBindingContext().getObject().Sonstige !== oEntity.Sonstige) ||
                    (oList.getItems()[i].getBindingContext().getObject().Massnameumg !== oEntity.Massnameumg) ||
                    (oList.getItems()[i].getBindingContext().getObject().Umgesetz !== oEntity.Umgesetz) ||
                    (oList.getItems()[i].getBindingContext().getObject().SonstigeX !== oEntity.SonstigeX) ||
                    (oList.getItems()[i].getBindingContext().getObject().Massname !== oEntity.Massname)) {
                    oEntity.Update = "X";
                }
                var olink = "/ABSCHLIESPROTOKOLSet(Id=guid'" + oEntity.Id + "',Gbid=guid'" + oEntity.Gbid + "')";

                oModel.update(olink, oEntity, oParams);
}
            }

            if (this.kopfdata.Status === "02") {
                olink = "/KOPFDATENSet(guid'" + oEntity.Gbid + "')";
                oModel.update(olink, this.kopfdata, oParams);
                btnSave.setEnabled(false);
                btnpdf03.setEnabled(true);
            }

            oModel.submitChanges({
                groupId: "AId",
                success: function (oData, oResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    that.WContainer.setDirtyFlag(false);
                    txtStatus.setText(that.formatter.statusText(this.kopfdata.Status, that.getView().getModel("i18n")));

                    if (this.kopfdata.Status === '01') {
                        MessageToast.show("Zwischenspeicherung ist erfolgt.", {
                            duration: 15000
                        });
                    } else if (this.kopfdata.Status === '02') {
                        this.onClosePopup();
                    }

                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var oJson = JSON.parse(oError.responseText);
                    oJson = JSON.parse(oError.responseText);
                    MessageBox.information(oJson.error.message.value);
                    btnSave.setEnabled(true);
                    btnpdf03.setEnabled(false);
                }.bind(this)
            });

            oModel.setRefreshAfterChange(true);

        },


        onClosePopup: function (type) {
            if (!this.CloseInfo) {
                this.CloseInfo = new Dialog({
                    type: DialogType.Message,
                    contentWidth: "700px",
                    title: "Information",
                    content: [
                        new Text({
                            text: "Herzlichen Glückwunsch, Sie haben erfolgreich die GB-Zuordnung abgeschlossen. Hiermit haben Sie die Version gespeichert, die Sie als Nachweis bei Aufsichtsbehörden verwenden können."
                        }),
                        new Text({
                            text: "Sie können jedes Dokument lokal speichern."
                        }),
                    ],
                    buttons:
                        [
                            new Button({
                                text: "PDF Übersicht Auswahl",
                                tooltip: this.getView().getModel("i18n").getResourceBundle().getText("button.PrintPdf"), // "Diese Unterlage dient Ihrer eigenen Übersicht und kann zur Information für andere genutzt werden.",
                                press: function () {
                                    this.onPrintPdf();
                                }.bind(this)
                            }),
                            new Button({
                                text: "PDF Dokumentation",
                                tooltip: this.getView().getModel("i18n").getResourceBundle().getText("button.PrintAbschPdf"), // "Diese Unterlage beinhaltet alle ausgewählten Gefährdungsbeurteilungen und dient als Nachweis z.B. gegenüber Aufsichtsbehörden",
                                press: function () {
                                    this.onPrintAbschPdf();
                                }.bind(this)
                            }),
                            new Button({
                                text: "PDF Maßnahmenliste",
                                tooltip: this.getView().getModel("i18n").getResourceBundle().getText("button.PrintLocalPdf"), // "Die PDF Maßnahmenliste enthält alle umzusetzenden Maßnahmen und dient als Nachweis gegenüber Aufsichtsbehörden",
                                press: function () {
                                    this.onPrintLocalPdf();
                                }.bind(this)
                            }),
                            new Button({
                                text: "Schließen",
                                press: function () {
                                    this.onGoHeader();
                                    this.CloseInfo.close();
                                }.bind(this)
                            })
                        ]
                });
            }
            this.CloseInfo.open();
        },

        PopupInfom1: function (oEvent) {
            if (this.first === "1") {
                this.PopupInfomSub1(oEvent);
            }
        },

        PopupInfomSub1: function (oEvent) {
            if (!this.oInfo) {
                this.oInfo = new Dialog({
                    type: DialogType.Message,
                    showHeader: false,
                    contentWidth: "700px",
                    content: [
                        new FormattedText({
                            htmlText: "<strong>Information zur Bedienung</strong><p>"
                        }),
                        new FormattedText({
                            htmlText: "Nachfolgend werden Ihnen die Schutzmaßnahmen online angezeigt, die sich aus Ihrer zuvor getätigten GB Auswahl ergeben und innerhalb des aktuellen Jahres umzusetzen sind. Die „PDF Übersicht Auswahl“ (s.o.) kann zur Information betroffener Beschäftigter über die getätigte GB-Auswahl genutzt werden."
                        }),
                        new FormattedText({
                            htmlText: "Die „PDF Maßnahmenübersicht“ (s.o.) dient Ihnen als Arbeitshilfe, falls Sie die Umsetzung der Maßnahmen an Mitarbeitende delegieren möchten."
                        }),
                        new FormattedText({
                            htmlText: "Die Umsetzung der Maßnahmen dokumentieren Sie bitte online in der „Online Maßnahmenliste“, indem Sie zur Beantwortung der Fragen auf einen der Schieber klicken (für rückgängig nochmals auf den gleichen Schieber klicken)."
                        }),
                        new FormattedText({
                            htmlText: "Um die Maßnahmenliste abschließen zu können, muss jede Frage beantwortet werden. Die „PDF Maßnahmenliste“ (s.o.) steht Ihnen dann als Nachweis gegenüber Aufsichtsbehörden zur Verfügung."
                        }),

                    ],
                    endButton: new Button({
                        text: "Info Schließen",
                        press: function () {
                            if (this.first === "1") {
                                this.PopupInfom2();
                            };
                            this.oInfo.close();

                        }.bind(this)
                    })
                });
            }
            this.oInfo.open();
        },


        onGoToPopupInfomSub1: function (oEvent) {
            var oPopover = new ResponsivePopover({
                showHeader: false,
                placement: "Bottom",
                contentWidth: "400px",
                content: [
                    new sap.m.Panel({
                        content: [
                            new FormattedText({
                                htmlText: "Die Fragen zur Umsetzung der Schutzmaßnahmen, die sich aufgrund Ihrer zuvor getätigten GB Auswahl ergeben haben, beantworten Sie bitte, indem Sie auf einen der Schieber klicken (für rückgängig nochmals auf den gleichen Schieber klicken)."
                            }),
                            new FormattedText({
                                htmlText: "Um die Maßnahmenliste abzuschließen, muss zu jeder Schutzmaßnahme eine Frage beantwortet sein."
                            }),
                        ],
                    })
                ],
                endButton: [new Button({
                    text: "Schließen",
                    press: function (e) {
                        e.getSource().getParent().getParent().close();
                    }
                })]
            });
            oPopover.openBy(oEvent.getSource());
        },

        onGoToPopupInfom2: function (oEvent) {
            var oPopover = new ResponsivePopover({
                showHeader: false,
                placement: "Bottom",
                contentWidth: "300px",
                content: [
                    new sap.m.Panel({
                        content: [
                            new FormattedText({
                                htmlText: this.getView().getModel("i18n").getResourceBundle().getText("label.TextInfo1")
                            }),
                            new FormattedText({
                                htmlText: this.getView().getModel("i18n").getResourceBundle().getText("label.TextInfo2")
                            })                            
                        ],
                    })
                ],
                endButton: [new Button({
                    text: "Schließen",
                    press: function (e) {
                        e.getSource().getParent().getParent().close();
                    }
                })]
            });
            oPopover.openBy(oEvent.getSource());
        },



        PopupInfom2: function (oEvent) {
            if (!this.oInfo1) {
                this.oInfo1 = new Dialog({
                    type: DialogType.Message,
                    contentWidth: "700px",
                    showHeader: false,
                    content: [
                        new FormattedText({
                            htmlText: this.getView().getModel("i18n").getResourceBundle().getText("label.InfoHeader")
                        }),
                        new FormattedText({
                            htmlText: this.getView().getModel("i18n").getResourceBundle().getText("label.TextInfo1")
                        }),
                        new FormattedText({
                            htmlText: this.getView().getModel("i18n").getResourceBundle().getText("label.TextInfo2")
                        }),                        
                    ],
                    endButton: new Button({
                        text: "Info Schließen",
                        press: function () {
                            if (this.first === "1") {
                                this.first = "0";
                                this.onPopupLink().openBy(this.byId("link_internet"));
                            }
                            this.oInfo1.close();
                        }.bind(this)
                    })
                });
            }
            this.oInfo1.open();
        },

        onGoToPopupInfom4: function (oEvent) {

            if (!this.oInfoEdit) {
                this.oInfoEdit = new Dialog({
                    type: DialogType.Message,
                    showHeader: false,
                    contentWidth: "700px",
                    content: [
                        new FormattedText({
                            htmlText: "<strong>Abgeschlossene Maßnahmenliste ist nicht mehr änderbar. Wenn Sie eine Maßnahmenliste oder GB-Auswahl nachträglich ändern wollen, dann erstellen Sie bitte eine Kopie von einer GB-Zuordnung. Kopieren im GB Überblick mit icon „Auswahl kopieren“.</strong>"
                        })

                    ],
                    endButton: new Button({
                        text: "Schließen",
                        press: function () {
                            this.oInfoEdit.close();
                        }.bind(this)
                    })
                });
            }
            this.oInfoEdit.open();            
            




        },


		onSubmitDialogPress: function ( evt ) {

            let oEvt = evt;
            if ( oEvt.getId() == 'change' )
            {
                this.oCell = oEvt.getSource().getParent().getCells();
            } else if ( oEvt.getId() == 'press' ){
                this.oCell = oEvt.getSource().getParent().getParent().getParent().getCells();
            };

 			if (!this.oSubmitDialog) {
				this.oSubmitDialog = new Dialog({
					type: DialogType.Message,
					title: "Andere Gründe",
                    contentWidth: '500px',

					content: [
						new TextArea("submissionNote", {
							width: "100%",
                            rows: 10,
                            liveChange: function (oEvent) {
                                var sText = oEvent.getParameter("value");
                                this.oSubmitDialog.getButtons()[0].setEnabled(sText.length > 0);
                            }.bind(this),
						})
					],
					buttons: [new Button({
						type: ButtonType.Emphasized,
						text: "Sichern",
                        enabled: false,
						press: function () {
							var sText = this.oSubmitDialog.getContent()[0].getValue();
                            this.oCell[4].setState( true );           
                            this.oCell[5].getContent()[0].getItems()[1].setValue( sText );            
							this.oSubmitDialog.close();
						}.bind(this)
					}),
                    new Button({
						text: "Löschen",
						press: function () {
                            this.oCell[4].setState( false );          
                            this.oCell[5].getContent()[0].getItems()[1].setValue(''); 
                            this.oCell[5].getContent()[0].getItems()[0].setEnabled( false );         
                            this.oCell[1].setEnabled( true );
                            this.oCell[2].setEnabled( true );
                            this.oCell[3].setEnabled( true );
                            this.oCell[4].setEnabled( true );                                                                                                                                     
							this.oSubmitDialog.close();
						}.bind(this)
					}),        new Button({
						text: "Schließen",
						press: function () {
                            var sText = this.oSubmitDialog.getContent()[0].getValue();                           
                            if ( sText == '')
                            {
                                this.oCell[4].setState( false );                                         
                                this.oCell[5].getContent()[0].getItems()[1].setValue('');
                                this.oCell[5].getContent()[0].getItems()[0].setEnabled( false );
                                this.oCell[1].setEnabled( true );
                                this.oCell[2].setEnabled( true );
                                this.oCell[3].setEnabled( true );
                                this.oCell[4].setEnabled( true );                                 
                            }

							this.oSubmitDialog.close();
						}.bind(this)
					})],            
				});
			}

            this.oSubmitDialog.setModel(this.getOwnerComponent().getModel());
            this.oSubmitDialog.setBindingContext(evt.getSource().getBindingContext());
            if ( this.kopfdata.Status == '02')
            {
                this.oSubmitDialog.getButtons()[0].setEnabled( false );
                this.oSubmitDialog.getButtons()[1].setEnabled( false );
                this.oSubmitDialog.getButtons()[2].setEnabled( true );                                
            } else {
                this.oSubmitDialog.getButtons()[0].setEnabled( this.oCell[5].getContent()[0].getItems()[1].getValue() > 0);
                this.oSubmitDialog.getButtons()[1].setEnabled( true );
                this.oSubmitDialog.getButtons()[2].setEnabled( true );                                                
            }
            this.oSubmitDialog.getContent()[0].setValue( this.oCell[5].getContent()[0].getItems()[1].getValue() );

			this.oSubmitDialog.open();
		}




    });

});