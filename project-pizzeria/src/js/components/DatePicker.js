import BaseWidget from "./BaseWidget";
import { select, settings } from "../settings";

class DatePicker extends BaseWidget{
    constructor(wrapper){
        super(wrapper, utils.dateToStr(new Date()));
        const thisWidget = this;
        thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    }
    initPlugin(){
        const thisWidget = this;

        thisWidget.minDate = new Date(thisWidget.value);
        thisWidget.maxDate = utils.addDays(utils.dateToStr(thisWidget.minDate), settings.datePicker.maxDaysInFuture);

        flatpickr(thisWidget.dom.input,{
            defaultDate = thisWidget.minDate,
            minDate = thisWidget.minDate,
            maxDate = thisWidget.maxDate,
            "disable": [
                function(date) {
                    // return true to disable
                    return (date.getDay() === 1);
        
                }
            ],
            "locale": {
                "firstDayOfWeek": 1 // start week on Monday
            }
            
            );
    }
}