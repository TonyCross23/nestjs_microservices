import { OrderServiceController } from './order-service.controller';

describe('OrderServiceController', () => {
  it('is defined', () => {
    const controller = new OrderServiceController({} as any);
    expect(controller).toBeDefined();
  });
});
