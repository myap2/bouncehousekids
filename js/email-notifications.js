// Email Notification System for My Bounce Place
class EmailNotificationSystem {
    constructor() {
        this.isEmailJSInitialized = false;
        this.serviceId = 'YOUR_EMAILJS_SERVICE_ID'; // Replace with your EmailJS service ID
        this.templateIds = {
            booking_confirmation: 'template_booking_confirmation',
            payment_confirmation: 'template_payment_confirmation',
            waiver_reminder: 'template_waiver_reminder',
            delivery_reminder: 'template_delivery_reminder'
        };
        this.businessEmail = 'noreply@mybounceplace.com';
        this.businessPhone = '(385) 288-8065';
        this.init();
    }

    init() {
        // Check if EmailJS is available
        if (typeof emailjs !== 'undefined') {
            this.isEmailJSInitialized = true;
            console.log('EmailJS is available for notifications');
        } else {
            console.warn('EmailJS not loaded - email notifications disabled');
        }

        // Listen for events
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for booking submissions
        document.addEventListener('bookingSubmitted', (e) => {
            this.sendBookingConfirmation(e.detail);
        });

        // Listen for payment completions
        document.addEventListener('paymentCompleted', (e) => {
            this.sendPaymentConfirmation(e.detail);
        });

        // Listen for waiver submissions
        document.addEventListener('waiverSubmitted', (e) => {
            this.sendWaiverConfirmation(e.detail);
        });
    }

    async sendBookingConfirmation(bookingData) {
        if (!this.isEmailJSInitialized) {
            console.log('EmailJS not available - storing email for manual sending');
            this.storeEmailForManualSending('booking_confirmation', bookingData);
            return;
        }

        const emailData = {
            to_email: bookingData.email,
            to_name: bookingData.name,
            from_name: 'My Bounce Place',
            booking_id: bookingData.id || 'PENDING',
            bounce_house: 'Bounce Castle with a Slide',
            event_date: bookingData.eventDate,
            event_time: bookingData.eventTime,
            event_location: bookingData.location,
            package: bookingData.package,
            price: bookingData.price,
            guest_count: bookingData.guests || 'Not specified',
            special_requests: bookingData.notes || 'None',
            business_phone: this.businessPhone,
            business_email: this.businessEmail,
            waiver_link: `${window.location.origin}/waiver-print.html`,
            setup_time: this.calculateSetupTime(bookingData.eventTime),
            space_requirements: '20ft x 20ft clear space required',
            weather_policy: 'Reschedule available for severe weather at no charge'
        };

        try {
            await emailjs.send(this.serviceId, this.templateIds.booking_confirmation, emailData);
            console.log('Booking confirmation email sent successfully');
            this.showEmailSuccess('Booking confirmation sent to ' + bookingData.email);
        } catch (error) {
            console.error('Failed to send booking confirmation:', error);
            this.showEmailError('Failed to send confirmation email. We will contact you directly.');
            this.storeEmailForManualSending('booking_confirmation', bookingData);
        }
    }

    async sendPaymentConfirmation(paymentData) {
        if (!this.isEmailJSInitialized) {
            this.storeEmailForManualSending('payment_confirmation', paymentData);
            return;
        }

        const bookingData = paymentData.booking;
        const paymentInfo = paymentData.payment;

        const emailData = {
            to_email: bookingData.email,
            to_name: bookingData.name,
            from_name: 'My Bounce Place',
            payment_id: paymentInfo.id,
            booking_id: bookingData.id || 'PENDING',
            amount_paid: `$${paymentInfo.amount.toFixed(2)}`,
            payment_option: paymentInfo.paymentOption,
            remaining_balance: paymentInfo.paymentOption === 'deposit' ? 
                `$${(parseFloat(bookingData.price.replace('$', '')) - paymentInfo.amount).toFixed(2)}` : '$0.00',
            event_date: bookingData.eventDate,
            event_time: bookingData.eventTime,
            bounce_house: 'Bounce Castle with a Slide',
            business_phone: this.businessPhone,
            delivery_instructions: 'We will contact you 24 hours before delivery to confirm details'
        };

        try {
            await emailjs.send(this.serviceId, this.templateIds.payment_confirmation, emailData);
            console.log('Payment confirmation email sent successfully');
            this.showEmailSuccess('Payment confirmation sent to ' + bookingData.email);
        } catch (error) {
            console.error('Failed to send payment confirmation:', error);
            this.showEmailError('Payment processed but confirmation email failed. Receipt saved locally.');
            this.storeEmailForManualSending('payment_confirmation', paymentData);
        }
    }

    async sendWaiverReminder(bookingData) {
        if (!this.isEmailJSInitialized) {
            this.storeEmailForManualSending('waiver_reminder', bookingData);
            return;
        }

        const emailData = {
            to_email: bookingData.email,
            to_name: bookingData.name,
            from_name: 'My Bounce Place',
            event_date: bookingData.eventDate,
            waiver_link: `${window.location.origin}/waiver-print.html`,
            business_phone: this.businessPhone
        };

        try {
            await emailjs.send(this.serviceId, this.templateIds.waiver_reminder, emailData);
            console.log('Waiver reminder email sent successfully');
        } catch (error) {
            console.error('Failed to send waiver reminder:', error);
            this.storeEmailForManualSending('waiver_reminder', bookingData);
        }
    }

    async sendDeliveryReminder(bookingData) {
        if (!this.isEmailJSInitialized) {
            this.storeEmailForManualSending('delivery_reminder', bookingData);
            return;
        }

        const emailData = {
            to_email: bookingData.email,
            to_name: bookingData.name,
            from_name: 'My Bounce Place',
            event_date: bookingData.eventDate,
            event_time: bookingData.eventTime,
            setup_time: this.calculateSetupTime(bookingData.eventTime),
            event_location: bookingData.location,
            business_phone: this.businessPhone,
            safety_reminder: 'Adult supervision required at all times during use',
            weather_check: 'Please check weather conditions - we will contact you if rescheduling is needed'
        };

        try {
            await emailjs.send(this.serviceId, this.templateIds.delivery_reminder, emailData);
            console.log('Delivery reminder email sent successfully');
        } catch (error) {
            console.error('Failed to send delivery reminder:', error);
            this.storeEmailForManualSending('delivery_reminder', bookingData);
        }
    }

    // Send business notification emails
    async sendBusinessNotification(type, data) {
        if (!this.isEmailJSInitialized) {
            this.storeBusinessNotification(type, data);
            return;
        }

        let emailData = {
            to_email: this.businessEmail,
            from_name: 'My Bounce Place Website',
            notification_type: type,
            timestamp: new Date().toLocaleString()
        };

        switch (type) {
            case 'new_booking':
                emailData = {
                    ...emailData,
                    customer_name: data.name,
                    customer_email: data.email,
                    customer_phone: data.phone,
                    event_date: data.eventDate,
                    event_time: data.eventTime,
                    event_location: data.location,
                    package: data.package,
                    price: data.price,
                    special_requests: data.notes || 'None'
                };
                break;

            case 'new_payment':
                emailData = {
                    ...emailData,
                    payment_id: data.payment.id,
                    amount: `$${data.payment.amount.toFixed(2)}`,
                    payment_type: data.payment.paymentOption,
                    customer_email: data.booking.email
                };
                break;

            case 'waiver_submitted':
                emailData = {
                    ...emailData,
                    participant_name: data.participantName,
                    guardian_name: data.guardianName,
                    guardian_email: data.guardianEmail
                };
                break;
        }

        try {
            await emailjs.send(this.serviceId, 'template_business_notification', emailData);
            console.log(`Business notification (${type}) sent successfully`);
        } catch (error) {
            console.error(`Failed to send business notification (${type}):`, error);
            this.storeBusinessNotification(type, data);
        }
    }

    calculateSetupTime(eventTime) {
        // Setup 1 hour before event time
        const eventHour = parseInt(eventTime.split(':')[0]);
        const setupHour = eventHour - 1;
        return `${setupHour}:00 ${setupHour >= 12 ? 'PM' : 'AM'}`;
    }

    storeEmailForManualSending(type, data) {
        const emails = JSON.parse(localStorage.getItem('pendingEmails') || '[]');
        emails.push({
            type,
            data,
            timestamp: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem('pendingEmails', JSON.stringify(emails));
    }

    storeBusinessNotification(type, data) {
        const notifications = JSON.parse(localStorage.getItem('businessNotifications') || '[]');
        notifications.push({
            type,
            data,
            timestamp: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem('businessNotifications', JSON.stringify(notifications));
    }

    showEmailSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'email-notification success';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✓</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showEmailError(message) {
        const notification = document.createElement('div');
        notification.className = 'email-notification error';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">⚠️</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 7000);
    }

    // Schedule automatic reminder emails
    scheduleReminderEmails(bookingData) {
        // In a real implementation, this would be handled by a server
        // For now, we'll store reminders to be checked manually
        const reminders = JSON.parse(localStorage.getItem('scheduledReminders') || '[]');
        
        const eventDate = new Date(bookingData.eventDate);
        const waiverReminderDate = new Date(eventDate);
        waiverReminderDate.setDate(eventDate.getDate() - 3); // 3 days before

        const deliveryReminderDate = new Date(eventDate);
        deliveryReminderDate.setDate(eventDate.getDate() - 1); // 1 day before

        reminders.push({
            bookingId: bookingData.id,
            reminders: [
                {
                    type: 'waiver_reminder',
                    scheduledFor: waiverReminderDate.toISOString(),
                    sent: false
                },
                {
                    type: 'delivery_reminder',
                    scheduledFor: deliveryReminderDate.toISOString(),
                    sent: false
                }
            ]
        });

        localStorage.setItem('scheduledReminders', JSON.stringify(reminders));
    }

    // Method to check and send scheduled reminders (would be called by a cron job)
    checkAndSendReminders() {
        const reminders = JSON.parse(localStorage.getItem('scheduledReminders') || '[]');
        const now = new Date();

        reminders.forEach(booking => {
            booking.reminders.forEach(reminder => {
                const scheduledDate = new Date(reminder.scheduledFor);
                if (!reminder.sent && now >= scheduledDate) {
                    // Get booking data and send reminder
                    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
                    const bookingData = bookings.find(b => b.id === booking.bookingId);
                    
                    if (bookingData) {
                        if (reminder.type === 'waiver_reminder') {
                            this.sendWaiverReminder(bookingData);
                        } else if (reminder.type === 'delivery_reminder') {
                            this.sendDeliveryReminder(bookingData);
                        }
                        reminder.sent = true;
                    }
                }
            });
        });

        localStorage.setItem('scheduledReminders', JSON.stringify(reminders));
    }
}

// Initialize email notification system
document.addEventListener('DOMContentLoaded', () => {
    window.emailNotificationSystem = new EmailNotificationSystem();
});