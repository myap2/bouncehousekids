// Availability Calendar System for My Bounce Place
class AvailabilityCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTimeSlot = null;
        this.bookedDates = this.loadBookedDates();
        this.availableTimeSlots = [
            { value: '09:00', label: '9:00 AM - 5:00 PM' },
            { value: '10:00', label: '10:00 AM - 6:00 PM' },
            { value: '11:00', label: '11:00 AM - 7:00 PM' },
            { value: '12:00', label: '12:00 PM - 8:00 PM' },
            { value: '13:00', label: '1:00 PM - 9:00 PM' },
            { value: '14:00', label: '2:00 PM - 10:00 PM' }
        ];
        this.selectedBounceHouse = null;
    }

    init() {
        this.createCalendarHTML();
        this.bindEvents();
        this.renderCalendar();
    }

    createCalendarHTML() {
        const calendarContainer = document.getElementById('availability-calendar');
        if (!calendarContainer) return;

        calendarContainer.innerHTML = `
            <div class="calendar-widget">
                <div class="calendar-header">
                    <button class="calendar-nav-btn" id="prev-month">‹</button>
                    <h3 class="calendar-title" id="calendar-title"></h3>
                    <button class="calendar-nav-btn" id="next-month">›</button>
                </div>
                <div class="calendar-weekdays">
                    <div class="weekday">Sun</div>
                    <div class="weekday">Mon</div>
                    <div class="weekday">Tue</div>
                    <div class="weekday">Wed</div>
                    <div class="weekday">Thu</div>
                    <div class="weekday">Fri</div>
                    <div class="weekday">Sat</div>
                </div>
                <div class="calendar-days" id="calendar-days"></div>
                <div class="calendar-legend">
                    <div class="legend-item">
                        <span class="legend-color available"></span>
                        <span>Available</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color booked"></span>
                        <span>Booked</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color selected"></span>
                        <span>Selected</span>
                    </div>
                </div>
            </div>
            <div class="time-slots-container" id="time-slots-container" style="display: none;">
                <h4>Available Time Slots for <span id="selected-date-display"></span></h4>
                <div class="time-slots" id="time-slots"></div>
            </div>
        `;
    }

    bindEvents() {
        document.getElementById('prev-month')?.addEventListener('click', () => this.previousMonth());
        document.getElementById('next-month')?.addEventListener('click', () => this.nextMonth());
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update title
        const title = document.getElementById('calendar-title');
        if (title) {
            title.textContent = this.currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
        }

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const daysContainer = document.getElementById('calendar-days');
        if (!daysContainer) return;

        daysContainer.innerHTML = '';

        // Generate calendar days
        for (let i = 0; i < 42; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);

            const dayElement = this.createDayElement(currentDay, month);
            daysContainer.appendChild(dayElement);
        }
    }

    createDayElement(date, currentMonth) {
        const dayDiv = document.createElement('div');
        const dateString = this.formatDate(date);
        const isCurrentMonth = date.getMonth() === currentMonth;
        const isToday = this.isToday(date);
        const isPast = date < new Date().setHours(0, 0, 0, 0);
        const isBooked = this.isDateBooked(dateString);
        const isSelected = this.selectedDate === dateString;

        dayDiv.className = 'calendar-day';
        dayDiv.textContent = date.getDate();

        if (!isCurrentMonth) {
            dayDiv.classList.add('other-month');
        }
        if (isToday) {
            dayDiv.classList.add('today');
        }
        if (isPast) {
            dayDiv.classList.add('past');
        }
        if (isBooked && !isPast) {
            dayDiv.classList.add('booked');
        }
        if (isSelected) {
            dayDiv.classList.add('selected');
        }
        if (!isPast && !isBooked && isCurrentMonth) {
            dayDiv.classList.add('available');
            dayDiv.addEventListener('click', () => this.selectDate(dateString, date));
        }

        return dayDiv;
    }

    selectDate(dateString, dateObj) {
        // Remove previous selection
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });

        // Add selection to clicked day
        event.target.classList.add('selected');
        
        this.selectedDate = dateString;
        this.showTimeSlots(dateObj);
    }

    showTimeSlots(date) {
        const container = document.getElementById('time-slots-container');
        const slotsContainer = document.getElementById('time-slots');
        const dateDisplay = document.getElementById('selected-date-display');
        
        if (!container || !slotsContainer || !dateDisplay) return;

        dateDisplay.textContent = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Get booked time slots for this date
        const bookedSlots = this.getBookedTimeSlotsForDate(this.selectedDate);
        
        slotsContainer.innerHTML = this.availableTimeSlots.map(slot => {
            const isBooked = bookedSlots.includes(slot.value);
            const slotClass = isBooked ? 'time-slot booked' : 'time-slot available';
            const clickHandler = isBooked ? '' : `onclick="window.availabilityCalendar.selectTimeSlot('${slot.value}')"`;
            
            return `
                <div class="${slotClass}" data-time="${slot.value}" ${clickHandler}>
                    ${slot.label}
                    ${isBooked ? '<span class="booked-label">Booked</span>' : ''}
                </div>
            `;
        }).join('');

        container.style.display = 'block';
    }

    selectTimeSlot(timeValue) {
        // Remove previous selection
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });

        // Add selection to clicked slot
        const selectedSlot = document.querySelector(`[data-time="${timeValue}"]`);
        if (selectedSlot) {
            selectedSlot.classList.add('selected');
        }

        this.selectedTimeSlot = timeValue;
        
        // Emit event for booking system
        document.dispatchEvent(new CustomEvent('dateTimeSelected', {
            detail: {
                date: this.selectedDate,
                time: this.selectedTimeSlot,
                bounceHouse: this.selectedBounceHouse
            }
        }));
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    isDateBooked(dateString) {
        return this.bookedDates.hasOwnProperty(dateString) && 
               this.bookedDates[dateString].length >= this.availableTimeSlots.length;
    }

    getBookedTimeSlotsForDate(dateString) {
        return this.bookedDates[dateString] || [];
    }

    loadBookedDates() {
        // Load from localStorage or return sample data
        const stored = localStorage.getItem('bookedDates');
        if (stored) {
            return JSON.parse(stored);
        }

        // Sample booked dates for demonstration
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        return {
            [this.formatDate(tomorrow)]: ['09:00', '10:00'],
            [this.formatDate(nextWeek)]: ['14:00', '15:00']
        };
    }

    saveBookedDates() {
        localStorage.setItem('bookedDates', JSON.stringify(this.bookedDates));
    }

    addBooking(date, time, bounceHouseId) {
        if (!this.bookedDates[date]) {
            this.bookedDates[date] = [];
        }
        
        if (!this.bookedDates[date].includes(time)) {
            this.bookedDates[date].push(time);
            this.saveBookedDates();
            
            // Refresh calendar display
            this.renderCalendar();
            
            return true; // Booking successful
        }
        
        return false; // Time slot already booked
    }

    checkAvailability(date, time, bounceHouseId) {
        const bookedSlots = this.getBookedTimeSlotsForDate(date);
        return !bookedSlots.includes(time);
    }

    setBounceHouse(bounceHouseId) {
        this.selectedBounceHouse = bounceHouseId;
    }

    getSelectedDateTime() {
        return {
            date: this.selectedDate,
            time: this.selectedTimeSlot,
            bounceHouse: this.selectedBounceHouse
        };
    }

    reset() {
        this.selectedDate = null;
        this.selectedTimeSlot = null;
        this.selectedBounceHouse = null;
        
        // Hide time slots
        const container = document.getElementById('time-slots-container');
        if (container) {
            container.style.display = 'none';
        }
        
        // Remove selections
        document.querySelectorAll('.calendar-day.selected, .time-slot.selected').forEach(el => {
            el.classList.remove('selected');
        });
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.availabilityCalendar = new AvailabilityCalendar();
});