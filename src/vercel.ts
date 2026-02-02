import './common/utils/crypto-shim';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './common/utils/app-config.util';
import type { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';

const expressApp = express();

let app: NestExpressApplication;

const bootstrap = async () => {
    if (!app) {
        app = await NestFactory.create<NestExpressApplication>(
            AppModule,
            new ExpressAdapter(expressApp),
        );
        configureApp(app);
        await app.init();
    }
    return app;
};

export default async function (req: any, res: any) {
    await bootstrap();
    expressApp(req, res);
}
