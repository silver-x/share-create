import { NextResponse } from 'next/server';
import { verifyPersonalMessage } from '@mysten/sui.js/verify';
import { fromB64 } from '@mysten/sui.js/utils';
import { userApi } from '@/api';

export async function POST(request: Request) {
  try {
    const { address, message, signature } = await request.json();

    if (!address || !message || !signature) {
      return NextResponse.json(
        { message: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证签名
    const isValid = await verifyPersonalMessage({
      message: new TextEncoder().encode(message),
      signature: fromB64(signature),
      publicKey: address,
      scheme: 'ED25519',
    });

    if (!isValid) {
      return NextResponse.json(
        { message: '签名验证失败' },
        { status: 401 }
      );
    }

    // 调用后端API进行登录
    const response = await userApi.suiLogin({
      address,
      message,
      signature,
    });

    if (response.data?.data?.token) {
      return NextResponse.json({
        data: response.data.data,
      });
    } else {
      return NextResponse.json(
        { message: '登录失败' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('SUI钱包登录失败:', error);
    return NextResponse.json(
      { message: error.message || '登录失败' },
      { status: 500 }
    );
  }
} 