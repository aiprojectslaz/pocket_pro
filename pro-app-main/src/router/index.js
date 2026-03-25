import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue';
import ProceduresList from '@/components/ProceduresList.vue';
import ProcedureItem from '@/components/ProcedureItem.vue';
import MainRoleItem from '@/components/MainRoleItem.vue';
import SubRolesItem from '@/components/SubRolesItem.vue';
import SubProcedureItem from '@/components/SubProcedureItem.vue';
import DefinitionItem from '@/components/DefinitionItem.vue';
import AppendixItem from '@/components/AppendixItem.vue';
import SearchResultsView from '@/views/SearchResultsView.vue';
import Quiz from '@/components/Quiz.vue';
import AdminDashboard from '@/views/AdminDashboard.vue';
import { getAuthState } from '@/utils/auth';
import Modal from '@/components/Modal.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/procedure-list',
    name: 'procedures-list',
    component: ProceduresList,
    meta: { requiresAuth: true },
  },
  {
    path: '/procedure/:id',
    name: 'procedure-item',
    component: ProcedureItem,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/mainRole/:id',
    name: 'mainRole-item',
    component: MainRoleItem,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/definition/:id',
    name: 'definition-item',
    component: DefinitionItem,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/appendix/:id',
    name: 'appendix-item',
    component: AppendixItem,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/subProcedure/:id',
    name: 'subProcedure-item',
    component: SubProcedureItem,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/subRole/:id',
    name: 'subRole-item',
    component: SubRolesItem,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/quizzes',
    name: 'quizzes',
    component: Quiz,
    meta: { requiresAuth: true },
  },
  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: () => import('../views/BookmarksView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/UsersView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },

  {
    path: '/search',
    name: 'search-results',
    component: SearchResultsView,
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('../views/ContactView.vue'),
  },
  {
    path: '/request-a-demo',
    name: 'request-a-demo',
    component: () => import('../views/RequestDemo.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('../views/TermsView.vue'),
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('../views/PrivacyView.vue'),
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, isAdmin: true },
  },
  {
    path: '/modal',
    name: 'modal',
    component: Modal,
    meta: { requiresAuth: true, isAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authState = getAuthState();

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authState.isLoggedIn) {
      next('/login');
    } else if (to.matched.some(record => record.meta.isAdmin) && !authState.isAdmin) {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
