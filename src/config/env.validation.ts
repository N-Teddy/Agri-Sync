import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
	NODE_ENV: Joi.string()
		.valid('development', 'test', 'production')
		.default('development'),
	PORT: Joi.number().default(3000),
	API_BASE_PATH: Joi.string().default('api/v1'),
	CORS_ORIGIN: Joi.string().default('*'),

	DATABASE_URL: Joi.string().required(),

	SUPABASE_URL: Joi.string().required(),
	SUPABASE_ANON_KEY: Joi.string().required(),
	SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
	SUPABASE_JWT_SECRET: Joi.string().required(),

	WEATHER_PROVIDER: Joi.string().valid('openweather').default('openweather'),
	OPENWEATHER_API_KEY: Joi.string().required(),

	EMAIL_PROVIDER: Joi.string().valid('maildev', 'gmail').default('maildev'),
	SMTP_HOST: Joi.string().required(),
	SMTP_PORT: Joi.number().required(),
	SMTP_USER: Joi.string().allow('', null),
	SMTP_PASS: Joi.string().allow('', null),
	EMAIL_FROM: Joi.string().required(),

	STORAGE_PROVIDER: Joi.string()
		.valid('local', 'cloudinary')
		.default('local'),
	LOCAL_UPLOAD_DIR: Joi.string().default('uploads'),
	CLOUDINARY_CLOUD_NAME: Joi.when('STORAGE_PROVIDER', {
		is: 'cloudinary',
		then: Joi.string().required(),
		otherwise: Joi.string().optional(),
	}),
	CLOUDINARY_API_KEY: Joi.when('STORAGE_PROVIDER', {
		is: 'cloudinary',
		then: Joi.string().required(),
		otherwise: Joi.string().optional(),
	}),
	CLOUDINARY_API_SECRET: Joi.when('STORAGE_PROVIDER', {
		is: 'cloudinary',
		then: Joi.string().required(),
		otherwise: Joi.string().optional(),
	}),
}).unknown(true);
