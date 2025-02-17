import { DataSource } from 'typeorm';
import { AppSettings, AppModule } from './src';

export default new DataSource(AppModule.getOrmConfigMigration(new AppSettings()) as any);