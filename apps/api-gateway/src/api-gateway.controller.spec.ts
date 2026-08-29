import { ApiGatewayController } from './api-gateway.controller';

describe('ApiGatewayController', () => {
  it('is defined', () => {
    const controller = new ApiGatewayController({} as any, {} as any, {} as any);
    expect(controller).toBeDefined();
  });
});
