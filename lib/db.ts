import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'database.json');

if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, JSON.stringify({ organizations: [], users: [], products: [] }, null, 2));
}

function readData() {
  return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
}

function writeData(data: any) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

export const db = {
  organization: {
    create: async ({ data }: any) => {
      const store = readData();
      const newOrg = { id: 'org_' + Math.random().toString(36).substr(2, 9), defaultThreshold: data.defaultThreshold || 5, ...data };
      store.organizations.push(newOrg);
      writeData(store);
      return newOrg;
    },
    findUnique: async ({ where }: any) => {
      const store = readData();
      return store.organizations.find((o: any) => o.id === where.id) || null;
    },
    update: async ({ where, data }: any) => {
      const store = readData();
      const idx = store.organizations.findIndex((o: any) => o.id === where.id);
      if (idx === -1) throw new Error('Not found');
      store.organizations[idx] = { ...store.organizations[idx], ...data, defaultThreshold: parseInt(data.defaultThreshold) };
      writeData(store);
      return store.organizations[idx];
    }
  },
  user: {
    findUnique: async ({ where }: any) => {
      const store = readData();
      return store.users.find((u: any) => u.email === where.email) || null;
    },
    create: async ({ data }: any) => {
      const store = readData();
      const newUser = { id: 'usr_' + Math.random().toString(36).substr(2, 9), ...data };
      store.users.push(newUser);
      writeData(store);
      return newUser;
    }
  },
  product: {
    findMany: async ({ where }: any) => {
      const store = readData();
      let results = store.products.filter((p: any) => p.organizationId === where.organizationId);
      return results;
    },
    findUnique: async ({ where }: any) => {
      const store = readData();
      const targetSku = where.organizationId_sku ? where.organizationId_sku.sku : where.sku;
      const targetOrg = where.organizationId_sku ? where.organizationId_sku.organizationId : where.organizationId;
      return store.products.find((p: any) => p.sku === targetSku && p.organizationId === targetOrg) || null;
    },
    findFirst: async ({ where }: any) => {
      const store = readData();
      return store.products.find((p: any) => p.id === where.id && p.organizationId === where.organizationId) || null;
    },
    create: async ({ data }: any) => {
      const store = readData();
      const newProd = {
        id: 'prod_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        ...data,
        quantityOnHand: parseInt(data.quantityOnHand) || 0,
        costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
        sellingPrice: data.sellingPrice ? parseFloat(data.sellingPrice) : null,
        lowStockLimit: data.lowStockLimit ? parseInt(data.lowStockLimit) : null,
      };
      store.products.push(newProd);
      writeData(store);
      return newProd;
    },
    update: async ({ where, data }: any) => {
      const store = readData();
      const idx = store.products.findIndex((p: any) => p.id === where.id);
      if (idx === -1) throw new Error('Not found');
      store.products[idx] = {
        ...store.products[idx],
        ...data,
        quantityOnHand: data.quantityOnHand !== undefined ? parseInt(data.quantityOnHand) : store.products[idx].quantityOnHand,
        costPrice: data.costPrice !== undefined ? (data.costPrice ? parseFloat(data.costPrice) : null) : store.products[idx].costPrice,
        sellingPrice: data.sellingPrice !== undefined ? (data.sellingPrice ? parseFloat(data.sellingPrice) : null) : store.products[idx].sellingPrice,
        lowStockLimit: data.lowStockLimit !== undefined ? (data.lowStockLimit ? parseInt(data.lowStockLimit) : null) : store.products[idx].lowStockLimit,
      };
      writeData(store);
      return store.products[idx];
    },
    delete: async ({ where }: any) => {
      const store = readData();
      store.products = store.products.filter((p: any) => p.id !== where.id);
      writeData(store);
      return { success: true };
    }
  },
  
  $transaction: async (callback: (tx: any) => Promise<any>) => {
    return await callback(db);
  }
};