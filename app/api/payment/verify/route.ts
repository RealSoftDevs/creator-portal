import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const prisma = new PrismaClient();

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
    
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    
    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id });
    
    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (generatedSignature !== razorpay_signature) {
      console.error('Signature mismatch');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid payment signature' 
      }, { status: 400 });
    }
    
    // Payment is valid - upgrade user to premium
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        isPremium: true,
        razorpayId: razorpay_payment_id 
      }
    });
    
    console.log('User upgraded to premium:', userId);
    
    return NextResponse.json({ 
      success: true, 
      isPremium: updatedUser.isPremium,
      message: 'Payment verified and premium activated!'
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Payment verification failed' 
    }, { status: 500 });
  }
}