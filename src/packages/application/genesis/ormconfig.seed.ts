import { DataSource } from 'typeorm';
import { AppSettings, AppModule } from './src';

export default new DataSource(AppModule.getOrmConfig(new AppSettings()) as any);




