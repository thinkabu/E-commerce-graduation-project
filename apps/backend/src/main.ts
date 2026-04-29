import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors();

  // Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ fields không có trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu gửi field lạ
      transform: true, // Tự động transform types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Response Interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription(
      'Mobile E-commerce API with Blockchain Payment & AI Recommendation',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
