if (!(globalThis as any)._memOrgs) (globalThis as any)._memOrgs = [];
if (!(globalThis as any)._memUsers) (globalThis as any)._memUsers = [];
if (!(globalThis as any)._memProds) (globalThis as any)._memProds = [];

export const db = {
  organization: {
    create: async ({ data }: any) => {
      const newOrg = { 
        id: 'org_' + Math.random().toString(36).substring(2, 11), 
        defaultThreshold: data.defaultThreshold || 5, 
        name: data.name || 'My Store'
      };
      (globalThis as any)._memOrgs.push(newOrg);
      return newOrg;
    },
    findUnique: async ({ where }: any) => {
      return (globalThis as any)._memOrgs.find((o: any) => o.id === where.id) || null;
    },
    update: async ({ where, data }: any) => {
      const list = (globalThis as any)._memOrgs;
      const idx = list.findIndex((o: any) => o.id === where.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data, defaultThreshold: parseInt(data.defaultThreshold) || 5 };
        return list[idx];
      }
      throw new Error('Org mapping not found');
    }
  },
  user: {
    findUnique: async ({ where }: any) => {
      return (globalThis as any)._memUsers.find((u: any) => u.email === where.email) || null;
    },
    create: async ({ data }: any) => {
      const newUser = { 
        id: 'usr_' + Math.random().toString(36).substring(2, 11), 
        email: data.email,
        passwordHash: data.passwordHash,
        organizationId: data.organizationId
      };
      (globalThis as any)._memUsers.push(newUser);
      return newUser;
    }
  },
  product: {
    findMany: async ({ where }: any) => {
      return (globalThis as any)._memProds.filter((p: any) => p.organizationId === where.organizationId);
    },
    findUnique: async ({ where }: any) => {
      const list = (globalThis as any)._memProds;
      const targetSku = where.organizationId_sku ? where.organizationId_sku.sku : where.sku;
      const targetOrg = where.organizationId_sku ? where.organizationId_sku.organizationId : where.organizationId;
      return list.find((p: any) => p.sku === targetSku && p.organizationId === targetOrg) || null;
    },
    findFirst: async ({ where }: any) => {
      return (globalThis as any)._memProds.find((p: any) => p.id === where.id && p.organizationId === where.organizationId) || null;
    },
    create: async ({ data }: any) => {
      const newProd = {
        id: 'prod_' + Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
        organizationId: data.organizationId,
        name: data.name,
        sku: data.sku,
        description: data.description || '',
        quantityOnHand: parseInt(data.quantityOnHand) || 0,
        costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
        sellingPrice: data.sellingPrice ? parseFloat(data.sellingPrice) : null,
        lowStockLimit: data.lowStockLimit ? parseInt(data.lowStockLimit) : null,
      };
      (globalThis as any)._memProds.push(newProd);
      return newProd;
    },
    update: async ({ where, data }: any) => {
      const list = (globalThis as any)._memProds;
      const idx = list.findIndex((p: any) => p.id === where.id);
      if (idx === -1) throw new Error('Product tracking record missing');
      list[idx] = {
        ...list[idx],
        ...data,
        quantityOnHand: data.quantityOnHand !== undefined ? parseInt(data.quantityOnHand) : list[idx].quantityOnHand,
        costPrice: data.costPrice !== undefined ? (data.costPrice ? parseFloat(data.costPrice) : null) : list[idx].costPrice,
        sellingPrice: data.sellingPrice !== undefined ? (data.sellingPrice ? parseFloat(data.sellingPrice) : null) : list[idx].sellingPrice,
        lowStockLimit: data.lowStockLimit !== undefined ? (data.lowStockLimit ? parseInt(data.lowStockLimit) : null) : list[idx].lowStockLimit,
      };
      return list[idx];
    },
    delete: async ({ where }: any) => {
      (globalThis as any)._memProds = (globalThis as any)._memProds.filter((p: any) => p.id !== where.id);
      return { success: true };
    }
  },
  $transaction: async (callback: (tx: any) => Promise<any>) => {
    return await callback(db);
  }
};