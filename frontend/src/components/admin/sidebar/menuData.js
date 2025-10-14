export const sidebarSections = [
  {
    title: 'Management',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: 'chart' },
      { id: 'playground', label: 'Hero Manager', href: '/admin/playground', icon: 'app' },
      { id: 'history', label: 'Services Manager', href: '/admin/history', icon: 'services' },
      { id: 'starred', label: 'Projects Manager', href: '/admin/starred', icon: 'products' },
      { id: 'settings', label: 'News Manager', href: '/admin/settings', icon: 'news' },
      { id: 'admin', label: 'Admin', href: '/admin/admin', icon: 'admin' },
      { id: 'home', label: 'Home', href: '/admin/home', icon: 'home' },
      { id: 'menu', label: 'Menu', href: '/admin/menu', icon: 'menu' }
    ]
  },
  {
    title: 'Settings',
    items: [
      { id: 'models', label: 'Settings', href: '/admin/models', icon: 'box' }
    ]
  },
  {
    title: 'Media Manager',
    items: [
      { id: 'docs', label: 'Dashboard', href: '/admin/docs', icon: 'book' }
    ]
  }
];

export const organization = {
  name: 'MB pictures',
  plan: 'Enterprise'
};

