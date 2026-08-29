import { ProductServiceController } from './product-service.controller';

describe('ProductServiceController', () => {
  it('is defined', () => {
    const controller = new ProductServiceController({} as any);
    expect(controller).toBeDefined();
  });
});
