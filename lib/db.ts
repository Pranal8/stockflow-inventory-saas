// Define global in-memory tables that bypass Vercel's read-only disk restriction
const globalStorage = globalThis as unknown as {
  _dbOrganizations: any[];
  _dbUsers: any[];
  _dbProducts: any[];
};

// Initialize in-memory arrays if they don't exist in this execution context
if (!globalStorage._dbOrganizations) globalStorage._dbOrganizations = [];
if (!globalStorage._dbUsers) globalStorage._dbUsers = [];
if (!globalStorage._dbProducts) globalStorage._dbProducts = [];

// Helper functions that access our rapid, live-RAM storage layer
function getOrganizations() { return globalStorage._dbOrganizations; }
function getUsers() { return globalStorage._dbUsers; }
function getProducts() { return globalStorage._dbProducts; }

export const db = {
  organization: {
    create: async ({ data }: any) => {
      const newOrg = { 
        id: 'org_' + Math.random().toString(36).substr(2, 9), 
        defaultThreshold: data.defaultThreshold || 5, 
        ...data 
      };
      globalStorage._dbOrganizations.push(newOrg);
      return newOrg;
    },
    findUnique: async ({ where }: any) => {
      return getOrganizations().find((o: any) => o.id === where.id) || null;
    },
    update: async ({ where, data }: any) => {
      const orgs = getOrganizations();
      const idx = orgs.findIndex((o: any) => o.id === where.id);
      if (idx === -1) throw new Error('Not found');
      orgs[idx] = { ...orgs[idx], ...data, defaultThreshold: parseInt(data.defaultThreshold) };
      return orgs[idx];
    }
  },
  user: {
    findUnique: async ({ where }: any) => {
      return getUsers().find((u: any) => u.email === where.email) || null;
    },
    create: async ({ data }: any) => {
      const newUser = { id: 'usr_' + Math.random().toString(36).substr(2, 9), ...data };
      globalStorage._dbUsers.push(newUser);
      return newUser;
    }
  },
  product: {
    findMany: async ({ where }: any) => {
      return getProducts().filter((p: any) => p.organizationId === where.organizationId);
    },
    findUnique: async ({ where }: any) => {
      const targetSku = where.organizationId_sku ? where.organizationId_sku.sku : where.sku;
      const targetOrg = where.organizationId_sku ? where.organizationId_sku.organizationId : where.organizationId;
      return getProducts().find((p: any) => p.sku === targetSku && p.organizationId === targetOrg) || null;
    },
    findFirst: async ({ where }: any) => {
      return getProducts().find((p: any) => p.id === where.id && p.organizationId === where.organizationId) || null;
    },
    create: async ({ data }: any) => {
      const newProd = {
        id: 'prod_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        ...data,
        quantityOnHand: parseInt(data.quantityOnHand) || 0,
        costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
        sellingPrice: data.sellingPrice ? parseFloat(data.sellingPrice) : null,
        lowStockLimit: data.lowStockLimit ? parseInt(data.lowStockLimit) : null,
      };
      globalStorage._dbProducts.push(newProd);
      return newProd;
    },
    update: async ({ where, data }: any) => {
      const prods = getProducts();
      const idx = prods.findIndex((p: any) => p.id === where.id);
      if (idx === -1) throw new Error('Not found');
      prods[idx] = {
        ...prods[idx],
        ...data,
        quantityOnHand: data.quantityOnHand !== undefined ? parseInt(data.quantityOnHand) : prods[idx].quantityOnHand,
        costPrice: data.costPrice !== undefined ? (data.costPrice ? parseFloat(data.costPrice) : null) : prods[idx].costPrice,
        sellingPrice: data.sellingPrice !== undefined ? (data.sellingPrice ? parseFloat(data.sellingPrice) : null) : prods[idx].sellingPrice,
        lowStockLimit: data.lowStockLimit !== undefined ? (data.lowStockLimit ? parseInt(data.lowStockLimit) : null) : prods[idx].lowStockLimit,
      };
      return prods[idx];
    },
    delete: async ({ where }: any) => {
      globalStorage._dbProducts = globalStorage._dbProducts.filter((p: any) => p.id !== where.id);
      return { success: true };
    }
  },
  
  $transaction: async (callback: (tx: any) => Promise<any>) => {
    return await callback(db);
  }
};