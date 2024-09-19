export function convertToMenuRoutes(pages: Routes): RouteInfo[] {
  const routeMap = new Map<string, { routeInfo: RouteInfo; pageData: RouteInfo }>();
  function processRoute(route: any) {
    if (route.data) {
      const pageData = route.data as RouteInfo;
      const routeInfo: RouteInfo = {
        id: pageData.id,
        level: pageData.level,
        title: pageData.title,
        icon: pageData.icon,
        open: pageData.open,
        selected: pageData.selected,
        disabled: pageData.disabled,
        roles: pageData.roles,
      };
      if ((route.path === 'dashboard' && pageData.level === 1) || (route.path !== 'dashboard' && pageData.level !== 1)) {
        routeInfo.path = [`/pages/${route.path}`];
      }
      routeMap.set(pageData.id, { routeInfo, pageData });
      if (pageData.parent && !routeMap.has(pageData.parent.id)) {
        const parentRouteInfo: RouteInfo = {
          id: pageData.parent.id,
          level: pageData.level! - 1,
          title: pageData.parent.title,
          icon: pageData.parent.icon,
          open: false,
          selected: false,
          disabled: false,
          roles: pageData.parent.roles,
        };
        routeMap.set(pageData.parent.id, {
          routeInfo: parentRouteInfo,
          pageData: pageData.parent,
        });
      }
    }
    if (route.children) {
      route.children.forEach(processRoute);
    }
  }
  pages.forEach(processRoute);
  routeMap.forEach(({ routeInfo, pageData }) => {
    if (pageData.parent) {
      const parentEntry = routeMap.get(pageData.parent.id);
      if (parentEntry) {
        if (!parentEntry.routeInfo.children) {
          parentEntry.routeInfo.children = [];
        }
        parentEntry.routeInfo.children.push(routeInfo);
      }
    }
  });

  return Array.from(routeMap.values())
    .filter(({ routeInfo }) => routeInfo.level === 1)
    .map(({ routeInfo }) => routeInfo);
}

export function convertSetupRoutesToMenuRoutes(setupRoutes: Routes): RouteInfo[] {
  function processSetupRoute(route: any): RouteInfo | null {
    if (!route.data) return null;
    const routeInfo: RouteInfo = {
      id: route.data.id,
      roles: route.data.roles,
      title: route.data.title,
      icon: route.data.icon,
      breadcrumb: route.data.breadcrumb,
      link: route.data.link,
      desc: route.data.desc,
      path: [`/setup/${route.path}`],
    };

    if (route.children) {
      routeInfo.children = route.children.map(processSetupRoute).filter((child): child is RouteInfo => child !== null);
    }
    return routeInfo;
  }
  return setupRoutes[0].children!.map(processSetupRoute).filter((route): route is RouteInfo => route !== null);
}
