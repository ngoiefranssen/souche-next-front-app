/**
 * CSRF Token API Endpoint
 *
 * This endpoint generates and returns a CSRF token for client-side use.
 * The token is stored in a non-httpOnly cookie so JavaScript can read it
 * and include it in request headers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET(_request: NextRequest) {
  try {
    // Generate a random CSRF token
    const token = randomBytes(32).toString('hex');

    // Create response with token
    const response = NextResponse.json(
      {
        token,
        message: 'CSRF token generated successfully',
      },
      { status: 200 }
    );

    // Set CSRF token in cookie (non-httpOnly so JavaScript can read it)
    response.cookies.set('csrf-token', token, {
      httpOnly: false, // Must be false so JavaScript can read it
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // Strict CSRF protection
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('[CSRF API] Error generating token:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate CSRF token',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
