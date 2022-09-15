import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

import crmRouter from './modules/crm'
import pmRouter from './modules/pm'
import adminRouter from './modules/admin'
import userRouter from './modules/user'
import biRouter from './modules/bi'
import kcRouter from './modules/kchk'
import taskExamineRouter from './modules/taskExamine'
import workLogRouter from './modules/workLog'
import addressBookRouter from './modules/addressBook'
import calendarRouter from './modules/calendar'
import hrmRouter from './modules/hrm'
import kcglRouter from './modules/kcgl'
import warehouseRouter from './modules/warehouse'
import accountRouter from './modules/account'
import handleRouter from './modules/handle'
/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  userRouter,
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRouterMap
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}
import Layout from '@/views/layout/home'
const layout = function(meta = {}, path = '/home', requiresAuth = true) {
  return {
    path: path,
    component: Layout,
    meta: {
      // requiresAuth: requiresAuth,
      ...meta
    }
  }
}
export default router
export const asyncRouterMap = [
  { type: 'home', router: [{
    ...layout({
      permissions: ['home', 'system-project']
    }),
    meta: {
      title: 'OrderSetting.Orders',
      icon: 's-seas'
    },
    children: [
      {
        name: 'home',
        path: 'home', // 类目
        component: () => import('@/views/home'),
        meta: {
          title: '首页',
          icon: 'iconfont icon-31leimu'
        }
      }


    ]
  }] },
  { type: 'kchk', router: kcRouter },
  { type: 'crm', router: crmRouter },
  { type: 'taskExamine', router: taskExamineRouter },
  { type: 'workLog', router: workLogRouter },
  { type: 'addressBook', router: addressBookRouter },
  { type: 'project', router: pmRouter },
  { type: 'bi', router: biRouter },
  { type: 'calendar', router: calendarRouter },
  { type: 'hrm', router: hrmRouter },
  { type: 'manage', router: adminRouter },
  { type: 'kcgl', router: kcglRouter },
  { type: 'warehouse', router: warehouseRouter },
  { type: 'account', router: accountRouter },
  { type: 'handle', router: handleRouter }

]
// [{
//     ...layout({
//       permissions: ['handle', 'system-project']
//     }),
//     meta: {
//       title: 'OrderSetting.Orders',
//       icon: 's-seas'
//     },
//     children: [
//       {
//         name: 'handle',
//         path: 'handle', // 类目
//         component: () => import('@/views/kchk/handle'),
//         meta: {
//           title: '类目管理',
//           icon: 'iconfont icon-31leimu'
//         }
//       }


//     ]
//   }]
