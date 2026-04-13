import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Initialize Razorpay with test keys
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    
    // Generate a short receipt ID (max 40 characters)
    const shortReceipt = `prem_${userId.slice(-8)}_${Date.now().toString().slice(-6)}`;
    
    const options = {
      amount: 5000, // ₹50 in INR
      currency: 'INR',
      receipt: shortReceipt,
      notes: {
        userId: userId,
        plan: 'premium'
      }
    };
    
    console.log('Creating order with receipt:', shortReceipt);
    
    const order = await razorpay.orders.create(options);
    
    console.log('Order created:', order.id);
    
    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ 
      error: 'Failed to create order. Please check your Razorpay test keys.' 
    }, { status: 500 });
  }
}