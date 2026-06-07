describe('Payment Provider Registry', () => {
  let providers;

  beforeAll(() => {
    providers = require('../providers');
  });

  it('should load all provider modules', () => {
    const available = providers.getAvailableProviders();
    expect(available.length).toBeGreaterThanOrEqual(12);
  });

  it('should contain wave provider', () => {
    const wave = providers.getProvider('wave');
    expect(wave).toBeDefined();
    expect(wave.PROVIDER.name).toBe('wave');
    expect(wave.PROVIDER.label).toBe('Wave Business');
  });

  it('should contain orange provider', () => {
    const orange = providers.getProvider('orange');
    expect(orange).toBeDefined();
    expect(orange.PROVIDER.name).toBe('orange');
  });

  it('should contain free provider', () => {
    const free = providers.getProvider('free');
    expect(free).toBeDefined();
    expect(free.PROVIDER.name).toBe('free');
  });

  it('should contain paytech provider', () => {
    const paytech = providers.getProvider('paytech');
    expect(paytech).toBeDefined();
    expect(paytech.PROVIDER.name).toBe('paytech');
  });

  it('should contain senepay provider', () => {
    const senepay = providers.getProvider('senepay');
    expect(senepay).toBeDefined();
    expect(senepay.PROVIDER.name).toBe('senepay');
  });

  it('should contain intouch provider', () => {
    const intouch = providers.getProvider('intouch');
    expect(intouch).toBeDefined();
    expect(intouch.PROVIDER.name).toBe('intouch');
  });

  it('should contain cinetpay provider', () => {
    const cinetpay = providers.getProvider('cinetpay');
    expect(cinetpay).toBeDefined();
    expect(cinetpay.PROVIDER.name).toBe('cinetpay');
  });

  it('should contain flutterwave provider', () => {
    const flutterwave = providers.getProvider('flutterwave');
    expect(flutterwave).toBeDefined();
    expect(flutterwave.PROVIDER.name).toBe('flutterwave');
  });

  it('should contain fedapay provider', () => {
    const fedapay = providers.getProvider('fedapay');
    expect(fedapay).toBeDefined();
    expect(fedapay.PROVIDER.name).toBe('fedapay');
  });

  it('should contain kkiapay provider', () => {
    const kkiapay = providers.getProvider('kkiapay');
    expect(kkiapay).toBeDefined();
    expect(kkiapay.PROVIDER.name).toBe('kkiapay');
  });

  it('should contain julaya provider', () => {
    const julaya = providers.getProvider('julaya');
    expect(julaya).toBeDefined();
    expect(julaya.PROVIDER.name).toBe('julaya');
  });

  it('should contain paydunya provider', () => {
    const paydunya = providers.getProvider('paydunya');
    expect(paydunya).toBeDefined();
    expect(paydunya.PROVIDER.name).toBe('paydunya');
  });

  it('should have consistent interface for all providers', () => {
    const available = providers.getAvailableProviders();
    available.forEach(({ name }) => {
      const provider = providers.getProvider(name);
      expect(provider.processPayment).toBeDefined();
      expect(typeof provider.processPayment).toBe('function');
      expect(provider.verifyPayment).toBeDefined();
      expect(typeof provider.verifyPayment).toBe('function');
      expect(provider.isConfigured).toBeDefined();
      expect(typeof provider.isConfigured).toBe('function');
      expect(provider.PROVIDER).toBeDefined();
      expect(provider.PROVIDER.name).toBe(name);
      expect(provider.PROVIDER.label).toBeDefined();
      expect(provider.PROVIDER.fee).toBeDefined();
      expect(provider.PROVIDER.settlement).toBeDefined();
    });
  });

  it('should throw for unknown provider', () => {
    expect(() => providers.getProvider('unknown_provider_xyz')).toThrow();
  });

  it('should report isConfigured correctly (false when no API keys)', () => {
    const available = providers.getAvailableProviders();
    available.forEach(({ name }) => {
      const provider = providers.getProvider(name);
      if (name !== 'cash') {
        expect(provider.isConfigured()).toBe(false);
      }
    });
  });
});
