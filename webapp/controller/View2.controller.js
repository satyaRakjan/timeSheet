sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/routing/History',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast',
	'sap/ui/core/Fragment'

], function (Controller, History, JSONModel, MessageToast, Fragment) {
	"use strict";

	return Controller.extend("ICS_TimeSheet.ICS_TimeSheet.controller.View2", {
		onInit: function () {
			this.holiday = this.getOwnerComponent().getModel("Holiday").getProperty("/year");
			this.AMIcon = this.byId("AMIcon");
			this.PMIcon = this.byId("PMIcon");
			this.delBtn = this.byId("delBtn");
			this.copyBtn = this.byId("copyBtn");
			this.oModel = new JSONModel({
				selectedDates: []
			});
			this.getView().setModel(this.oModel);

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteView2").attachPatternMatched(this._onObjectMatched, this);
			var oLeg1 = this.getView().byId("legend1");
			oLeg1.addItem(new sap.ui.unified.CalendarLegendItem({
				color: "#9a9393",
				text: "Weekend & Holiday"
			}));
			oLeg1.addItem(new sap.ui.unified.CalendarLegendItem({
				color: "#06B02F",
				text: "Done"
			}));
			oLeg1.addItem(new sap.ui.unified.CalendarLegendItem({
				color: "#F80404",
				text: "Leave"
			}));
			oLeg1.addItem(new sap.ui.unified.CalendarLegendItem({
				color: "#F8B504",
				text: "Half day leave"
			}));
			this.addSpecialDate();

		},
		onAfterRendering: function () {

		},
		_onObjectMatched: function (oEvent) {
			var date = oEvent.getParameter("arguments").getDate;
			var selectDate = new Date(date);
			var cal = this.byId("calendar");
			cal.setStartDate(selectDate);
			cal.removeAllSelectedDates();
			cal.addSelectedDate(new sap.ui.unified.DateRange({
				startDate: selectDate
			}));
			this.timeSheetSelect(selectDate);
			this.addSpecialDate();
		},
		onExit: function () {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		},

		addSpecialDate: function () {
			var oCalendar = this.byId("calendar");
			oCalendar.removeAllSpecialDates();
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var TSEntry = Object.entries(TS);
			TSEntry.forEach((count) => {
				try {
					var fullDate = new Date(count[1].Year, count[1].Month, count[1].Date);
					if (count[1].Session[0].status == "Confirmed" && count[1].Session[1].status == "Confirmed") {
						oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate: new Date(fullDate),
							endDate: new Date(fullDate),
							type: sap.ui.unified.CalendarDayType.Type18
						}));
					} else if (count[1].Session[0].status == "Leave" && count[1].Session[1].status == "Leave") {
						oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate: new Date(fullDate),
							endDate: new Date(fullDate),
							type: sap.ui.unified.CalendarDayType.Type02
						}));
					} else if (count[1].Session[0].status == "Leave" || count[1].Session[1].status == "Leave") {
						oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate: new Date(fullDate),
							endDate: new Date(fullDate),
							type: sap.ui.unified.CalendarDayType.Type01
						}));
					}
				} catch (err) {

				}
			})
			var keys = Object.entries(this.holiday[0]);
			this.specialDate = [];
			keys.forEach((v) => {
				v[1].forEach((j) => {
					var fullDate = j.month + "/" + j.startDate + "/" + v[0];
					this.specialDate.push(fullDate);
					oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate: new Date(fullDate),
						endDate: new Date(fullDate),
						type: sap.ui.unified.CalendarDayType.NonWorking,
						tooltip: j.title
					}));
				})
			})
		},
		timeSheetSelect: function (selectDate) {
			this.addSpecialDate();
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: " d MMM yyyy"
			});
			var dateFormatted = oDateFormat.format(selectDate);
			var oViewModel = new JSONModel({
				selectDate: dateFormatted
			});
			var selFullDate = String(selectDate.getFullYear() + "" + selectDate.getMonth() + "" + selectDate.getDate());
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var leave = this.getOwnerComponent().getModel("leave").getProperty("/leave");
			var foundTS = TS.find(element => element.ID == selFullDate);
			this.byId("sessionList").setMode("None");
			this.AMIcon.setSrc("");
			this.PMIcon.setSrc("");
			this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").setSelected(false);
			this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").setSelected(false);
			this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").setEnabled(false);
			this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").setEnabled(false);
			this.byId("AM").setBlocked(false);
			this.byId("PM").setBlocked(false);
			this.getView().setModel(oViewModel, "view");
			var listAM = document.getElementById("container-ICS_TimeSheet---View2--AM");
			var listPM = document.getElementById("container-ICS_TimeSheet---View2--PM");
			listAM.style.backgroundColor = '#ffffff';
			listPM.style.backgroundColor = '#ffffff';
			if (foundTS) {
				Object.entries(foundTS.Session).forEach((obj) => {
					if (obj[1].status) {
						if (obj[1].status == "Leave") {
							this.byId(obj[1].ID).setBlocked(true);
						} else {
							this.byId(obj[1].ID).setBlocked(false);
							this.list = this.byId(obj[1].ID + "Icon");
							this.list.setSrc("sap-icon://notes")
							this.byId("container-ICS_TimeSheet---View2--" + obj[1].ID + "-selectMulti").setEnabled(true)
							this.byId("sessionList").setMode("MultiSelect");
						}
					}
				})
			} else {
				this.delBtn.setEnabled(false);
				this.copyBtn.setEnabled(false);
			}
		},

		handleCalendarSelect: function (oEvent) {
			var oCalendar = oEvent.getSource(),
				oSelectedDate = oCalendar.getSelectedDates()[0],
				selectDate = oSelectedDate.getStartDate(),
				dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "MM/dd/YYYY"
				}),
				dateFormatted = dateFormat.format(selectDate),
				result = this.specialDate.includes(dateFormatted);
			if (result == true) {
				var msg = 'this day is NonWorking.';
				MessageToast.show(msg);
			} else {
				this.timeSheetSelect(selectDate);
			}
		},
		onNavBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteView1");
		},
		AMPress: function (oEvent) {
			var cal = this.byId("calendar");
			var date = String(cal.getSelectedDates()[0].getStartDate());
			var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
			loRouter.navTo("RouteView3", {
				session: "Morning",
				date: date
			});
		},
		PMPress: function (oEvent) {
			var cal = this.byId("calendar");
			var date = String(cal.getSelectedDates()[0].getStartDate());
			var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
			loRouter.navTo("RouteView3", {
				session: "Afternoon",
				date: date
			});
		},

		onSelectionChange: function (oEvent) {
			var selected = oEvent.getParameter("selected");
			var cal = this.byId("calendar");
			var oSelectedDate = cal.getSelectedDates()[0];
			var selectDate = oSelectedDate.getStartDate();
			if (selected == true) {
				var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
				var TSEntry = Object.entries(TS);
				TSEntry.forEach((count) => {
					Object.entries(count[1].Session).forEach((sessions) => {
						var fullDate = new Date(count[1].Year, count[1].Month, count[1].Date);
						if (String(fullDate) == String(selectDate)) {
							if (sessions[1].status == "Leave") {

							} else {
								this.byId("container-ICS_TimeSheet---View2--" + sessions[1].ID + "-selectMulti").setSelected(true);
								this.delBtn.setEnabled(true);
								this.copyBtn.setEnabled(true);
							}

						}
					})
				})
			} else {
				this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").setSelected(false);
				this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").setSelected(false);
				this.delBtn.setEnabled(false);
				this.copyBtn.setEnabled(false);

			}
		},
		onSelectionSession: function (oEvent) {
			var getAM = this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").getSelected();
			var getPM = this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").getSelected();
			if (getAM == true || getPM == true) {
				this.copyBtn.setEnabled(true)
				this.delBtn.setEnabled(true)
			} else {
				this.copyBtn.setEnabled(false)
				this.delBtn.setEnabled(false)
			}
		},
		copyTo: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._oPopover) {
				Fragment.load({
					id: "copyTo",
					name: "ICS_TimeSheet.ICS_TimeSheet.view.copyTo",
					controller: this
				}).then(function (oPopover) {
					this._oPopover = oPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}
			this.calendarCopy();

		},
		onClose: function () {
			var oData = {
				selectedDates: []
			};
			this.oModel.setData(oData);
			this._oPopover.close();
		},
		calendarCopy: function () {
			var getAM = this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").getSelected();
			var getPM = this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").getSelected()
			var oCalendarCopy = Fragment.byId("copyTo", "calendarCopy");
			var keys = Object.entries(this.holiday[0]);
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var TSEntry = Object.entries(TS);
			this.Status = "";
			oCalendarCopy.removeAllSelectedDates()
			oCalendarCopy.removeAllSpecialDates();
			keys.forEach((v) => {
				v[1].forEach((j) => {
					var fullDate = j.month + "/" + j.startDate + "/" + v[0];
					oCalendarCopy.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate: new Date(fullDate),
						endDate: new Date(fullDate),
						type: sap.ui.unified.CalendarDayType.NonWorking,
						tooltip: j.title
					}));
				})
			})

			TSEntry.forEach((count) => {
				var fullDate = new Date(count[1].Year, count[1].Month, count[1].Date);
				if (getAM == true && getPM == true) {
					this.Status = "All";
					if (count[1].Session[0].status || count[1].Session[1].status) {
						oCalendarCopy.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate: new Date(fullDate),
							endDate: new Date(fullDate),
							type: sap.ui.unified.CalendarDayType.NonWorking
						}));
					}
				} else if (getAM == true) {
					this.Status = "AM";
					if (count[1].Session[0].status) {
						oCalendarCopy.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate: new Date(fullDate),
							endDate: new Date(fullDate),
							type: sap.ui.unified.CalendarDayType.NonWorking
						}));
					} else {

					}
				} else if (getPM == true) {
					this.Status = "PM";
					if (count[1].Session[1].status) {
						oCalendarCopy.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate: new Date(fullDate),
							endDate: new Date(fullDate),
							type: sap.ui.unified.CalendarDayType.NonWorking
						}));
					} else {

					}
				}
			})

		},
		handleCalendarSelectCopy: function (oEvent) {
			var oCalendar = oEvent.getSource(),
				aSelectedDates = oCalendar.getSelectedDates(),
				oData = {
					selectedDates: [],
					Date: []
				},
				oDate,
				DateID,
				i,
				specialDateArr = oCalendar.getSpecialDates();

			var currentDate = new Date();
			// currentDate.setDate(5);
			currentDate.setHours(0, 0, 0, 0);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: " d MMM yyyy"
			});
			if (aSelectedDates.length > 0) {
				for (i = 0; i < aSelectedDates.length; i++) {
					oDate = aSelectedDates[i].getStartDate();
					var found = specialDateArr.find(s => String(s.getStartDate()) == String(oDate));
					var dateFormatted = oDateFormat.format(oDate);
					var dateFormatted = oDateFormat.format(oDate);
					if (found) {
						oCalendar.removeSelectedDate(i);
						MessageToast.show("can't copy.");
					} else if (currentDate.getDate() >= 5) {
						if (oDate.getMonth() >= currentDate.getMonth()) {
							oData.selectedDates.push({
								Date: dateFormatted
							});
							oData.Date.push(oDate)
						} else {
							oCalendar.removeSelectedDate(i)
							MessageToast.show("Time out to Time stamp");
						}

					} else {
						oData.selectedDates.push({
							Date: dateFormatted
						});
						oData.Date.push(oDate);
					}
				}
				this.oModel.setData(oData);
			} else {
				var oData = {
					selectedDates: []
				};
				this.oModel.setData(oData);
			}
		},
		onSubmitCopy: function () {
			var getAM = this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").getSelected();
			var getPM = this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").getSelected();
			var cal = this.byId("calendar");
			var date = cal.getSelectedDates()[0].getStartDate();
			var oModel = this.getView().getModel("timeSheet");
			var oModelData = oModel.getProperty("/TS");
			var getYear = date.getFullYear();
			var getMonth = date.getMonth();
			var getDate = date.getDate();
			var fullDate = getYear + "" + getMonth + "" + getDate;
			var index = oModelData.findIndex(s => s.ID == fullDate)
			var seleteArr = this.oModel.oData.Date;
			var msg = 'copy success.';
			var obj = "";
			for (var i in seleteArr) {
				var yearSelect = seleteArr[i].getFullYear();
				var monthSelect = seleteArr[i].getMonth();
				var dateSelect = seleteArr[i].getDate();
				var fullDateSelect = yearSelect + "" + monthSelect + "" + dateSelect;
				var TSAM = oModel.getProperty("/TS/" + index + "/Session/0");
				var TSPM = oModel.getProperty("/TS/" + index + "/Session/1");
				var newObject = null;
				if (this.Status == "All") {
					newObject = {
						"ID": fullDateSelect,
						"Year": yearSelect,
						"Month": monthSelect,
						"Date": dateSelect,
						"Session": [TSAM, TSPM]
					}
					oModelData.push(newObject);
					oModel.setProperty("/TS", oModelData);
					MessageToast.show(msg);
				} else if (this.Status == "AM") {
					var indexAM = oModelData.findIndex(s => s.ID == fullDateSelect);
					if (indexAM >= 0) {
						oModel.setProperty("/TS/" + indexAM + "/Session/0", TSAM);
						MessageToast.show(msg);
					} else {
						newObject = {
							"ID": fullDateSelect,
							"Year": yearSelect,
							"Month": monthSelect,
							"Date": dateSelect,
							"Session": [TSAM, {
								ID: "PM"
							}]
						}
						oModelData.push(newObject);
						oModel.setProperty("/TS", oModelData);
						MessageToast.show(msg);
					}

				} else if (this.Status == "PM") {
					var indexPM = oModelData.findIndex(s => s.ID == fullDateSelect);
					if (indexPM >= 0) {
						oModel.setProperty("/TS/" + indexPM + "/Session/1", TSPM);
						MessageToast.show(msg);
					} else {
						newObject = {
							"ID": fullDateSelect,
							"Year": yearSelect,
							"Month": monthSelect,
							"Date": dateSelect,
							"Session": [{
								ID: "AM"
							}, TSPM]
						}
						oModelData.push(newObject);
						oModel.setProperty("/TS", oModelData);
					}
				}
			}
			this.addSpecialDate();
			this.onClose();
		},
		handleRemoveSelection: function () {
			var oCalendarCopy = Fragment.byId("copyTo", "calendarCopy");
			oCalendarCopy.removeAllSelectedDates();
			var oData = {
				selectedDates: []
			};
			this.oModel.setData(oData);
		},
		deleteSession: function (date) {
			var oModel = this.getView().getModel("timeSheet");
			var oModelData = oModel.getProperty("/TS");
			var getYear = date.getFullYear();
			var getMonth = date.getMonth();
			var getDate = date.getDate();
			var fullDate = getYear + "" + getMonth + "" + getDate;
			var index = oModelData.findIndex(s => s.ID == fullDate)
			var getAM = this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").getSelected();
			var getPM = this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").getSelected();
			var msg = 'Deleted.';

			if (getAM == true && getPM == true) {
				oModelData.splice(index, 1);
				oModel.setProperty("/TS", oModelData);
				MessageToast.show(msg);
			} else if (getAM == true) {
				// getOModel.splice(0, 1);
				oModel.setProperty("/TS/" + index + "/Session/0", {
					ID: "AM"
				});
				MessageToast.show(msg);
			} else if (getPM == true) {
				// getOModel.splice(1, 1);
				oModel.setProperty("/TS/" + index + "/Session/1", {
					ID: "PM"
				});
				MessageToast.show(msg);
			}
			var selectDate = date;
			this.timeSheetSelect(selectDate);
			// location.reload();
		},
		handleDeleteSession: function () {
			var cal = this.byId("calendar");
			var date = cal.getSelectedDates()[0].getStartDate();
			var currentDate = new Date();
			currentDate.setHours(0, 0, 0, 0);
			var checkDate = currentDate.getDate();
			if (checkDate >= 5) {
				if (date.getMonth() >= currentDate.getMonth()) {
					this.deleteSession(date);
				} else {
					MessageToast.show("Time out to Delete");
				}
			} else {
				this.deleteSession(date);
			}
		}
	});
});