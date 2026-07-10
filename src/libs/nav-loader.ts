import { NAV_DATA } from '../../content/nav';

export interface NavSite {
  title: string;
  icon?: string | { svg: string };
  description?: string;
  url: string;
  badge?: string;
}

export interface NavCategory {
  key: string;
  label: string;
  sites: NavSite[];
}

export async function getAllNavSites(): Promise<NavCategory[]> {
  return NAV_DATA.map((group) => ({
    key: group.title,
    label: group.title,
    sites: group.items.map((item) => ({
      title: item.title,
      icon: item.icon as NavSite['icon'],
      description: item.desc,
      url: item.link,
      badge: item.badge,
    })),
  }));
}
