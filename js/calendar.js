// Availability Calendar Component for My Bounce Place
class AvailabilityCalendar {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.bounceHouseId = options.bounceHouseId || null;
    this.onDateSelect = options.onDateSelect || (() => {});
    this.selectedDate = null;
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth() + 1;
    this.calendarData = {};
    this.isLoading = false;

    if (this.container) {
      this.render();
      this.loadCalendarData();
    }
  }

  async loadCalendarData() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.updateLoadingState(true);

    try {
      const data = await BookingAPI.getCalendarAvailability(
        this.currentYear,
        this.currentMonth,
        this.bounceHouseId
      );

      this.calendarData = {};
      data.dates.forEach(d => {
        this.calendarData[d.date] = d;
      });

      this.renderCalendar();
    } catch (error) {
      console.error('Error loading calendar:', error);
      this.showError('Failed to load availability. Please try again.');
    } finally {
      this.isLoading = false;
      this.updateLoadingState(false);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="availability-calendar">
        <div class="calendar-header">
          <button type="button" class="calendar-nav-btn prev-month" aria-label="Previous month">&lt;</button>
          <span class="calendar-month-year"></span>
          <button type="button" class="calendar-nav-btn next-month" aria-label="Next month">&gt;</button>
        </div>
        <div class="calendar-legend">
          <span class="legend-item"><span class="legend-dot available"></span> Available</span>
          <span class="legend-item"><span class="legend-dot booked"></span> Booked</span>
          <span class="legend-item"><span class="legend-dot blocked"></span> Blocked</span>
        </div>
        <div class="calendar-grid">
          <div class="calendar-weekdays">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div class="calendar-days"></div>
        </div>
        <div class="calendar-loading" style="display: none;">
          <span>Loading...</span>
        </div>
        <div class="calendar-error" style="display: none;"></div>
        <div class="calendar-selected-info" style="display: none;">
          <p class="selected-date-text"></p>
          <p class="availability-status"></p>
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('.prev-month').addEventListener('click', () => this.navigateMonth(-1));
    this.container.querySelector('.next-month').addEventListener('click', () => this.navigateMonth(1));
  }

  renderCalendar() {
    const monthYear = this.container.querySelector('.calendar-month-year');
    const daysContainer = this.container.querySelector('.calendar-days');

    // Update month/year display
    const monthName = new Date(this.currentYear, this.currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    monthYear.textContent = monthName;

    // Get first day of month and total days
    const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();

    // Clear and rebuild days
    daysContainer.innerHTML = '';

    // Add empty cells for days before first of month
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('span');
      emptyCell.className = 'calendar-day empty';
      daysContainer.appendChild(emptyCell);
    }

    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = this.calendarData[dateStr] || { available: true, status: 'available' };

      const dayCell = document.createElement('button');
      dayCell.type = 'button';
      dayCell.className = `calendar-day ${dayData.status}`;
      dayCell.textContent = day;
      dayCell.dataset.date = dateStr;

      if (this.selectedDate === dateStr) {
        dayCell.classList.add('selected');
      }

      if (dayData.status === 'past' || dayData.status === 'booked' || dayData.status === 'blocked') {
        dayCell.disabled = true;
      }

      dayCell.addEventListener('click', () => this.selectDate(dateStr, dayData));

      daysContainer.appendChild(dayCell);
    }

    // Disable prev button if showing current month
    const prevBtn = this.container.querySelector('.prev-month');
    const now = new Date();
    if (this.currentYear === now.getFullYear() && this.currentMonth === now.getMonth() + 1) {
      prevBtn.disabled = true;
    } else {
      prevBtn.disabled = false;
    }
  }

  navigateMonth(direction) {
    this.currentMonth += direction;

    if (this.currentMonth > 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else if (this.currentMonth < 1) {
      this.currentMonth = 12;
      this.currentYear--;
    }

    this.loadCalendarData();
  }

  selectDate(dateStr, dayData) {
    // Update selected state
    this.container.querySelectorAll('.calendar-day').forEach(day => {
      day.classList.remove('selected');
    });

    const selectedCell = this.container.querySelector(`[data-date="${dateStr}"]`);
    if (selectedCell) {
      selectedCell.classList.add('selected');
    }

    this.selectedDate = dateStr;

    // Update info display
    const infoContainer = this.container.querySelector('.calendar-selected-info');
    const dateText = this.container.querySelector('.selected-date-text');
    const statusText = this.container.querySelector('.availability-status');

    infoContainer.style.display = 'block';
    dateText.textContent = BookingAPI.formatDate(dateStr);

    if (dayData.available) {
      statusText.innerHTML = '<span style="color: #28a745;">&#10004; Available for booking</span>';
    } else {
      statusText.innerHTML = `<span style="color: #dc3545;">&#10008; ${dayData.reason || 'Not available'}</span>`;
    }

    // Trigger callback
    this.onDateSelect(dateStr, dayData);
  }

  updateLoadingState(isLoading) {
    const loadingEl = this.container.querySelector('.calendar-loading');
    const gridEl = this.container.querySelector('.calendar-grid');

    if (isLoading) {
      loadingEl.style.display = 'flex';
      gridEl.style.opacity = '0.5';
    } else {
      loadingEl.style.display = 'none';
      gridEl.style.opacity = '1';
    }
  }

  showError(message) {
    const errorEl = this.container.querySelector('.calendar-error');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  getSelectedDate() {
    return this.selectedDate;
  }

  setSelectedDate(dateStr) {
    this.selectedDate = dateStr;
    const dayData = this.calendarData[dateStr] || { available: true, status: 'available' };
    this.selectDate(dateStr, dayData);
  }

  refresh() {
    this.loadCalendarData();
  }
}

// Add calendar styles
const calendarStyles = document.createElement('style');
calendarStyles.textContent = `
  .availability-calendar {
    max-width: 400px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    margin-bottom: 10px;
  }

  .calendar-month-year {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
  }

  .calendar-nav-btn {
    background: #4a90d9;
    color: white;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .calendar-nav-btn:hover:not(:disabled) {
    background: #357abd;
  }

  .calendar-nav-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .calendar-legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 15px;
    font-size: 0.85rem;
    color: #666;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .legend-dot.available {
    background: #d4edda;
    border: 1px solid #28a745;
  }

  .legend-dot.booked {
    background: #f8d7da;
    border: 1px solid #dc3545;
  }

  .legend-dot.blocked {
    background: #e2e3e5;
    border: 1px solid #6c757d;
  }

  .calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-weight: 600;
    color: #666;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    font-size: 0.85rem;
  }

  .calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    padding: 10px 0;
  }

  .calendar-day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
    background: #d4edda;
    color: #155724;
  }

  .calendar-day:hover:not(:disabled):not(.empty) {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .calendar-day.empty {
    background: transparent;
    cursor: default;
  }

  .calendar-day.past {
    background: #f5f5f5;
    color: #aaa;
    cursor: not-allowed;
  }

  .calendar-day.booked {
    background: #f8d7da;
    color: #721c24;
    cursor: not-allowed;
  }

  .calendar-day.blocked {
    background: #e2e3e5;
    color: #6c757d;
    cursor: not-allowed;
  }

  .calendar-day.selected {
    background: #4a90d9 !important;
    color: white !important;
    box-shadow: 0 2px 8px rgba(74, 144, 217, 0.4);
  }

  .calendar-day:disabled {
    opacity: 0.6;
  }

  .calendar-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    color: #666;
  }

  .calendar-error {
    background: #f8d7da;
    color: #721c24;
    padding: 10px;
    border-radius: 4px;
    text-align: center;
    margin-top: 10px;
  }

  .calendar-selected-info {
    background: #e3f2fd;
    padding: 15px;
    border-radius: 8px;
    margin-top: 15px;
    text-align: center;
  }

  .calendar-selected-info p {
    margin: 5px 0;
  }

  .selected-date-text {
    font-weight: 600;
    font-size: 1.1rem;
    color: #333;
  }
`;

document.head.appendChild(calendarStyles);

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.AvailabilityCalendar = AvailabilityCalendar;
}
