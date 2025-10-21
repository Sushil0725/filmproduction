export const sidebarSections = [
  {
    title: 'Analytics',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: 'chart' },
      { id: 'mediactrl', label: 'Media Control', href: '/admin/mediactrl', icon: 'home' },
    
    ]
  },
  {
    title: 'Management',
    items: [
      { id: 'heromng', label: 'Hero Manager', href: '/admin/heromng', icon: 'app' },
      { id: 'servicemng', label: 'Services Manager', href: '/admin/servicemng', icon: 'services' },
      { id: 'projectmng', label: 'Projects Manager', href: '/admin/projectmng', icon: 'box' },
      { id: 'gallerymng', label: 'Gallery Manager', href: '/admin/gallerymng', icon: 'book' },
      { id: 'newsmng', label: 'News Manager', href: '/admin/newsmng', icon: 'news' },

    ]
  },
  {
    title: 'Setting',
    items: [
      { id: 'setting', label: 'Settings', href: '/admin/setting', icon: 'settings' }
    ]
  }
];

export const organization = {
  name: 'MB pictures',
  plan: 'Enterprise'
};

