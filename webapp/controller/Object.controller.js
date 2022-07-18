sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
    "sap/ui/model/FilterType",
    "project1/model/formatter",
    "sap/m/ResponsivePopover",
    "sap/m/FormattedText",
    "sap/m/Link"
], function (BaseController, Filter, FilterOperator, MessageBox, MessageToast, Dialog, DialogType, Button, ButtonType, Text, FilterType,
    formatter, ResponsivePopover, FormattedText, Link) {
    "use strict";

    return BaseController.extend("project1.controller.Object", {
        formatter: formatter,
        onInit: function () {
            var oModel = this.getOwnerComponent().getModel();
            this.getView().byId("Erstellungsdatum").setDateValue(new Date());
            oModel.setSizeLimit(999);
            this.getView().setModel(oModel);
            this.guid = "";
            this.Status = "00";
            this.new = "";
            this.Bukrs = "";
            this.getOwnerComponent().getRouter().getRoute("object").attachPatternMatched(this._onRouteMatched, this);

            if (sap.ushell !== undefined) {
                this.isDataChanged = sap.ushell.Container.getDirtyFlag();
                this.WContainer = sap.ushell.Container;
            } else {
                this.isDataChanged = "";
                this.WContainer = "";
            }

            oModel.attachRequestCompleted(function (oEvent) {
                var link = "/KOPFDATENSet(guid'" + this.guid + "')";
                if ((oEvent.getParameters().url.substring(0, 12) === "KOPFDATENSet") && (oEvent.getParameters().method === "GET")) {
                    var obj = oEvent.getSource().getContext(link).getObject();
                    if (obj !== undefined) {
                        this.byId("txtTeam").setText(obj.Teambezeich);
                        this.Bukrs = obj.Bukrs;
                    }
                }
            }, this);
        },

        onGetTatigkeitList: function () {
            var aFilters = [];
            var oTatigkeitList = this.getView().byId("tatigkeitList");

            if (this.guid !== "") {
                aFilters.push(new Filter("Gbid", FilterOperator.EQ, this.guid));
                aFilters.push(new Filter("Bukrs", FilterOperator.EQ, this.Bukrs)); // Arbeitszeiten
                var oBinding = oTatigkeitList.getBinding("items");
                oBinding.filter(aFilters);
            } else {
                oTatigkeitList.removeSelections();
                oTatigkeitList.setSelectedItem(oTatigkeitList.getItems()[0]);
                aFilters.push(new Filter("Bukrs", FilterOperator.EQ, this.Bukrs)); // Arbeitszeiten
                oBinding = oTatigkeitList.getBinding("items");
                oBinding.filter(aFilters);
            }
        },

        onBack: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            if (this.byId("btnsave").getEnabled() === false) {
                this.isDataChanged = false;
                this.WContainer.setDirtyFlag(this.isDataChanged);
            }
            oRouter.navTo("worklist", true);
        },

        onNextAktion: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("closing", {
                guid: this.guid,
                first: 0
            });

        },

        _onRouteMatched: function (evt) {
            var that = this;
            var aFilters = [];
            var Teambezeichnung = this.getView().byId("Teambezeichnung");
            var Erstellungsdatum = this.getView().byId("Erstellungsdatum");
            var Tatigkeitsbezeichnung = this.getView().byId("Tatigkeitsbezeichnung");
            var txtTeam = this.getView().byId("txtTeam");
            var txtArbeit = this.getView().byId("txtArbeit");
            var txtAuftrag = this.getView().byId("txtAuftrag");

            var Beschreibung = this.getView().byId("Beschreibung");
            var oModel = this.getView().getModel();
            var btnNext = this.getView().byId("btnNext");
            var CreateWizard = this.byId("CreateWizard");
            var btnsave = this.byId("btnsave");
            var addButton = this.byId("addButton");
            var isSaved = this.byId("isSaved");

            btnsave.setEnabled(false);
            addButton.setEnabled(false);
            btnNext.setVisible(false);
            txtTeam.setText("");
            txtArbeit.setText("");
            Beschreibung.setEnabled(true);
            Erstellungsdatum.setEnabled(true);
            Tatigkeitsbezeichnung.setEnabled(true);
            Teambezeichnung.setEnabled(true);

            this.onClear('');
            if (this.new !== "X") {
                this.guid = evt.getParameter("arguments").guid === "0" ? "" : evt.getParameter("arguments").guid;
            } else {
                this.guid = "";
            }

            if (typeof (evt) != "undefined") {
                var step = evt.getParameter("arguments").step;
                this.Bukrs = evt.getParameter("arguments").burks;
            } else {
                var step = 'C';
                this.Bukrs = '0';
            }

            txtAuftrag.setText("");

            this.getView().byId("Frage06").setVisible(false);
            if (this.guid !== "") {
                aFilters.push(new Filter("Gbid", FilterOperator.EQ, this.guid));
                var oList = this.getView().byId("Frage06");
                var oBinding = oList.getBinding("items");
                isSaved
                oBinding.filter(aFilters, FilterType.Application);

                oModel.read("/KOPFDATENSet(guid'" + this.guid + "')", {
                    success: function (data) {
                        Teambezeichnung.setSelectedKey(data.Teambezeich);
                        txtTeam.setText(data.Teambezeich);
                        txtArbeit.setText(data.Tatigkeits);
                        txtAuftrag.setText(data.Aufnr);
                        Erstellungsdatum.setDateValue(data.Erstelldatum);
                        Tatigkeitsbezeichnung.setValue(data.Tatigkeits);
                        Teambezeichnung.setValueState(sap.ui.core.ValueState.None);
                        Tatigkeitsbezeichnung.setValueState(sap.ui.core.ValueState.None);
                        Beschreibung.setValue(data.Beschreib);

                        CreateWizard.setCurrentStep(that.byId("Step" + data.Step));
                        CreateWizard.validateStep(that.byId("Step" + data.Step));
                        that.Bukrs = data.Bukrs;
                        if (step === "C") {
                            CreateWizard.setCurrentStep(that.byId("Step1"));
                            CreateWizard.validateStep(that.byId("Step1"));
                        } else {
                            CreateWizard.setCurrentStep(that.byId("Step" + data.Step));
                            CreateWizard.validateStep(that.byId("Step" + data.Step));
                        }

                        if (data.Status !== "00") {
                            btnNext.setVisible(true);
                            CreateWizard.invalidateStep(that.byId("Step" + data.Step));
                            Beschreibung.setEnabled(false);
                            Erstellungsdatum.setEnabled(false);
                            Tatigkeitsbezeichnung.setEnabled(false);
                            Teambezeichnung.setEnabled(false);
                            isSaved.setText("Änderung ist nicht möglich");
                        } else {
                            btnNext.setVisible(false);
                            btnsave.setEnabled(true);
                            addButton.setEnabled(true);
                            Beschreibung.setEnabled(true);
                            Erstellungsdatum.setEnabled(true);
                            Tatigkeitsbezeichnung.setEnabled(true);
                            Teambezeichnung.setEnabled(true);
                            isSaved.setText("Änderung ist nicht möglich");
                        }
                        that.Status = data.Status;
                        Teambezeichnung.fireSelectionChange();
                    },
                    error: function () {
                        Teambezeichnung.setValue("");
                        Erstellungsdatum.setDateValue("");
                        Tatigkeitsbezeichnung.setValue("");
                        Beschreibung.setValue("");
                    }
                });
            } else {
                this.getView().byId("Frage06").removeAllItems();
                btnsave.setEnabled(true);
                addButton.setEnabled(true);
            }

        },

        onSelectedTatigkeitList: function (oEvent) {
            var oItems;
            var isEnabled = this.byId("btnsave").getEnabled();
            if (!isEnabled) {
                var isSelected = (oEvent.getParameter("listItem").getBindingContext().getObject().Ausgewahlt == 'X') ? true : false;
                oEvent.getParameter("listItem").setSelected(isSelected);
                MessageToast.show(
                    "GB Auswahl ist nach Abschluss der Maßnahmenliste nicht mehr änderbar. Wenn Sie eine GB-Auswahl nachträglich ändern wollen, dann erstellen Sie bitte eine Kopie von einer GB-Zuordnung, derer Maßnahmenliste noch nicht abgeschlossen ist. Kopieren im GB Überblick mit icon „Auswahl kopieren“.", {                        
                    duration: 15000
                });
                return;
            }

            if (oEvent.getSource().getId() === "__xmlview0--Step1") {
                oItems = this.getView().byId("tatigkeitList").getSelectedItems();
            } else {
                oItems = oEvent.getSource().getSelectedItems();
                if ((oEvent.getParameter("listItem").getBindingContext().getObject().GbNr === "T01") && (oEvent.getParameter("listItem").getSelected() ===
                    false)) {
                    oEvent.getParameter("listItem").setSelected(true);
                    return;
                }
            }
            //EinsatzorteList01
            if (oItems.length < 3) {
                this.onApplyFilterforAllTables(oItems);
            } else {
                oEvent.getParameters().listItem.setSelected(false);
                MessageBox.information("Sie können nur 1 weitere Tätigkeit auswählen");
            }
        },

        checkontatigkeit: function (oEvent) {
            var oTatigkeitList = this.getView().byId("tatigkeitList");
            var that = this;
            var btnsave = this.byId("btnsave");
            if ((oTatigkeitList.getItems().length === 0) || (!btnsave.getEnabled())) {
                return;
            }
            if (oTatigkeitList.getSelectedItems().length === 1) {
                MessageBox.information("Sie haben neben der vorgegebenen Tätigkeit keine weitere ausgewählt. Wenn zutreffend 'OK' sonst 'Zurück'", {
                    actions: ["Zurück", MessageBox.Action.OK],
                    emphasizedAction: "Zurück",
                    onClose: function (sAction) {
                        if (sAction === "Zurück") {
                            that.getView().byId("CreateWizard").previousStep();
                        }
                    }
                });

            }
        },

        onIconHelpPress: function () {
            MessageBox.information(
                "„Falls Sie eine Beratung durch die für Sie zuständige Fachkraft für Arbeitssicherheit benötigen, bitte diesen Button nutzen. Die für Sie zuständige Fachkraft für Arbeitssicherheit setzt sich dann mit Ihnen in Verbindung."
            );
        },

        checkonBetriebseinrichtungen: function (oEvent) {
            var oList = this.getView().byId("BetriebseinrichtungenList01");
            var that = this;
            var btnsave = this.byId("btnsave");
            if ((oList.getItems().length === 0) || (!btnsave.getEnabled())) {
                return;
            }
            if (oList.getSelectedItems().length === 0) {
                MessageBox.information("Sie haben in diesem Auswahlblock nichts angekreuzt. Wenn zutreffend 'Ok' sonst 'Zurück'", {
                    actions: ["Zurück", MessageBox.Action.OK],
                    emphasizedAction: "Zurück",
                    onClose: function (sAction) {
                        if (sAction === "Zurück") {
                            that.getView().byId("CreateWizard").previousStep();
                        }
                    }
                });
            }
        },

        checkonArbeitsmittel: function (oEvent) {
            var oList = this.getView().byId("ArbeitsmittelList01");
            var that = this;
            var btnsave = this.byId("btnsave");
            if ((oList.getItems().length === 0) || (!btnsave.getEnabled())) {
                return;
            }
            if (oList.getSelectedItems().length === 0) {
                MessageBox.information("Sie haben in diesem Auswahlblock nichts angekreuzt. Wenn zutreffend 'Ok' sonst 'Zurück'", {
                    actions: ["Zurück", MessageBox.Action.OK],
                    emphasizedAction: "Zurück",
                    onClose: function (sAction) {
                        if (sAction === "Zurück") {
                            that.getView().byId("CreateWizard").previousStep();
                        }
                    }
                });
            }
        },

        checkonEinsatzorte: function (oEvent) {
            var oList = this.getView().byId("EinsatzorteList01");
            var that = this;
            var btnsave = this.byId("btnsave");
            if ((oList.getItems().length === 0) || (!btnsave.getEnabled())) {
                return;
            }
            if (oList.getSelectedItems().length === 0) {
                MessageBox.information("Sie haben in diesem Auswahlblock nichts angekreuzt. Wenn zutreffend 'Ok' sonst 'Zurück'", {
                    actions: ["Zurück", MessageBox.Action.OK],
                    emphasizedAction: "Zurück",
                    onClose: function (sAction) {
                        if (sAction === "Zurück") {
                            that.getView().byId("CreateWizard").previousStep();
                        }
                    }
                });
            }

        },

        checkonArbeitszeiten: function (oEvent) {
            var oList = this.getView().byId("ArbeitszeitenList01");
            var that = this;
            var btnsave = this.byId("btnsave");

            if ((oList.getItems().length === 0) || (!btnsave.getEnabled())) {
                return;
            }
            if (oList.getSelectedItems().length === 0) {
                MessageBox.information("Sie haben in diesem Auswahlblock nichts angekreuzt. Wenn zutreffend 'Ok' sonst 'Zurück'", {
                    actions: ["Zurück", MessageBox.Action.OK],
                    emphasizedAction: "Zurück",
                    onClose: function (sAction) {
                        if (sAction === "Zurück") {
                            that.getView().byId("CreateWizard").previousStep();
                        }
                    }
                });
            }

        },

        onApplyFilterforAllTables: function (oItems) {

            var aFilters = [];
            var sFilterValue;

            //      aFilters.push(new Filter("Bukrs", FilterOperator.EQ, this.Bukrs)); // Arbeitszeiten
            aFilters.push(new Filter("ArtNr", FilterOperator.EQ, "02")); // Arbeitszeiten
            aFilters.push(new Filter("Bukrs", FilterOperator.EQ, this.Bukrs ));  
            for (var i = 0; i < oItems.length; i++) {
                sFilterValue = oItems[i].getBindingContext("undefined");
                aFilters.push(new Filter("GbNr", FilterOperator.EQ, sFilterValue.getObject().GbNr));
                if (this.guid !== "") {
                    aFilters.push(new Filter("Gbid", FilterOperator.EQ, this.guid));
                }

            }
            var oList = this.getView().byId("ArbeitszeitenList01");
            var oBinding = oList.getBinding("items");
            if (oBinding !== undefined) oBinding.filter(aFilters);

            aFilters = [];
            aFilters.push(new Filter("ArtNr", FilterOperator.EQ, "03")); // EinsatzorteList01
            aFilters.push(new Filter("Bukrs", FilterOperator.EQ, this.Bukrs )); 
            for (i = 0; i < oItems.length; i++) {
                sFilterValue = oItems[i].getBindingContext("undefined");
                aFilters.push(new Filter("GbNr", FilterOperator.EQ, sFilterValue.getObject().GbNr));
                if (this.guid !== "") {
                    aFilters.push(new Filter("Gbid", FilterOperator.EQ, this.guid));
                }

            }

            oList = this.getView().byId("EinsatzorteList01");
            oBinding = oList.getBinding("items");
            if (oBinding !== undefined) oBinding.filter(aFilters);

            aFilters = [];
            aFilters.push(new Filter("ArtNr", FilterOperator.EQ, "NO")); // ArbeitsmittelList01 - 04 - 
            for (i = 0; i < oItems.length; i++) {
                sFilterValue = oItems[i].getBindingContext("undefined");
                aFilters.push(new Filter("GbNr", FilterOperator.EQ, sFilterValue.getObject().GbNr));
                if (this.guid !== "") {
                    aFilters.push(new Filter("Gbid", FilterOperator.EQ, this.guid));
                }

            }
            oList = this.getView().byId("ArbeitsmittelList01");
            oBinding = oList.getBinding("items");
            if (oBinding !== undefined) oBinding.filter(aFilters);

            aFilters = [];
            aFilters.push(new Filter("ArtNr", FilterOperator.EQ, "05")); // BetriebseinrichtungenList01
            aFilters.push(new Filter("Bukrs", FilterOperator.EQ, this.Bukrs )); 
            for (i = 0; i < oItems.length; i++) {
                sFilterValue = oItems[i].getBindingContext("undefined");
                aFilters.push(new Filter("GbNr", FilterOperator.EQ, sFilterValue.getObject().GbNr));
                if (this.guid !== "") {
                    aFilters.push(new Filter("Gbid", FilterOperator.EQ, this.guid));
                }

            }
            oList = this.getView().byId("BetriebseinrichtungenList01");
            oBinding = oList.getBinding("items");
            if (oBinding !== undefined) oBinding.filter(aFilters);

            aFilters = [];
            aFilters.push(new Filter("ArtNr", FilterOperator.EQ, "06")); // T16
            for (i = 0; i < oItems.length; i++) {
                if (this.guid !== "") {
                    aFilters.push(new Filter("Gbid", FilterOperator.EQ, this.guid));
                }

            }
            oList = this.getView().byId("Frage00"); // gefarstoffe
            oBinding = oList.getBinding("items");
            if (oBinding !== undefined) oBinding.filter(aFilters);
            //
            aFilters = [];
            aFilters.push(new Filter("ArtNr", FilterOperator.EQ, "07")); // T17
            for (i = 0; i < oItems.length; i++) {
                if (this.guid !== "") {
                    aFilters.push(new Filter("Gbid", FilterOperator.EQ, this.guid));
                }

            }
            oList = this.getView().byId("Frage01");
            oBinding = oList.getBinding("items");
            if (oBinding !== undefined) oBinding.filter(aFilters);
            //
            aFilters = [];
            aFilters.push(new Filter("ArtNr", FilterOperator.EQ, "08")); // Frage00
            for (i = 0; i < oItems.length; i++) {
                if (this.guid !== "") {
                    aFilters.push(new Filter("Gbid", FilterOperator.EQ, this.guid));
                }

            }
            oList = this.getView().byId("Frage02");
            oBinding = oList.getBinding("items");
            if (oBinding !== undefined) oBinding.filter(aFilters);
            //
            aFilters = [];
            aFilters.push(new Filter("ArtNr", FilterOperator.EQ, "10")); // Frage00
            for (i = 0; i < oItems.length; i++) {
                if (this.guid !== "") {
                    aFilters.push(new Filter("Gbid", FilterOperator.EQ, this.guid));
                }

            }
            oList = this.getView().byId("Frage03");
            oBinding = oList.getBinding("items");
            if (oBinding !== undefined) oBinding.filter(aFilters);
            //
            aFilters = [];
            aFilters.push(new Filter("ArtNr", FilterOperator.EQ, "11")); // Frage00
            for (i = 0; i < oItems.length; i++) {
                if (this.guid !== "") {
                    aFilters.push(new Filter("Gbid", FilterOperator.EQ, this.guid));
                }

            }
            oList = this.getView().byId("Frage04");
            oBinding = oList.getBinding("items");
            if (oBinding !== undefined) oBinding.filter(aFilters);
            //
            aFilters = [];
            aFilters.push(new Filter("ArtNr", FilterOperator.EQ, "09")); // Frage00
            for (i = 0; i < oItems.length; i++) {
                if (this.guid !== "") {
                    aFilters.push(new Filter("Gbid", FilterOperator.EQ, this.guid));
                }

            }
            oList = this.getView().byId("Frage05");
            oBinding = oList.getBinding("items");
            if (oBinding !== undefined) oBinding.filter(aFilters);

        },

        onFinalEvent: function (oEvent) {
            if (!this.Question1) {
                this.Question1 = new Dialog({
                    type: DialogType.Message,
                    contentWidth: "700px",
                    title: "Information",
                    content: [
                    new Text({
                        text: "Mit „Auswahl Abschließen“ beenden Sie die GB-Auswahl, die dann nicht mehr änderbar ist, und gelangen direkt in die Online Maßnahmenliste. Die gespeicherte GB-Auswahl können Sie als Kopiervorlage verwenden. Die Online Maßnahmenliste muss jeweils neu ausgefüllt werden."
                    }),
                    new Text({
                        text: "Mit „Auswahl Sichern“ speichern Sie den aktuellen Stand der GB-Auswahl für die weitere Bearbeitung. Auch dies können Sie als Kopiervorlage verwenden."
                    })                                        
                    ],
                    buttons: [
                        new Button({
                            text: "Auswahl Abschließen (nicht mehr änderbar)",
                            icon: "sap-icon://flag",
                            type: sap.m.ButtonType.Accept,
                            press: function () {
                                this.onwizardCompleted(oEvent);
                                this.Question1.close();
                            }.bind(this)
                        }),
                        new Button({
                            text: "Auswahl Sichern (änderbar)",
                            icon: "sap-icon://save",
                            press: function () {
                                this.byId("btnsave").firePress();
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

        onExplorer: function () {
            this.onExploreOpenDialog().open();
        },

        onJaClose: function (oEvent) {
            this.onwizardCompleted(oEvent);
            this.onFinalOpenDialog().close();
        },

        onNeinClose: function (oEvent) {
            this.onFinalOpenDialog().close();
        },

        onUpdateFinished: function (oEvent) {
            var step = oEvent.getSource().getParent().getId().slice(-5);
            var oList = oEvent.getSource();
            oList.removeSelections();
            for (var i = 0; i < oList.getItems().length; i++) {
                if ((oEvent.getSource().getId().slice(-7) === "Frage02") && (oList.getItems()[i].getBindingContext().getObject().Ischeck === "X")) {
                    oList.setSelectedItem(oList.getItems()[i]);
                    this.onHidenBehinderungForm(oList.getItems()[i].getBindingContext().getObject().Auswhl);
                } else if (oList.getItems()[i].getBindingContext().getObject().Ischeck === "X") {
                    oList.setSelectedItem(oList.getItems()[i]);
                }

            }

            if (step !== "Step7") {
                if (oList.getItems().length === 0) {
                    oEvent.getSource().getParent().getContent()[0].setVisible(false);
                    oEvent.getSource().getParent().getContent()[1].setVisible(false);
                    oEvent.getSource().getParent().getContent()[2].setVisible(false);
                    oEvent.getSource().getParent().getContent()[3].setVisible(true);
                } else {
                    oEvent.getSource().getParent().getContent()[0].setVisible(true);
                    oEvent.getSource().getParent().getContent()[1].setVisible(true);
                    oEvent.getSource().getParent().getContent()[2].setVisible(true);
                    oEvent.getSource().getParent().getContent()[3].setVisible(false);
                }
            }
        },

        onFinishedTatigkeitList: function (oEvent) {
            var oList = oEvent.getSource();
            oList.removeSelections();
            for (var i = 0; i < oList.getItems().length; i++) {
                if (oList.getItems()[i].getBindingContext().getObject().Ausgewahlt === "X") {
                    oList.setSelectedItem(oList.getItems()[i]);
                }
            }
            var oItems = oList.getSelectedItems();
            this.onApplyFilterforAllTables(oItems);
        },

        onFinalOpenDialog: function () {
            if (!this._oDialogTb) {
                this._oDialogTb = sap.ui.xmlfragment("project1.fragment.FinalDialog", this);
                this.getView().addDependent(this._oDialogTb);
            }
            return this._oDialogTb;
        },

        OnTeambezeichnungSuggest: function (oEvent) {
            var oValidatedComboBox = oEvent.getSource(),
                sSelectedKey = oValidatedComboBox.getSelectedKey(),
                txtTeam = this.getView().byId("txtTeam");

                this.onClear('X');

            if (!sSelectedKey) {
                oValidatedComboBox.setValueState(sap.ui.core.ValueState.Error);
                var label = this.getView().getModel("i18n").getResourceBundle().getText("label.tooltip1");
                oValidatedComboBox.setValueStateText(label);
                MessageBox.error("Hier ist nur eine Auswahl von bereits vorhandenen Teams möglich. Eigene Definitionen sind hier nicht erlaubt.");
                txtTeam.setText('');
            } else {
                oValidatedComboBox.setValueState(sap.ui.core.ValueState.None);
                txtTeam.setText(sSelectedKey);
            }

            this.Bukrs = (oEvent.getSource().getSelectedItem() !== null) ? oEvent.getSource().getSelectedItem().getBindingContext().getObject()
                .Bukrs : "";

            this.additionalInfoValidation(oEvent);
        },


        OnArbeitsstellenbezeichnungSuggest: function (oEvent) {
            var oValidatedComboBox = oEvent.getSource(),
                sSelectedKey = oValidatedComboBox.getValue();
            if (!sSelectedKey) {
                oValidatedComboBox.setValueState(sap.ui.core.ValueState.Error);
                var label = this.getView().getModel("i18n").getResourceBundle().getText("label.tooltip1");
                oValidatedComboBox.setValueStateText(label);
                //               MessageBox.error("Hier ist nur eine Auswahl von bereits vorhandenen Arbeitsstellenbezeichnung möglich. Eigene Definitionen sind hier nicht erlaubt.");
            }
            else if (sSelectedKey.length > 70) {
                oValidatedComboBox.setValue(oValidatedComboBox.getValue().substring(0, 70))

                MessageToast.show(
                    "Der Text ist auf maximal 70 Zeichen begrenzt.", {
                    duration: 10000
                });


            } else {
                oValidatedComboBox.setValueState(sap.ui.core.ValueState.None);
            }

            this.additionalInfoValidation(oEvent);
        },

        additionalInfoValidation: function (evt) {
            var Teambezeichnung = this.byId("Teambezeichnung");
            var Tatigkeitsbezeichnung = this.byId("Tatigkeitsbezeichnung");
            var txtArbeit = this.getView().byId("txtArbeit");

            txtArbeit.setText("");
            if (Tatigkeitsbezeichnung.getValue() === "") {
                Tatigkeitsbezeichnung.setValueState("Error");

            } else {
                Tatigkeitsbezeichnung.setValueState("None");
                txtArbeit.setText(Tatigkeitsbezeichnung.getValue());
            }
            if ((Teambezeichnung.getValueState() === "Error") || ( Tatigkeitsbezeichnung.getValueState( ) === "Error" )) 
            {
                this.byId("CreateWizard").invalidateStep(this.byId("Step1"));
            } else {
                this.byId("CreateWizard").validateStep(this.byId("Step1"));
            }
            if (this.WContainer !== "") {
                this.isDataChanged = true;
                this.WContainer.setDirtyFlag(this.isDataChanged);
            }
        },

        onClear: function ( isChange ) {
            var Teambezeichnung = this.byId("Teambezeichnung");
            var Erstellungsdatum = this.byId("Erstellungsdatum");
            var Tatigkeitsbezeichnung = this.byId("Tatigkeitsbezeichnung");
            var oCreateWizard = this.byId("CreateWizard");
            var oFirstStep = oCreateWizard.getSteps()[0];
            var Beschreibung = this.byId("Beschreibung");

            var oFrage0 = this.getView().byId("Frage00");
            var oFrage1 = this.getView().byId("Frage01");
            var oFrage2 = this.getView().byId("Frage02");
            var oFrage3 = this.getView().byId("Frage03");
            var oFrage4 = this.getView().byId("Frage04");
            var oFrage5 = this.getView().byId("Frage05");

            this.getView().byId("tatigkeitList").getBinding("items").refresh(true);

            oFrage0.removeSelections();
            oFrage1.removeSelections();
            oFrage2.removeSelections();
            oFrage3.removeSelections();
            oFrage4.removeSelections();
            oFrage5.removeSelections();

            if ( isChange == '' ) { 
                Teambezeichnung.setValue("");
                Teambezeichnung.setSelectedIndex(0);
                Teambezeichnung.setValueState("Error");
            }

            Erstellungsdatum.setDateValue(new Date());
            Tatigkeitsbezeichnung.setValue("");
            Tatigkeitsbezeichnung.setValueState("Error");
            Beschreibung.setValue("");

            this.guid = "";
            this.Status = "00";

            oCreateWizard.discardProgress(oFirstStep);
            oFirstStep.setValidated(false);

        },

        onSave: function (oStatus) {
            var selectedMaßnahme = [];
            var extra = [];
            var oTeambezeichnung = this.getView().byId("Teambezeichnung").getSelectedItem().getBindingContext().getObject();
            var oModel = this.getView().getModel();
            var oList = this.getView().byId("tatigkeitList");
            var rowItems = oList.getSelectedItems();
            var oParams = {},
                oItemEntry = {};

            oModel.setUseBatch(true);
            oModel.setDeferredBatchGroups(["myId"]);
            oModel.defaultCountMode = "None";

            rowItems = oList.getSelectedItems();
            for (var i = 0; i < rowItems.length; i++) {
                selectedMaßnahme.push({
                    ArtNr: rowItems[i].getBindingContext().getObject().ArtNr,
                    GbNr: rowItems[i].getBindingContext().getObject().GbNr
                });
            }

            oList = this.getView().byId("ArbeitszeitenList01");
            rowItems = oList.getSelectedItems();
            for (i = 0; i < rowItems.length; i++) {
                selectedMaßnahme.push({
                    ArtNr: rowItems[i].getBindingContext().getObject().ArtNr,
                    GbNr: rowItems[i].getBindingContext().getObject().GbNr
                });
            }

            oList = this.getView().byId("EinsatzorteList01");
            rowItems = oList.getSelectedItems();
            for (i = 0; i < rowItems.length; i++) {
                selectedMaßnahme.push({
                    ArtNr: rowItems[i].getBindingContext().getObject().ArtNr,
                    GbNr: rowItems[i].getBindingContext().getObject().GbNr
                });
            }

            oList = this.getView().byId("ArbeitsmittelList01");
            rowItems = oList.getSelectedItems();
            for (i = 0; i < rowItems.length; i++) {
                selectedMaßnahme.push({
                    ArtNr: rowItems[i].getBindingContext().getObject().ArtNr,
                    GbNr: rowItems[i].getBindingContext().getObject().GbNr
                });
            }

            oList = this.getView().byId("BetriebseinrichtungenList01");
            rowItems = oList.getSelectedItems();
            for (i = 0; i < rowItems.length; i++) {
                selectedMaßnahme.push({
                    ArtNr: rowItems[i].getBindingContext().getObject().ArtNr,
                    GbNr: rowItems[i].getBindingContext().getObject().GbNr
                });
            }

            oList = this.getView().byId("Frage00");
            rowItems = oList.getSelectedItems();
            for (i = 0; i < rowItems.length; i++) {
                selectedMaßnahme.push({
                    ArtNr: rowItems[i].getBindingContext().getObject().ArtNr,
                    GbNr: rowItems[i].getBindingContext().getObject().GbNr
                });
            }

            oList = this.getView().byId("Frage01");
            rowItems = oList.getSelectedItems();
            for (i = 0; i < rowItems.length; i++) {
                selectedMaßnahme.push({
                    ArtNr: rowItems[i].getBindingContext().getObject().ArtNr,
                    GbNr: rowItems[i].getBindingContext().getObject().GbNr
                });
            }

            oList = this.getView().byId("Frage02");
            rowItems = oList.getSelectedItems();
            for (i = 0; i < rowItems.length; i++) {
                selectedMaßnahme.push({
                    ArtNr: rowItems[i].getBindingContext().getObject().ArtNr,
                    GbNr: rowItems[i].getBindingContext().getObject().GbNr
                });
            }

            oList = this.getView().byId("Frage03");
            rowItems = oList.getSelectedItems();
            for (i = 0; i < rowItems.length; i++) {
                selectedMaßnahme.push({
                    ArtNr: rowItems[i].getBindingContext().getObject().ArtNr,
                    GbNr: rowItems[i].getBindingContext().getObject().GbNr
                });
            }

            oList = this.getView().byId("Frage04");
            rowItems = oList.getSelectedItems();
            for (i = 0; i < rowItems.length; i++) {
                selectedMaßnahme.push({
                    ArtNr: rowItems[i].getBindingContext().getObject().ArtNr,
                    GbNr: rowItems[i].getBindingContext().getObject().GbNr
                });
            }
            if (rowItems.length >= 1) {
                if (rowItems[0].getBindingContext().getObject().GbNr === "13") {
                    this.getView().byId("Frage06").removeAllItems();
                }
            }

            oList = this.getView().byId("Frage05");
            rowItems = oList.getSelectedItems();
            for (i = 0; i < rowItems.length; i++) {
                selectedMaßnahme.push({
                    ArtNr: rowItems[i].getBindingContext().getObject().ArtNr.substring(1),
                    GbNr: rowItems[i].getBindingContext().getObject().GbNr
                });
            }

            oList = this.getView().byId("Frage06");
            for (i = 0; i < oList.getItems().length; i++) {
                if ((oList.getItems()[i].getCells()[0].getValue() !== "") ||
                    (oList.getItems()[i].getCells()[1].getValue() !== "") ||
                    (oList.getItems()[i].getCells()[2].getValue() !== "") ||
                    (oList.getItems()[i].getCells()[3].getValue() !== "")) {
                    extra.push({
                        "GefaehrdungNr": oList.getItems()[i].getCells()[0].getValue(),
                        "DomvalueL": oList.getItems()[i].getCells()[1].getValue(),
                        "Code": oList.getItems()[i].getCells()[2].getValue(),
                        "SchutzmassnahmenNr": oList.getItems()[i].getCells()[3].getValue()
                    });
                }
            }

            // save
            var oEntry = {};
            oEntry.Teambezeich = this.getView().byId("Teambezeichnung").getValue();
            oEntry.Erstelldatum = this.getView().byId("Erstellungsdatum").getDateValue();
            oEntry.Tatigkeits = this.getView().byId("Tatigkeitsbezeichnung").getValue().substring(0, 70);
            oEntry.Beschreib = this.getView().byId("Beschreibung").getValue();
            oEntry.Bukrs = this.Bukrs;
            oEntry.We = oTeambezeichnung.We;
            oEntry.ZzSorg = oTeambezeichnung.ZzSorg;
            oEntry.ZzOrge = oTeambezeichnung.ZzOrge;
            oEntry.ZzTeamLfd = oTeambezeichnung.ZzTeamLfd;
            oEntry.GebaeudeId = oTeambezeichnung.GebaeudeId;
            if (this.guid !== "") {
                oEntry.Gbid = this.guid;
            }
            oEntry.Status = oStatus;
            oParams.async = false;
            oParams.batchGroupId = "myId";
            oModel.create("/KOPFDATENSet", oEntry, oParams);
            for (i = 0; i < selectedMaßnahme.length; i++) {
                oItemEntry = selectedMaßnahme[i];
                oModel.create("/MASNAMELISTESet", oItemEntry, oParams);
            }

            for (i = 0; i < extra.length; i++) {
                oItemEntry = extra[i];
                oModel.create("/EXTRASet", oItemEntry, oParams);
            }

            var that = this;
            oModel.submitChanges({
                groupId: "myId",
                success: function (oData, oResponse) {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                    that.guid = oData.__batchResponses[0].__changeResponses[0].data.Gbid;

                    if (that.WContainer !== "") {
                        that.isDataChanged = false;
                        that.WContainer.setDirtyFlag(that.isDataChanged);
                    }

                    if (oData.__batchResponses[0].__changeResponses[0].data.Status === "01") {

                        that.new = "";
                        oRouter.navTo("closing", {
                            guid: that.guid,
                            first: 1
                        });
                    } else {
                        MessageToast.show("Gesichert!", {
                            duration: 15000
                        });
                        // btnsave.setEnabled(true);
                    }
                },
                error: function (oError) {
                    var oJson = JSON.parse(oError.responseText);
                    this._bIsError = true;
                    oJson = JSON.parse(oError.responseText);
                    MessageBox.information(oJson.error.message.value);
                }
            });
        },

        onListSelectionChange: function (oEvent) {

            var formName = oEvent.getSource().getId().substr(oEvent.getSource().getId().length - 7);
            if (this.WContainer !== "") {
                this.isDataChanged = true;
                this.WContainer.setDirtyFlag(this.isDataChanged);
            }

            if (formName === "Frage02") {
                this.onHidenBehinderungForm(oEvent.getSource().getSelectedContexts()[0].getObject().Auswhl);
            }

        },

        onHidenBehinderungForm: function (text) {
            var Frage05 = this.getView().byId("Frage05");

            if (text === "Bei der/den betrachteten Arbeitsstelle/n (Job-Profile/n) aktuell keine Menschen mit Behinderungen.") {
                Frage05.setVisible(false);
                Frage05.removeSelections();
            } else {
                Frage05.setVisible(true);
                Frage05.setSelectedItem(Frage05.getItems()[0]);
            }

        },

        onAddLine: function (oEvent) {
            var oTable = oEvent.getSource().getParent().getParent();
            var columnListItemNewLine = new sap.m.ColumnListItem({
                cells: [
                    new sap.m.TextArea({
                        value: "{GefaehrdungNr}",
                        growingMaxLines: 7,
                        width: "100%",
                        rows: 8,
                        maxLength: 255
                    }),
                    new sap.m.TextArea({
                        value: "{DomvalueL}",
                        growingMaxLines: 7,
                        width: "100%",
                        rows: 8,
                        maxLength: 255
                    }),
                    new sap.m.TextArea({
                        value: "{Code}",
                        growingMaxLines: 7,
                        width: "100%",
                        rows: 8,
                        maxLength: 255
                    }),
                    new sap.m.TextArea({
                        value: "{SchutzmassnahmenNr}",
                        growingMaxLines: 7,
                        width: "100%",
                        rows: 8,
                        maxLength: 255
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://delete",
                        press: this.onDelLine
                    })
                ]
            });

            oTable.addItem(columnListItemNewLine);

        },

        onDelLine: function (oEvent) {
            var oTable = oEvent.getSource().getParent().getParent();
            var selectedItem = oEvent.getSource().getParent();
            oTable.removeItem(selectedItem);
        },

        onApproveSave: function (oEvent) {
            var error6 = this.getView().getModel("i18n").getResourceBundle().getText("label.frage06.error");
            var error7 = this.getView().getModel("i18n").getResourceBundle().getText("label.frage07.error");
            var Teambezeichnung = this.getView().byId("Teambezeichnung");
            var Tatigkeitsbezeichnung = this.getView().byId("Tatigkeitsbezeichnung");

            if (Teambezeichnung.getValueState() === "Error") {
                MessageBox.error(error6);

            } else if (Tatigkeitsbezeichnung.getValueState() === "Error") {
                MessageBox.error(error7);

            } else {
                this.onSave("00");
            }

        },

        onwizardCompleted: function (oEvent) {
            //      if (this.Status === "00") {
            this.onSave("01");
            //      }
        },

        onCheckBeforeAction: function () {
            var oReturn = true;
            var oFrage0 = this.getView().byId("Frage00");
            var oFrage1 = this.getView().byId("Frage01");
            var oFrage2 = this.getView().byId("Frage02");
            var oFrage3 = this.getView().byId("Frage03");
            var oFrage4 = this.getView().byId("Frage04");
            var oFrage5 = this.getView().byId("Frage05");
            var Teambezeichnung = this.getView().byId("Teambezeichnung");
            var Tatigkeitsbezeichnung = this.getView().byId("Tatigkeitsbezeichnung");

            var error0 = (oFrage0.getSelectedItems().length === 0) ? this.getView().getModel("i18n").getResourceBundle().getText(
                "label.frage00.error") : "";
            var error1 = (oFrage1.getSelectedItems().length === 0) ? this.getView().getModel("i18n").getResourceBundle().getText(
                "label.frage01.error") : "";
            var error2 = (oFrage2.getSelectedItems().length === 0) ? this.getView().getModel("i18n").getResourceBundle().getText(
                "label.frage02.error") : "";
            var error3 = (oFrage3.getSelectedItems().length === 0) ? this.getView().getModel("i18n").getResourceBundle().getText(
                "label.frage03.error") : "";
            var error4 = (oFrage4.getSelectedItems().length === 0) ? this.getView().getModel("i18n").getResourceBundle().getText(
                "label.frage04.error") : "";
            var error5 = (oFrage5.getSelectedItems().length === 0) ? this.getView().getModel("i18n").getResourceBundle().getText(
                "label.frage05.error") : "";
            var error6 = this.getView().getModel("i18n").getResourceBundle().getText("label.frage06.error");
            var error7 = this.getView().getModel("i18n").getResourceBundle().getText("label.frage07.error");

            if (error0 !== "") {
                MessageBox.error(error0);
                oReturn = false;
            } else if (error1 !== "") {
                MessageBox.error(error1);
                oReturn = false;
            } else if (error2 !== "") {
                MessageBox.error(error2);
                oReturn = false;
            } else if (error3 !== "") {
                MessageBox.error(error3);
                oReturn = false;
            } else if (error4 !== "") {
                MessageBox.error(error4);
                oReturn = false;
            } else if (error5 !== "") {
                MessageBox.error(error5);
                oReturn = false;
            } else if (Teambezeichnung.getValueState() === "Error") {
                MessageBox.error(error6);
                oReturn = false;
            } else if (Tatigkeitsbezeichnung.getValueState() === "Error") {
                MessageBox.error(error7);
                oReturn = false;
            }
            return oReturn;
        },

        onUpdateFinishedWithGoMoreDetail: function (oEvent) {
            this.onUpdateFinished(oEvent);
            var index = this.getView().byId("Frage04").getItems().length - 1;
            var lastItems = this.getView().byId("Frage04").getItems()[index];
            var selectedItem = this.getView().byId("Frage04").getSelectedItem();

            if (lastItems === selectedItem) {
                this.getView().byId("Frage06").setVisible(true);
//                this.getView().byId("fasilink").setVisible(true);
            } else {
                this.getView().byId("Frage06").setVisible(false);
//                this.getView().byId("fasilink").setVisible(false);
            }

        },

        onSelectionCheck: function (oEvent) {
            var isEnabled = this.byId("btnsave").getEnabled();

            if (!isEnabled) {
                var isSelected = (oEvent.getParameter("listItem").getBindingContext().getObject().Ausgewahlt == 'X') ? true : false;
                oEvent.getParameter("listItem").setSelected(isSelected);
                MessageToast.show(
                    "GB Auswahl ist nach Abschluss der Maßnahmenliste nicht mehr änderbar und kann auch nicht mehr kopiert werden. Wenn Sie eine GB-Auswahl nachträglich ändern wollen, dann erstellen Sie bitte eine Kopie von einer GB-Zuordnung, derer Maßnahmenliste noch nicht abgeschlossen ist. Kopieren im GB Überblick mit icon „Auswahl kopieren“.“", {
                    duration: 15000
                });
            }

        },

        onSelectionTableCheck: function (oEvent) {
            var isEnabled = this.byId("btnsave").getEnabled();

            if (!isEnabled) {
                for (var i = 0; i < oEvent.getSource().getItems().length; i++) {
                    var isSelected = (oEvent.getSource().getItems()[i].getBindingContext().getObject().Ischeck == 'X') ? true : false;
                    oEvent.getSource().getItems()[i].setSelected(isSelected);
                }
                if ( (this.Status === "01") || (this.Status === "02") ) {
                    MessageToast.show(
                        "GB Auswahl ist nach Abschluss der Maßnahmenliste nicht mehr änderbar und kann auch nicht mehr kopiert werden. Wenn Sie eine GB-Auswahl nachträglich ändern wollen, dann erstellen Sie bitte eine Kopie von einer GB-Zuordnung, derer Maßnahmenliste noch nicht abgeschlossen ist. Kopieren im GB Überblick mit icon „Auswahl kopieren“.“", {
                        duration: 15000
                    });
                } 
                /*
                else if (this.Status === "02") {
                    MessageToast.show(
                        "GB Auswahl und Online Maßnahmenliste sind im Status „Abgeschlossen mit PDF“ nicht änderbar und können auch nicht mehr kopiert werden.", {
                        duration: 15000
                    });
                }
                */
            } else {
                var formName = oEvent.getSource().getId().substr(oEvent.getSource().getId().length - 7);
                if (this.WContainer !== "") {
                    this.isDataChanged = true;
                    this.WContainer.setDirtyFlag(this.isDataChanged);
                }

                if (formName === "Frage02") {
                    this.onHidenBehinderungForm(oEvent.getSource().getSelectedContexts()[0].getObject().Auswhl);
                }
            }

        },

        onInfomationPress1: function (oEvent) {
            var oPopover = new ResponsivePopover({
                showHeader: false,
                placement: "Right",
                contentWidth: "500px",
                content: [
                    new sap.m.Panel({
                        content: [
                            new sap.m.FlexBox({
                                alignItems: "Start",
                                direction: "Column",
                                justifyContent: "Start",
                                items: [
                                    new FormattedText({
                                        htmlText: "Wenn Ihnen mehrere Teambezeichnungen zur Auswahl angezeigt werden, wählen Sie bitte das Team aus, für welches Sie die GB-Auswahl erstellen möchten."
                                    }),
                                    new FormattedText({
                                        htmlText: "<strong><u>Hinweis:</strong></u>&nbsp;Verantwortlich für die GB-Auswahl ist die personalverantwortliche (disziplinarische) Führungskraft des Teams."
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

        onInfomationPress2: function (oEvent) {
            var oPopover = new ResponsivePopover({
                showHeader: false,
                placement: "Right",
                contentWidth: "500px",
                content: [
                    new sap.m.Panel({
                        content: [
                            new sap.m.FlexBox({
                                alignItems: "Start",
                                direction: "Column",
                                justifyContent: "Start",
                                items: [
                                    new FormattedText({
                                        htmlText: "Bitte wählen Sie das entsprechende Job-Profil (Stellen- oder Job-Bezeichnung) aus, für welches Sie die GB-Auswahl vornehmen möchten." +
                                                  "<p>Bei Job-Profilen mit identischen Tätigkeitsarten (Büroarbeit, Montagetätigkeiten, Callcenter, Pförtner, Telekom-Shop, Arzt u. med. Assistenz) muss die GB-Auswahl nur ein Mal getätigt werden, wenn auch die Arbeitsbedingungen (Arbeitszeit, Einsatzort und techn. Betriebseinrichtung, an der gearbeitet wird) identisch sind.</p>" +
                                                  "<p>Falls keine zutreffende Bezeichnung vorhanden ist oder wenn sie die GB-Auswahl für mehrere Job-Profile gemeinsam erstellen wollen, ändern oder ergänzen Sie bitte den Text (maximal 70 Zeichen). Erstellte GB-Zuordnungen können später im „Überblick GB-Zuordnungen“ als Kopiervorlage verwendet werden.</p>"

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

        onInfomationPress3: function (oEvent) {
            var oPopover = new ResponsivePopover({
                showHeader: false,
                placement: "Right",
                contentWidth: "500px",
                content: [
                    new sap.m.Panel({
                        content: [
                            new sap.m.FlexBox({
                                alignItems: "Start",
                                direction: "Column",
                                justifyContent: "Start",
                                items: [

                                    new FormattedText({
                                        htmlText: "Ausschlaggebend für die Auswahl der zutreffenden Gefährdungsbeurteilungen sind die konkreten Arbeitsbedingungen bei der verrichteten Tätigkeit! Wenn Sie Job-Profile mit identischen Tätigkeitsarten aber mit unterschiedlichen Arbeitsbedingungen (Arbeitszeit, Einsatzort, Betriebseinrichtungen) haben, müssen Sie für jedes Job-Profil eine eigene GB-Auswahl erstellen. " +
                                                  "<p>Um diese voneinander unterscheiden zu können, können Sie in diesem Feld eine ergänzende Kurzbezeichnung in das Feld Beschreibung eintragen. (optional)"
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


        onLinkPress: function (oEvent) {

            var oPopover = new ResponsivePopover({
                showHeader: false,
                placement: "Bottom",
                content: [
                    new sap.m.Panel({
                        content: [
                            new sap.m.FlexBox({
                                alignItems: "Start",
                                direction: "Column",
                                justifyContent: "Start",
                                items: [
                                    new FormattedText({
                                        htmlText: "<strong><u>Rechtlicher Hinweis</strong></u>:<p>"
                                    }),
                                    new FormattedText({
                                        htmlText: "Das Tool ist eine Arbeitshilfe für Führungskräfte."
                                    }),
                                    new FormattedText({
                                        htmlText: "Es entbindet Führungskräfte nicht von Ihrer Verantwortung im Arbeitsschutz,"
                                    }),
                                    new FormattedText({
                                        htmlText: "Gefährdungen in Ihrem Verantwortungsbereich selbständig zu erkennen und zu minimieren."
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

        onGoMoreDetail: function (oEvent) {
            var element = oEvent.getParameter("listItems")[0].sId;
            var lastChar = element.charAt(element.length - 1);
//            var fasilink = this.getView().byId("fasilink");

            if (this.byId("btnsave").getEnabled() === false) {
                return;
            };

            if (parseInt(lastChar) === oEvent.getSource().getItems().length - 1) // letze zeile
            {
                this.getView().byId("Frage06").setVisible(true);
                if (!this.oInfo) {
                    this.oInfo = new Dialog({
                        type: DialogType.Message,
                        contentWidth: "700px",
                        title: "Information",
                        content: [new Text({
                            text: this.getView().getModel("i18n").getResourceBundle().getText("label.frage08.info1") + " " + this.getView().getModel("i18n")
                                .getResourceBundle().getText("label.frage08.info2") + " " + this.getView().getModel("i18n").getResourceBundle().getText(
                                    "label.frage08.info3")
                        }),
                        new Link({
                            text: "Kontakt FASi",
                            target: "_blank",
                            href: "https://personal.telekom.de/mitarbeiter-infos/soziales-gesundheit-arbeitsschutz/kontakt/kontakte-fachkraefte-arbeitssicherheit"
                        })
                        ],
                        endButton: new Button({
                            text: "Schließen",
                            press: function () {
                                this.oInfo.close();
                            }.bind(this)
                        })
                    });
                }
                this.oInfo.open();
            } else {
                this.getView().byId("Frage06").setVisible(false);
            }
//            fasilink.setVisible(this.getView().byId("Frage06").getVisible());
            this.onListSelectionChange(oEvent);

        },
        onGetSelectedTeambezeichnung: function () {

        }

    });
});