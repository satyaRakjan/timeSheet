sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/routing/History',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'

], function (Controller, History, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ICS_TimeSheet.ICS_TimeSheet.controller.View2", {
		onInit: function () {
			this.holiday = this.getOwnerComponent().getModel("Holiday").getProperty("/year");
			this.AMIcon = this.byId("AMIcon");
			this.PMIcon = this.byId("PMIcon");
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
				} else {
					oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate: new Date(fullDate),
						endDate: new Date(fullDate),
						type: sap.ui.unified.CalendarDayType.Type01
					}));
				}

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
		},

		timeSheetSelect: function (selectDate) {
			console.log("change")
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
						this.list = this.byId(sessions[1].ID + "Icon");
						this.list.setSrc("sap-icon://notes")
						this.byId("container-ICS_TimeSheet---View2--" + sessions[1].ID + "-selectMulti").setEnabled(true)
						this.byId("sessionList").setMode("MultiSelect");
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
			oRouter.navTo("RouteView1", true);
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
						console.log(sessions)
						var fullDate = new Date(count[1].Year, count[1].Month, count[1].Date);
						if (String(fullDate) == String(selectDate)) {
							this.byId("container-ICS_TimeSheet---View2--" + sessions[1].ID + "-selectMulti").setSelected(true);
						}
					})
				})
			} else {
				this.byId("container-ICS_TimeSheet---View2--AM-selectMulti").setSelected(false);
				this.byId("container-ICS_TimeSheet---View2--PM-selectMulti").setSelected(false);
			}
		},
		onSelectionSession: function (oEvent) {
			if (this.AM.getSelected() == false && this.PM.getSelected() == false) {
				this.copyBtn.setEnabled(false)
				this.delBtn.setEnabled(false)
			} else {
				this.copyBtn.setEnabled(true)
				this.delBtn.setEnabled(true)
			}

		},
		copyTo: function (oEvent) {
			// console.log(this.AM.getSelected())
			// this.AM.setEnabled(false)
		}
	});
});