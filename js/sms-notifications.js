// SMS Notifications for Booking Requests
class SMSNotifications {
    constructor() {
        this.phoneNumber = '+13852888065'; // Your business phone number
        this.setupSMSNotifications();
    }

    setupSMSNotifications() {
        // Listen for booking submissions
        document.addEventListener('bookingSubmitted', (e) => {
            this.sendSMSNotification(e.detail);
        });
    }

    async sendSMSNotification(bookingData) {
        try {
            // Option 1: Using Twilio (requires backend)
            await this.sendViaTwilio(bookingData);
            
            // Option 2: Using email-to-SMS gateway
            await this.sendViaEmailSMS(bookingData);
            
        } catch (error) {
            console.error('SMS notification failed:', error);
        }
    }

    async sendViaTwilio(bookingData) {
        // This requires a backend server with Twilio
        const response = await fetch('/api/send-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: this.phoneNumber,
                message: this.formatSMSMessage(bookingData)
            })
        });

        if (!response.ok) {
            throw new Error('SMS sending failed');
        }
    }

    async sendViaEmailSMS(bookingData) {
        // Send email to SMS gateway (e.g., Verizon: 1234567890@vtext.com)
        const emailData = {
            to: 'YOUR_PHONE@vtext.com', // Replace with your carrier's SMS gateway
            subject: 'New Booking Request',
            message: this.formatSMSMessage(bookingData)
        };

        // Use EmailJS to send to SMS gateway
        if (typeof emailjs !== 'undefined') {
            return emailjs.send(
                'YOUR_EMAILJS_SERVICE_ID',
                'YOUR_SMS_TEMPLATE_ID',
                emailData
            );
        }
    }

    formatSMSMessage(bookingData) {
        return `New Booking: ${bookingData.name} - ${bookingData.eventDate} ${bookingData.eventTime} - ${bookingData.package} - ${bookingData.phone}`;
    }
}

// Initialize SMS notifications
document.addEventListener('DOMContentLoaded', () => {
    window.smsNotifications = new SMSNotifications();
});