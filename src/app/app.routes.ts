import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // Products
  {
    path: 'products',
    loadComponent: () => import('./pages/products/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'products/create',
    loadComponent: () => import('./pages/products/product-create/product-create.component').then(m => m.ProductCreateComponent)
  },
  {
    path: 'products/edit/:id',
    loadComponent: () => import('./pages/products/product-edit/product-edit.component').then(m => m.ProductEditComponent)
  },
  {
    path: 'products/details/:id',
    loadComponent: () => import('./pages/products/product-details/product-details').then(m => m.ProductDetails)
  },
  {
    path: 'products/:productId/inventory',
    loadComponent: () => import('./pages/inventory/inventory').then(m => m.InventoryComponent)
  },

  // Customers
  {
    path: 'customers',
    loadComponent: () => import('./pages/customers/customer-list/customer-list.component').then(m => m.CustomerListComponent)
  },
  {
    path: 'customers/create',
    loadComponent: () => import('./pages/customers/customer-create/customer-create.component').then(m => m.CustomerCreateComponent)
  },
  {
    path: 'customers/edit/:id',
    loadComponent: () => import('./pages/customers/customer-edit/customer-edit.component').then(m => m.CustomerEditComponent)
  },
  {
    path: 'customers/details/:id',
    loadComponent: () => import('./pages/customers/customer-details/customer-details').then(m => m.CustomerDetails)
  },

  // Sales Persons
  {
    path: 'sales-persons',
    loadComponent: () => import('./pages/sales-persons/sales-person-list/sales-person-list.component').then(m => m.SalesPersonListComponent)
  },
  {
    path: 'sales-persons/create',
    loadComponent: () => import('./pages/sales-persons/sales-person-create-edit/sales-person-create-edit.component').then(m => m.SalesPersonCreateEditComponent)
  },
  {
    path: 'sales-persons/edit/:id',
    loadComponent: () => import('./pages/sales-persons/sales-person-create-edit/sales-person-create-edit.component').then(m => m.SalesPersonCreateEditComponent)
  },
  {
    path: 'sales-persons/details/:id',
    loadComponent: () => import('./pages/sales-persons/sales-person-details/sales-person-details.component').then(m => m.SalesPersonDetailsComponent)
  },

  // Orders
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/order-list/order-list.component').then(m => m.OrderListComponent)
  },
  {
    path: 'orders/create',
    loadComponent: () => import('./pages/orders/order-create/order-create.component').then(m => m.OrderCreateComponent)
  },
  {
    path: 'orders/edit/:id',
    loadComponent: () => import('./pages/orders/order-edit/order-edit.component').then(m => m.OrderEditComponent)
  },
  {
    path: 'orders/details/:id',
    loadComponent: () => import('./pages/orders/order-details/order-details').then(m => m.OrderDetails)
  },

  // Expenses
  {
    path: 'expenses',
    loadComponent: () => import('./pages/expenses/expense-list/expense-list').then(m => m.ExpenseList)
  },
  {
    path: 'expenses/create',
    loadComponent: () => import('./pages/expenses/expense-create/expense-create').then(m => m.ExpenseCreate)
  },
  {
    path: 'expenses/edit/:id',
    loadComponent: () => import('./pages/expenses/expense-edit/expense-edit').then(m => m.ExpenseEdit)
  },
  {
    path: 'expenses/details/:id',
    loadComponent: () => import('./pages/expenses/expense-details/expense-details').then(m => m.ExpenseDetails)
  },

  // Insights
  {
    path: 'insights',
    loadComponent: () => import('./pages/insights/insights.component').then(m => m.InsightsComponent),
    children: [
      { path: '', redirectTo: 'top-customers', pathMatch: 'full' },
      {
        path: 'top-customers',
        loadComponent: () => import('./pages/insights/top-customers/top-customers.component').then(m => m.TopCustomersComponent)
      },
      {
        path: 'top-products',
        loadComponent: () => import('./pages/insights/top-products/top-products.component').then(m => m.TopProductsComponent)
      },
      {
        path: 'monthly-sales',
        loadComponent: () => import('./pages/insights/monthly-sales/monthly-sales.component').then(m => m.MonthlySalesComponent)
      }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '/dashboard' }
];
