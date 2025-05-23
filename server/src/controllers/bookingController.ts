import { Request, Response } from 'express';
import Booking from '../models/Booking';
import BounceHouse from '../models/BounceHouse';
import User from '../models/User';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export const createBooking = async (req: Request, res: Response) => {
  try {
    const {
      bounceHouseId,
      startDate,
      endDate,
      deliveryAddress,
      deliveryInstructions,
      paymentMethodId
    } = req.body;

    // Check bounce house availability
    const bounceHouse = await BounceHouse.findById(bounceHouseId);
    if (!bounceHouse) {
      return res.status(404).json({ message: 'Bounce house not found' });
    }

    // Check if dates are available
    const isAvailable = !bounceHouse.availability.some(booking => {
      return (
        (new Date(startDate) <= new Date(booking.endDate)) &&
        (new Date(endDate) >= new Date(booking.startDate))
      );
    });

    if (!isAvailable) {
      return res.status(400).json({ message: 'Selected dates are not available' });
    }

    // Calculate total price
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * bounceHouse.price.daily;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      customer: req.user.stripeCustomerId
    });

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      bounceHouse: bounceHouseId,
      startDate,
      endDate,
      totalPrice,
      deliveryAddress,
      deliveryInstructions,
      paymentStatus: 'paid',
      paymentMethod: {
        type: 'card',
        last4: paymentIntent.payment_method_details?.card?.last4 || ''
      }
    });

    // Update bounce house availability
    bounceHouse.availability.push({
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    await Promise.all([booking.save(), bounceHouse.save()]);

    // Update user's bookings
    await User.findByIdAndUpdate(req.user._id, {
      $push: { bookings: booking._id }
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Error creating booking' });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('bounceHouse')
      .sort({ startDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('bounceHouse');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking' });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking can be cancelled (e.g., not too close to start date)
    const daysUntilStart = Math.ceil((new Date(booking.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilStart < 2) {
      return res.status(400).json({ message: 'Booking cannot be cancelled within 48 hours of start date' });
    }

    // Process refund if payment was made
    if (booking.paymentStatus === 'paid') {
      await stripe.refunds.create({
        payment_intent: booking.paymentIntentId
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancellationReason = req.body.reason;
    await booking.save();

    // Update bounce house availability
    await BounceHouse.findByIdAndUpdate(booking.bounceHouse, {
      $pull: {
        availability: {
          startDate: booking.startDate,
          endDate: booking.endDate
        }
      }
    });

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Error cancelling booking' });
  }
}; 