import { Injectable } from '@nestjs/common';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { ConfigService } from '@nestjs/config';
import { Transaction } from '@mysten/sui/transactions';
import { fromB64 } from '@mysten/sui/utils';
import { bcs } from '@mysten/sui/bcs';

@Injectable()
export class SuiService {
  private client: SuiClient;
  private keypair: Ed25519Keypair;

  constructor(private configService: ConfigService) {
    this.client = new SuiClient({
      url: this.configService.get<string>('SUI_RPC_URL') || getFullnodeUrl('testnet'),
    });

    // 从环境变量加载私钥
    const privateKey = this.configService.get<string>('SUI_PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('SUI_PRIVATE_KEY environment variable is not set');
    }
    try {
      const base64Key = privateKey;
      const keyBuffer = Buffer.from(base64Key, 'base64');
      const privKey = keyBuffer.slice(1, 33); // 取后32字节
      this.keypair = Ed25519Keypair.fromSecretKey(privKey);
    } catch (error) {
      throw new Error(`Failed to initialize keypair: ${error.message}`);
    }
  }

  // 获取账户余额
  private async getBalance(): Promise<bigint> {
    try {
      const address = this.keypair.toSuiAddress();
      const coins = await this.client.getBalance({
        owner: address,
        coinType: '0x2::sui::SUI'
      });
      return BigInt(coins.totalBalance);
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  // 检查 gas 是否足够
  private async checkGasBalance(): Promise<void> {
    const balance = await this.getBalance();
    const minGas = BigInt(1000000); // 最小 gas 要求（可以根据需要调整）
    
    if (balance < minGas) {
      throw new Error(`Insufficient gas balance. Required: ${minGas}, Available: ${balance}`);
    }
  }

  async createShareOnChain(content: string, title: string, userId: number) {
    try {
      // 1. 检查 gas 余额
      await this.checkGasBalance();

      // 2. 输入验证
      if (!title || !content) {
        throw new Error('Title and content cannot be empty');
      }

      // 3. 清理输入数据并过滤无效字符
      const cleanTitle = title.trim()
        .replace(/[^\x20-\x7E\u0080-\uFFFF]/g, '') // 只保留可打印字符和基本多语言平面字符
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // 移除控制字符

      const cleanContent = content.trim()
        .replace(/[^\x20-\x7E\u0080-\uFFFF]/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

      // 4. 使用更安全的编码方式
      const encoder = new TextEncoder();
      let titleBytes: Uint8Array;
      let contentBytes: Uint8Array;

      try {
        titleBytes = encoder.encode(cleanTitle);
        contentBytes = encoder.encode(cleanContent);
      } catch (error) {
        throw new Error('Failed to encode title or content: ' + error.message);
      }

      // 5. 添加大小限制检查
      if (titleBytes.length > 1000) {
        throw new Error('Title size exceeds limit (1000 bytes)');
      }
      if (contentBytes.length > 10000) {
        throw new Error('Content size exceeds limit (10000 bytes)');
      }

      const tx = new Transaction();
      
      // 首先获取 ShareCollection 对象
      const collection = await this.client.getObject({
        id: this.configService.get<string>('SUI_SHARE_COLLECTION_ID'),
        options: { showContent: true }
      });

      // 获取 Clock 对象
      const clock = await this.client.getObject({
        id: '0x6',
        options: { showContent: true }
      });

      // 6. 确保字节数组是有效的
      if (!titleBytes || !contentBytes || titleBytes.length === 0 || contentBytes.length === 0) {
        throw new Error('Invalid byte array generated for title or content');
      }

      // 7. 序列化数据
      const serializedTitle = bcs.vector(bcs.u8()).serialize(Array.from(titleBytes));
      const serializedContent = bcs.vector(bcs.u8()).serialize(Array.from(contentBytes));

      tx.moveCall({
        target: `${this.configService.get<string>('SUI_PACKAGE_ID')}::share::create_share`,
        arguments: [
          tx.object(collection.data.objectId),
          tx.pure(serializedTitle),
          tx.pure(serializedContent),
          tx.object(clock.data.objectId),
        ],
        typeArguments: [],
      });

      const result = await this.client.signAndExecuteTransaction({
        transaction: tx,
        signer: this.keypair,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      return result;
    } catch (error) {
      // 9. 改进错误处理
      if (error.message.includes('No valid gas coins found')) {
        throw new Error('No valid gas coins found. Please ensure your account has sufficient SUI tokens.');
      }
      if (error.message.includes('InvalidBCSBytes')) {
        throw new Error('Invalid character encoding in title or content. Please check for special characters.');
      }
      throw new Error(`Failed to create share on chain: ${error.message}`);
    }
  }
} 