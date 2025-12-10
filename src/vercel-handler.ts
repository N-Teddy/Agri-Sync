import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Request, Response } from 'express';

import { AppModule } from './app.module';
import { configureApp } from './common/utils/app-config.util';

let nestApp: INestApplication | null = null;
let expressInstance: any = null;

async function bootstrapOnce(): Promise<void> {
    if (nestApp) return;
    nestApp = await NestFactory.create(AppModule, { logger: false });
    const configService = configureApp(nestApp);
    // initialize but do not listen (serverless)
    await nestApp.init();
    expressInstance = (nestApp.getHttpAdapter() as any).getInstance();
}

export default async function vercelHandler(req: Request, res: Response) {
    await bootstrapOnce();
    return expressInstance(req, res);
}
