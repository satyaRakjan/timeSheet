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
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteView2").attachPatternMatched(this._onObjectMatched, this);
			var oLeg1 = this.getView().byId("legend1");
			oLeg1.addItem(new sap.ui.unified.CalendarLegendItem({
				color: "#9a9393",
				text: "Weekend & Holiday"
			}));
			oLeg1.addItem(new sap.ui.unified.CalendarLegendItem({
				color: "#00D534",
				text: "Done"
			}));
			oLeg1.addItem(new sap.ui.unified.CalendarLegendItem({
				color: "red",
				text: "Leave"
			}));
			this.addSpecialDate();

		},
		onAfterRendering: function () {
			var keys = Object.entries(this.holiday[0]);
			var oCalendar = this.byId("calendar");
			var TSmodel = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
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
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var TSEntry = Object.entries(TS);
			TSEntry.forEach((count) => {
				var status = [];
				Object.entries(count[1].Session).forEach((sessions) => {
					if (count[1].Session.length = 2) {
						status.push(sessions[1].status)
					}
				})
				var check = ["Confirmed", "Confirmed"];
				var fullDate = new Date(count[1].Year, count[1].Month, count[1].Date);
				if (JSON.stringify(status) === JSON.stringify(check)) {
					oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate: new Date(fullDate),
						endDate: new Date(fullDate),
						type: sap.ui.unified.CalendarDayType.Type08
					}));
				}
			})

		},
		timeSheetSelect: function (selectDate) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: " d MMM yyyy"
			});
			var dateFormatted = oDateFormat.format(selectDate);
			var oViewModel = new JSONModel({
				selectDate: dateFormatted
			});
			this.byId("sessionList").setMode("None");
			this.AMIcon.setSrc("");
			this.PMIcon.setSrc("");
			this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").setSelected(false);
			this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").setSelected(false);
			this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").setEnabled(false);
			this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").setEnabled(false);
			this.getView().setModel(oViewModel, "view");
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var TSEntry = Object.entries(TS);
			TSEntry.forEach((count) => {
				Object.entries(count[1].Session).forEach((sessions) => {
					var fullDate = new Date(count[1].Year, count[1].Month, count[1].Date);
					if (String(fullDate) == String(selectDate)) {
						Object.entries(sessions).forEach((session) => {
							if (session[1].status) {
								this.list = this.byId(sessions[1].ID + "Icon");
								this.list.setSrc("sap-icon://notes")
								this.byId("container-ICS_TimeSheet---View2--" + sessions[1].ID + "-selectMulti").setEnabled(true)
								this.byId("sessionList").setMode("MultiSelect");
							}
						})

					} else {
						this.delBtn.setEnabled(false);
						this.copyBtn.setEnabled(false);
						var oCalendar = this.byId("calendar");
						var indexTS = oCalendar.getSpecialDates().findIndex(s => String(s.getStartDate()) == String(selectDate))
						if (indexTS >= 0) {
							oCalendar.removeSpecialDate(indexTS);
						}
					}

				})
			})
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
							if (sessions[1].status) {
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
			this._oPopover.close();
		},
		onSubmitCopy: function () {
			var cal = this.byId("calendar");
			var date = cal.getSelectedDates()[0].getStartDate();
			var oModel = this.getView().getModel("timeSheet");
			var oModelData = oModel.getProperty("/TS");
			var getYear = date.getFullYear();
			var getMonth = date.getMonth();
			var getDate = date.getDate();
			var fullDate = getYear + "" + getMonth + "" + getDate;
			var index = oModelData.findIndex(s => s.ID == fullDate)
			var calCopy = this.byId("calendarCopy");
		},
		calendarCopy: function () {
			var getAM = this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").getSelected();
			var getPM = this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").getSelected()

			// var oCtx = oEvent.getSource().getBindingContext();
			var oCalendarCopy = Fragment.byId("copyTo", "calendarCopy");
			var keys = Object.entries(this.holiday[0]);
			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			var TSEntry = Object.entries(TS);
			oCalendarCopy.removeAllSpecialDates();
			// this.specialDate = [];
			keys.forEach((v) => {
				v[1].forEach((j) => {
					var fullDate = j.month + "/" + j.startDate + "/" + v[0];
					// this.specialDate.push(fullDate);
					oCalendarCopy.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate: new Date(fullDate),
						endDate: new Date(fullDate),
						type: sap.ui.unified.CalendarDayType.NonWorking,
						tooltip: j.title
					}));
				})
			})

			TSEntry.forEach((count) => {
				// var status = [];
				var fullDate = new Date(count[1].Year, count[1].Month, count[1].Date);
				if (getAM == true && getPM == true) {
					if (count[1].Session[0].status || count[1].Session[1].status) {
						oCalendarCopy.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate: new Date(fullDate),
							endDate: new Date(fullDate),
							type: sap.ui.unified.CalendarDayType.NonWorking
						}));
					}
				} else if (getAM == true) {
					if (count[1].Session[0].status) {
						oCalendarCopy.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate: new Date(fullDate),
							endDate: new Date(fullDate),
							type: sap.ui.unified.CalendarDayType.NonWorking
						}));
					} else {

					}
				} else if (getPM == true) {
					if (count[1].Session[1].status) {
						oCalendarCopy.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate: new Date(fullDate),
							endDate: new Date(fullDate),
							type: sap.ui.unified.CalendarDayType.NonWorking
						}));
					} else {

					}
				}
				Object.entries(count[1].Session).forEach((sessions) => {

					})
					// var check = ["Confirmed", "Confirmed"];
					// var fullDate = new Date(count[1].Year, count[1].Month, count[1].Date);
					// if (JSON.stringify(status) === JSON.stringify(check)) {
					// 	oCalendarCopy.addSpecialDate(new sap.ui.unified.DateTypeRange({
					// 		startDate: new Date(fullDate),
					// 		endDate: new Date(fullDate),
					// 		type: sap.ui.unified.CalendarDayType.Type08
					// 	}));
					// } else {

				// }
			})

		},
		deleteSession: function () {
			var cal = this.byId("calendar");
			var date = cal.getSelectedDates()[0].getStartDate();
			var oModel = this.getView().getModel("timeSheet");
			var oModelData = oModel.getProperty("/TS");
			var getYear = date.getFullYear();
			var getMonth = date.getMonth();
			var getDate = date.getDate();
			var fullDate = getYear + "" + getMonth + "" + getDate;
			var index = oModelData.findIndex(s => s.ID == fullDate)
				// var getOModel = oModel.getProperty("/TS/" + index + "/Session");
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
			this.timeSheetSelect();

			// location.reload();
		}
	});
});