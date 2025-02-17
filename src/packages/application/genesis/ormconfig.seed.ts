import { DataSource } from 'typeorm';
import { AppSettings, AppModule } from './src';

export default new DataSource(AppModule.getOrmConfigSeed(new AppSettings()) as any);




