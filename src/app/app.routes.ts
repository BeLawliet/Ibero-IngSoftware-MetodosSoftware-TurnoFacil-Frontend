import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then(({ LoginPage }) => LoginPage),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/authenticated-shell/authenticated-shell').then(
        ({ AuthenticatedShell }) => AuthenticatedShell,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then(
            ({ DashboardPage }) => DashboardPage,
          ),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clients/pages/clients/clients').then(({ ClientsPage }) => ClientsPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
