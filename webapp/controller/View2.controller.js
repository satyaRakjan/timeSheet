sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/routing/History',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'

], function (Controller, History, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ICS_TimeSheet.ICS_TimeSheet.controller.View2", {
		onInit: function (oevent) {

			var TS = this.getOwnerComponent().getModel("timeSheet").getProperty("/TS");
			this.arr = [];
			for (var cout in TS) {
				this.arr.push(TS[cout]);
			}

			var holiday = this.getOwnerComponent().getModel("Holiday").getProperty("/holidays");
			var currentYear = new Date().getFullYear();
			this.holidayArr = [];
			for (var day in holiday) {
				this.holidayArr.push(new Date(currentYear, holiday[day].month, holiday[day].startDate).toDateString());
			}

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteView2").attachPatternMatched(this._onObjectMatched, this);

			this._holiday();
			this.AM = this.byId("AM");
			this.PM = this.byId("PM");
			this.copyBtn = this.byId("copyBtn");
			this.delBtn = this.byId("delBtn");
		},

		_holiday: function (date) {

			var currentYear = ""
			if (date) {
				currentYear = date.getFullYear();
			} else {
				currentYear = new Date().getFullYear();

			}
			var holiday = this.getOwnerComponent().getModel("JSON").getProperty("/appointments");
			var oCalendar = this.byId("calendar");
			for (var day in holiday) {
				oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
					startDate: new Date(currentYear, holiday[day].month, holiday[day].startDate),
					endDate: new Date(currentYear, holiday[day].month, holiday[day].endDate),
					type: sap.ui.unified.CalendarDayType.NonWorking,
					tooltip: holiday[day].title
				}));

			}
		},

		_onObjectMatched: function (oEvent) {
			var date = oEvent.getParameter("arguments").getDate;
			this.getView().bindElement({
				path: "/" + oEvent.getParameter("arguments").getDate,
				model: "invoice"
			});
			var selectDate = new Date(date);
			var cal = this.byId("calendar");
			cal.setStartDate(selectDate);
			cal.removeAllSelectedDates();
			cal.addSelectedDate(new sap.ui.unified.DateRange({
				startDate: selectDate
			}));

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: " d MMM yyyy"
			});

			var dateFormatted = oDateFormat.format(selectDate);
			var oViewModel = new JSONModel({
				selectDate: dateFormatted
			});
			this.getView().setModel(oViewModel, "view");

		},

		handleCalendarSelect: function (oEvent) {
			var oCalendar = oEvent.getSource(),
				oSelectedDate = oCalendar.getSelectedDates()[0],
				oStartDate = oSelectedDate.getStartDate(),
				array = this.holidayArr,
				arrDate = oStartDate.toDateString(),
				result = array.includes(arrDate);
				console.log(oStartDate);
			if (result == true) {
				var msg = 'this day is NonWorking.';
				MessageToast.show(msg);

			} else {
				var array2 = this.arr,
					dateID = Date.parse(oStartDate),
					// resultTS = array2.includes(dateID),
					// getDate = new Date(resultTS),
					even = (element) => element.ID === dateID,
					check = array2.some(even);

				var result2 = array2.find(ts => ts.ID === dateID);
				var AM = "",
					PM = "",
					AMIcon = this.getView().byId("AMIcon"),
					PMIcon = this.getView().byId("PMIcon"),
					AMenable = this.byId("container-ICS_TimeSheet---View2--AM-selectMulti"),
					PMenable = this.byId("container-ICS_TimeSheet---View2--PM-selectMulti"),
					sessionList = this.byId("sessionList");
				console.log(sessionList)
				if (check == true) {
					var resultTS = array2.filter(ts => ts.ID === dateID);
					var getDate = new Date(resultTS[0].ID);
					getDate.setHours(resultTS[0].AM)
					AM = true;
					PM = true;
					AMIcon.setSrc("sap-icon://notes")
					PMIcon.setSrc("sap-icon://notes")
					AMenable.setEnabled(true)
					PMenable.setEnabled(true)
					sessionList.setMode("MultiSelect")
				} else {
					AM = false;
					PM = false;
					AMIcon.setSrc("")
					PMIcon.setSrc("")
					AMenable.setEnabled(false)
					PMenable.setEnabled(false)
					sessionList.setMode("None")

				}

				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: " d MMM yyyy"
				});

				var dateFormatted = oDateFormat.format(oStartDate);
				var oViewModel = new JSONModel({
					selectDate: dateFormatted,
					AM: AM,
					PM: PM
				});
				this.getView().setModel(oViewModel, "view");
				this._holiday(oStartDate);
			}
		},

		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("RouteView1", false);
			}

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
			// console.log(selectedItem);
			// console.log(selected);
			if (selected == true) {

				this.AM.setSelected(true)
				this.PM.setSelected(true)
				this.copyBtn.setEnabled(true)
				this.delBtn.setEnabled(true)

			} else {
				this.AM.setSelected(false)
				this.PM.setSelected(false)
				this.copyBtn.setEnabled(false)
				this.delBtn.setEnabled(false)

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