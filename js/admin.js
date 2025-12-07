// Admin Dashboard for My Bounce Place
const AdminDashboard = {
  API_BASE: '/.netlify/functions',
  token: null,
  currentSection: 'overview',
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  bookings: [],
  blockedDates: [],

  // Initialize
  init() {
    this.checkAuth();
    this.setupEventListeners();
  },

  // Check if user is authenticated
  checkAuth() {
    this.token = localStorage.getItem('adminToken');
    const tokenExpiry = localStorage.getItem('adminTokenExpiry');

    if (this.token && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
      this.showDashboard();
      this.loadDashboardData();
    } else {
      this.logout();
    }
  },

  // Setup event listeners
  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.login();
      });
    }

    // Navigation tabs
    document.querySelectorAll('.admin-nav button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchSection(btn.dataset.section);
      });
    });

    // Close modal on outside click
    document.getElementById('booking-modal')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('admin-modal')) {
        this.closeModal();
      }
    });

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  },

  // Login
  async login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    const loginText = document.getElementById('login-text');
    const loginLoading = document.getElementById('login-loading');
    const errorDiv = document.getElementById('login-error');

    loginBtn.disabled = true;
    loginText.style.display = 'none';
    loginLoading.style.display = 'inline';
    errorDiv.style.display = 'none';

    try {
      const response = await fetch(`${this.API_BASE}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save token
      this.token = data.token;
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminTokenExpiry', Date.now() + (data.expiresIn * 1000));
      localStorage.setItem('adminEmail', data.email);

      this.showDashboard();
      this.loadDashboardData();

    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.style.display = 'block';
    } finally {
      loginBtn.disabled = false;
      loginText.style.display = 'inline';
      loginLoading.style.display = 'none';
    }
  },

  // Logout
  logout() {
    this.token = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTokenExpiry');
    localStorage.removeItem('adminEmail');

    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
  },

  // Show dashboard
  showDashboard() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    document.getElementById('admin-email').textContent = localStorage.getItem('adminEmail') || '';
  },

  // Switch section
  switchSection(section) {
    this.currentSection = section;

    // Update nav buttons
    document.querySelectorAll('.admin-nav button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });

    // Update sections
    document.querySelectorAll('.admin-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `section-${section}`);
    });

    // Load section data
    switch (section) {
      case 'overview':
        this.loadOverview();
        break;
      case 'bookings':
        this.loadBookings();
        break;
      case 'calendar':
        this.renderCalendar();
        break;
      case 'blocked-dates':
        this.loadBlockedDates();
        break;
    }
  },

  // Load all dashboard data
  async loadDashboardData() {
    await Promise.all([
      this.loadBookings(),
      this.loadBlockedDates(),
    ]);
    this.loadOverview();
  },

  // Load overview stats
  loadOverview() {
    const bookings = this.bookings;
    const now = new Date();

    // Calculate stats
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const revenue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);

    // Update UI
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-confirmed').textContent = confirmed;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-revenue').textContent = `$${revenue.toFixed(0)}`;

    // Show upcoming bookings
    const upcoming = bookings
      .filter(b => new Date(b.event_date) >= now && b.status !== 'cancelled')
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
      .slice(0, 5);

    const container = document.getElementById('upcoming-bookings');
    if (upcoming.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>No upcoming bookings</h3><p>Bookings will appear here when customers book.</p></div>';
    } else {
      container.innerHTML = this.renderBookingsTable(upcoming);
    }
  },

  // Load bookings
  async loadBookings() {
    const container = document.getElementById('bookings-list');
    if (this.currentSection === 'bookings') {
      container.innerHTML = '<div class="loading">Loading...</div>';
    }

    try {
      const status = document.getElementById('filter-status')?.value || '';
      const startDate = document.getElementById('filter-start-date')?.value || '';
      const endDate = document.getElementById('filter-end-date')?.value || '';

      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${this.API_BASE}/get-bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          return;
        }
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      this.bookings = data.bookings || [];

      if (this.currentSection === 'bookings') {
        if (this.bookings.length === 0) {
          container.innerHTML = '<div class="empty-state"><h3>No bookings found</h3><p>Try adjusting your filters.</p></div>';
        } else {
          container.innerHTML = this.renderBookingsTable(this.bookings);
        }
      }

    } catch (error) {
      console.error('Error loading bookings:', error);
      if (this.currentSection === 'bookings') {
        container.innerHTML = '<div class="empty-state"><h3>Error loading bookings</h3><p>Please try again.</p></div>';
      }
    }
  },

  // Render bookings table
  renderBookingsTable(bookings) {
    return `
      <table class="bookings-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Contact</th>
            <th>Package</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(b => `
            <tr>
              <td>${this.formatDate(b.event_date)}</td>
              <td>${b.customer_name}</td>
              <td>
                <a href="mailto:${b.customer_email}">${b.customer_email}</a><br>
                <small>${b.customer_phone || '-'}</small>
              </td>
              <td>${b.rental_type}</td>
              <td>$${parseFloat(b.total_amount || 0).toFixed(2)}</td>
              <td><span class="status-badge ${b.status}">${b.status}</span></td>
              <td>
                <button class="action-btn view" onclick="AdminDashboard.viewBooking('${b.id}')">View</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  // View booking details
  viewBooking(bookingId) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const content = document.getElementById('booking-detail-content');
    content.innerHTML = `
      <div class="booking-detail-row">
        <span class="label">Status</span>
        <span class="value">
          <select id="booking-status" onchange="AdminDashboard.updateBookingStatus('${booking.id}', this.value)">
            <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </span>
      </div>

      <h4 style="margin-top: 20px; margin-bottom: 10px;">Customer Info</h4>
      <div class="booking-detail-row">
        <span class="label">Name</span>
        <span class="value">${booking.customer_name}</span>
      </div>
      <div class="booking-detail-row">
        <span class="label">Email</span>
        <span class="value"><a href="mailto:${booking.customer_email}">${booking.customer_email}</a></span>
      </div>
      <div class="booking-detail-row">
        <span class="label">Phone</span>
        <span class="value"><a href="tel:${booking.customer_phone}">${booking.customer_phone || '-'}</a></span>
      </div>

      <h4 style="margin-top: 20px; margin-bottom: 10px;">Event Details</h4>
      <div class="booking-detail-row">
        <span class="label">Date</span>
        <span class="value">${this.formatDate(booking.event_date)}</span>
      </div>
      <div class="booking-detail-row">
        <span class="label">Time</span>
        <span class="value">${booking.event_start_time || '-'}</span>
      </div>
      <div class="booking-detail-row">
        <span class="label">Address</span>
        <span class="value">${booking.event_address}</span>
      </div>
      <div class="booking-detail-row">
        <span class="label">Guests</span>
        <span class="value">${booking.guests_count || '-'}</span>
      </div>
      <div class="booking-detail-row">
        <span class="label">Special Requests</span>
        <span class="value">${booking.special_requests || '-'}</span>
      </div>

      <h4 style="margin-top: 20px; margin-bottom: 10px;">Payment</h4>
      <div class="booking-detail-row">
        <span class="label">Package</span>
        <span class="value">${booking.rental_type}</span>
      </div>
      <div class="booking-detail-row">
        <span class="label">Base Price</span>
        <span class="value">$${parseFloat(booking.base_price || 0).toFixed(2)}</span>
      </div>
      <div class="booking-detail-row">
        <span class="label">Delivery Fee</span>
        <span class="value">$${parseFloat(booking.delivery_fee || 0).toFixed(2)}</span>
      </div>
      <div class="booking-detail-row">
        <span class="label">Total</span>
        <span class="value" style="color: #28a745; font-size: 1.2rem;">$${parseFloat(booking.total_amount || 0).toFixed(2)}</span>
      </div>
      <div class="booking-detail-row">
        <span class="label">Deposit Paid</span>
        <span class="value">$${parseFloat(booking.deposit_amount || 0).toFixed(2)} (${booking.payment_status})</span>
      </div>

      <h4 style="margin-top: 20px; margin-bottom: 10px;">Admin Notes</h4>
      <textarea id="booking-notes" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; min-height: 80px;">${booking.notes || ''}</textarea>
      <button class="action-btn view" style="margin-top: 10px;" onclick="AdminDashboard.saveNotes('${booking.id}')">Save Notes</button>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
        <small style="color: #666;">
          Created: ${new Date(booking.created_at).toLocaleString()}<br>
          Booking ID: ${booking.id}
        </small>
      </div>
    `;

    document.getElementById('booking-modal').classList.add('show');
  },

  // Update booking status
  async updateBookingStatus(bookingId, status) {
    try {
      const response = await fetch(`${this.API_BASE}/update-booking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          bookingId,
          status,
          sendNotification: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      // Update local data
      const booking = this.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.status = status;
      }

      // Refresh overview
      this.loadOverview();

      alert('Booking status updated!');

    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  },

  // Save admin notes
  async saveNotes(bookingId) {
    const notes = document.getElementById('booking-notes').value;

    try {
      const response = await fetch(`${this.API_BASE}/update-booking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ bookingId, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notes');
      }

      // Update local data
      const booking = this.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.notes = notes;
      }

      alert('Notes saved!');

    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    }
  },

  // Close modal
  closeModal() {
    document.getElementById('booking-modal').classList.remove('show');
  },

  // Render calendar
  renderCalendar() {
    const container = document.getElementById('admin-calendar');
    const monthYear = document.getElementById('calendar-month-year');

    const year = this.currentYear;
    const month = this.currentMonth;

    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    monthYear.textContent = `${monthNames[month]} ${year}`;

    // Get first day and days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get bookings for this month
    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;
    const monthBookings = this.bookings.filter(b => {
      return b.event_date >= monthStart && b.event_date <= monthEnd;
    });

    // Get blocked dates for this month
    const monthBlocked = this.blockedDates.filter(d => {
      return d.date >= monthStart && d.date <= monthEnd;
    });

    // Build calendar HTML
    let html = '<div class="calendar-grid-admin">';

    // Weekday headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
      html += `<div style="text-align: center; font-weight: 600; padding: 10px;">${day}</div>`;
    });

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="calendar-day-admin" style="background: transparent; border: none;"></div>';
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayBookings = monthBookings.filter(b => b.event_date === dateStr);
      const isBlocked = monthBlocked.some(d => d.date === dateStr);

      let classes = 'calendar-day-admin';
      if (dayBookings.length > 0) classes += ' has-booking';
      if (isBlocked) classes += ' blocked';

      html += `<div class="${classes}">`;
      html += `<div class="day-number">${day}</div>`;

      dayBookings.forEach(b => {
        html += `<div class="calendar-booking-item" onclick="AdminDashboard.viewBooking('${b.id}')">${b.customer_name}</div>`;
      });

      if (isBlocked) {
        html += '<div style="color: #999; font-size: 0.75rem;">Blocked</div>';
      }

      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  },

  // Navigate calendar
  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.renderCalendar();
  },

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.renderCalendar();
  },

  // Load blocked dates
  async loadBlockedDates() {
    const container = document.getElementById('blocked-dates-list');

    try {
      const response = await fetch(`${this.API_BASE}/manage-blocked-dates`);

      if (!response.ok) {
        throw new Error('Failed to fetch blocked dates');
      }

      const data = await response.json();
      this.blockedDates = data.blockedDates || [];

      if (this.currentSection === 'blocked-dates') {
        if (this.blockedDates.length === 0) {
          container.innerHTML = '<div class="empty-state"><p>No blocked dates. Add dates above to block them from booking.</p></div>';
        } else {
          container.innerHTML = this.blockedDates.map(d => `
            <div class="blocked-date-item">
              <div>
                <span class="date">${this.formatDate(d.date)}</span>
                <span class="reason"> - ${d.reason || 'No reason'}</span>
              </div>
              <button class="action-btn delete" onclick="AdminDashboard.removeBlockedDate('${d.id}')">Remove</button>
            </div>
          `).join('');
        }
      }

    } catch (error) {
      console.error('Error loading blocked dates:', error);
      if (this.currentSection === 'blocked-dates') {
        container.innerHTML = '<div class="empty-state"><p>Error loading blocked dates.</p></div>';
      }
    }
  },

  // Add blocked date
  async addBlockedDate() {
    const dateInput = document.getElementById('new-blocked-date');
    const reasonInput = document.getElementById('new-blocked-reason');

    const date = dateInput.value;
    const reason = reasonInput.value;

    if (!date) {
      alert('Please select a date');
      return;
    }

    try {
      const response = await fetch(`${this.API_BASE}/manage-blocked-dates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ date, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to add blocked date');
      }

      // Clear inputs
      dateInput.value = '';
      reasonInput.value = '';

      // Reload
      await this.loadBlockedDates();
      this.renderCalendar();

      alert('Date blocked successfully!');

    } catch (error) {
      console.error('Error adding blocked date:', error);
      alert('Failed to block date. Please try again.');
    }
  },

  // Remove blocked date
  async removeBlockedDate(id) {
    if (!confirm('Are you sure you want to unblock this date?')) {
      return;
    }

    try {
      const response = await fetch(`${this.API_BASE}/manage-blocked-dates`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove blocked date');
      }

      // Reload
      await this.loadBlockedDates();
      this.renderCalendar();

    } catch (error) {
      console.error('Error removing blocked date:', error);
      alert('Failed to remove blocked date. Please try again.');
    }
  },

  // Format date helper
  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  },
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  AdminDashboard.init();
});
