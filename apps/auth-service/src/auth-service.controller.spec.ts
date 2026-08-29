import { AuthServiceController } from './auth-service.controller';

describe('AuthServiceController', () => {
  it('is defined', () => {
    const controller = new AuthServiceController({} as any);
    expect(controller).toBeDefined();
  });
});
