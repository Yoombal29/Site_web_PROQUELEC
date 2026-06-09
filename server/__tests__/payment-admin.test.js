describe('Payment Admin Routes', () => {
  it('should load payment admin routes module', () => {
    const adminRoutes = require('../modules/payments/payments.admin.routes');
    expect(adminRoutes).toBeDefined();
    expect(adminRoutes.router).toBeDefined();
    expect(adminRoutes.basePath).toBe('/api');
  });

  it('should validate providers list from registry', () => {
    const providers = require('../modules/payments/providers');
    const available = providers.getAvailableProviders();
    expect(available.length).toBeGreaterThanOrEqual(12);
    const names = available.map((p) => p.name);
    expect(names).toContain('paydunya');
    expect(names).toContain('wave');
    expect(names).toContain('orange');
    // cash is not in the API registry (UI-only pseudo-provider)
  });

  it('should have consistent provider metadata', () => {
    const providers = require('../modules/payments/providers');
    const available = providers.getAvailableProviders();
    available.forEach(({ name, label }) => {
      expect(name).toBeTruthy();
      expect(label).toBeTruthy();
      const provider = providers.getProvider(name);
      expect(provider.PROVIDER.fee).toBeTruthy();
      expect(provider.PROVIDER.settlement).toBeTruthy();
      expect(provider.PROVIDER.target).toBeTruthy();
    });
  });
});
